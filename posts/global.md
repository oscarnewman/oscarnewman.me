---
title: Bad idea? Hacking magic globals into Remix
date: 2023-03-26
description: "Warning: might be a bad idea! Use Node's AsyncLocalStorage to add a little magic into Remix in the form of request-scoped globals."
published: true
author: Oscar Newman
---

> **Tl;dr: How to implement request-scoped globals in Remix so that we can make functions like `request()`, `user()`, and `session()`  callable anywhere. Convenient and sleek? Definitely. Good idea? Debatable.**


Migrating to Remix at [Solv](https://www.solvhealth.com) has been excellent. 

- Our app is faster (SEO team is happy)
- Our conversion rates have gone up (PMs are happy)
- We don’t have to work in a crazy Redux-saga-driven app (devs are happy).

Don’t just take my word for it. Here are unsolicited DMs I’ve received in the past week:

> Awesome. Yeah, I’m still experiencing the thrill of Remix. ‘That much done so quickly!’
> 
> … but its truly insane how quickly things come to life after swallowing my pride to read about Remix for 30 minutes. Are these guys monetizing it somehow, or just doing it for the love of humanity?


> Working in Remix is so nice
> 
> still taking some mental adjustment for any complicated feature but I’m throwing together new [feature] page and it’s just ... lovely

But it’s not all roses. Remix’s focus on an imperative style, linear data flow, and lack of magic is a lot of its charm. But sometimes I find myself wishing for just a _little_ magic.

In our app, three things need to happen for every every request:

1. Get the auth token from the session, and pull in the current `Account` object
2. Get and set our long-term session ID cookies
3. IP Geolocation

This all happens in the `root` loader. However, if we need any of those fields elsewhere, we have to re-fetch them separately.

In the case of the account and auth token, this means adding async calls like `await getAccount(request)` and `await getAuthToken(request)` pretty much everywhere.

This is repetitive and annoying.

More worrisome, if we have multiple nested loaders that each need the user object (I.e., root, navigation, and page contents), then we’re sending *three* parallel requests for the same data.

Right now, we’ve hacked together a per-request in-memory cache to  deduplicate these requests, but it’s not a trivial (or necessarily elegant) task.

The session ID cookies are more complicated—on a page load, we set a `long-term-session-id: <some-uuid>` cookie on the root loader. But on the *first* load, no other loader can access that new ID. This is a painful edge case.

First-party middleware is [on the roadmap](https://github.com/orgs/remix-run/projects/5?pane=issue&itemId=13430611) for Remix eventually, but we can start to solve this today.

### Simple middleware using `getLoadContext`

Remix exposes a hook called `getLoaderContext()` when you implement your own server.

In my `server.ts` file (for Node + Express), I have a route handler that looks like this:

```ts
app.all(“*”, (req, res, next) => {

	// This is how Remix transforms any incoming request
	// into its own format
  return createRequestHandler({
    build: require(BUILD_DIR),
    mode: process.env.NODE_ENV,
  })(req, res, next);
});
```

We can add some logic or data fetching into the handler here and then pass it in via `getLoadContext()`.

```ts
app.all(“*”, async (req, res, next) => {

  // Add pre-loader async logic here
  const user = await getUserFromExpressRequest(req)
	
  return createRequestHandler({
    build: require(BUILD_DIR),
    mode: process.env.NODE_ENV,
    
    // Return any object from this function
    getLoadContext() {
      return { user };
    },
  })(req, res, next);
});
```

Now we have access to that same data in our loaders:

```tsx
// app/routes/some-page.tsx
export function loader({ request, context }) {
  return {
    user: context.user
  }
}
```

## But there’s more
This is great. But I think we can do better. Only having access to the request via an argument passed to the loader is limiting. I often find myself having to drill the `request` object multiple layers into helper functions.

Here's an example that came up this week, as I’ve been working on a Stripe integration:

- From my loader, I wanted to get the Stripe customer ID associated with a given user account, so I call a helper `getStripeId(account, request)`—I have to pass the request since this function talks to my Python API internally.
- `getStripeId` checks if the account has an ID set. If not, it calls another helper that creates a new Stripe customer and updates our `accounts` table with its ID.
- Which means I have to pass the `request` one layer deeper to my `createStripeCustomerForAccount(account, request)` helper.
- Finally, that function calls `getAuthToken(request)`.

Granted, this is a little contrived. But it bugs me every time I have to drill the `request` object down into the call stack to pass an auth token to our API. 

I could simplify this a bit by passing only the `authToken` instead of the whole `request`, but it’s still leaves these functions tightly coupled feeling like leaky abstractions.

### Looking elsewhere for answers

Other frameworks have answers to this problem: **request-scoped globals**!

In Flask, we can import `request` or `g` anywhere for *per-request* global access.

```python
from flask import request

# This resolves to whatever the current `request` is
request.headers['x-tracking-id']

# even more wild
from flask import g

g.database().execute(...)
```

Laravel does this even more with global accessors like `request()`, `auth()` and `session()`:

```php
request()->header('x-api-auth-token')

auth()->user()

session()->set('trackingId')
```

Similarly, could we introduce something like this in our Remix application?

With a new feature that just dropped as stable in Node 20, We can.
 
## AsyncLocalStorage

`AsyncLocalStorage` is an API to create data scoped to an entire *async call-stack*. Any function invoked within a local storage context can access the same data as its parent, but every time the root function is called in parallel, the consumers all have access to their own contextual data.

As an example:

```ts
const requestIdStorage = new AsyncLocalStorage<string>()

function logRequestId() {
	console.log(`Request ID: ${requestIdStorage.getStore()}`)
}

async funcion handleRequest(requestId: string) {
	requestIdStorage.run(requestId, () => {
		// do some async logic in your server
		logRequestId()
	})
}


handleRequest('foo')
handleRequest('bar')
```

```bash
# Output:
# These could print in any order
‘foo’
‘bar’
```

With this foundation and some general knowledge of Remix, we should be able to implement a few globals like `request()` and `user()` with this API.

### Remix Implementation

First, we can add a new global middleware in Express to load our desired data and spawn an `AsyncLocalStorage` instance.

```ts
// server.ts
import { createRemixRequest } from "@remix-run/express/dist/server"
import { AsyncLocalStorage } from "node:async_hooks"

const requestScopedStorage = new AsyncLocalStorage();

app.use(“*”, async (req, res, next) => {
	const context = new Map();
	
	const user = await getUser(req.headers['Authorization'])
	
	// We have to trasnform the Express request to a Remix request
	// using the undocumented and possibly unreliable
	// `createRemixRequest`
	const remixRequest = createRemixRequest(req, res)
	
	asyncLocalStorage.run(context, () => {
		context.set('user', user)
		context.set('request', remixRequest)
	
		next();
  });
})
```

With that in place, every request now *theoretically* has access to this context. However, Remix’s build-step means we can’t import `requestScopedStorage` from `server.ts` in our app directly.

Instead, we’ll pass it via the `globals` object.

Let’s modify our existing request handler in `server.ts` now:

```ts
// server.ts
app.all(
  “*”,
     (req, res, next) => {
        global.__data = { storage: asyncLocalStorage };

        return createRequestHandler({
          build: require(BUILD_DIR),
          mode: process.env.NODE_ENV,
        })(req, res, next);
      }
);
```

Now, to consume this context, let’s add some quick helpers in our Remix app:

```ts
// app/global.ts

export function g() {
  if (!global.__data.storage) {
    throw new Error("AsyncLocalStorage not set");
  }
  return global.__data.storage.getStore() as Map<string, any>;
}
export function request() {
  return g().get("request") as Request;
}

export function user() {
  return g().get("user") as User;
}

```

And finally, the coup de grace we’ve all been waiting for:

```tsx
import { request, user } from '~/global`

export function loader() {
	const cookie = request().header['Cookie']
}

export function someHelperFunction(id: string) {
	await api.updateResource(id, getAuthToken(request()))
}

export function getMyPosts() {
	await api.posts({ userId: user().id })
}
```

## Is this a good idea?

Probably not. Globals like this are a foot-gun. They hide dependencies and rely on magic. They make your code more tightly coupled to the request layer and less testable.

.... *however*....

I don’t think it’s universally awful if used carefully.

The concern about tight coupling is possibly overblown. All the previous code was *already* coupled to my API layer. It had to be aware of either the whole `Request` object or the auth token needed by the underlying API—in either direction, we have a leaky abstraction.

Testability is a genuine concern, but some creative architecture could make this easy to mock or inject dynamically in your test environment.

If I had to guess what I’ll do with this, it’d be to re-write our backend API client to accept a global config function called `getApiToken()`. That way, we can make the root of the client itself responsible for keeping track of global state, and remove the explicit `{authToken: ‘...’}` param from each API call as a requirement

This solves some DX annoyances I’ve had in Remix, but not without tradeoffs. I’m curious to hear what others think.

Is this something you’d like to use in Remix? Are you horrified?