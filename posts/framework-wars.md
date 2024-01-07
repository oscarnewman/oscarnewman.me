---
title: "What the framework wars get wrong"
date: 2024-01-06
author: Oscar Newman
description: "All I want for Christmas is Laravel for Typescript (not RSC)."
published: true
---

(Most) of us build websites and apps for a living. But our tools are holding us back.

I've yet to encounter a project that doesn't require any of the following: auth, queues, scheduled jobs, email, ORM & database migrations, testing. But there's no compelling framework like Laravel or Rails in Typescript that delivers these cohesively, with opinions and documentation.

The biggest players are solving the wrong problems: React Server Components, signals, and faster bundlers are marginal improvements in DX. Competition on whose implementation of RSC is better, or signals vs `useState` consumes the oxygen online, while leaving the ecosystem improvements we desperately need untouched.

Remix's introduction of the server loader/actions pattern into React massively advanced the ecosystem. Almost every frontend framework is now a bonafide full-stack framework. Without this, a separate front- and back-end tool would always be required. Now, we're tantalizingly close to the vision of "Rails for JS."

But no one is building it.

Instead, the competition that dominates the Javascript world has been:

- 2 years of intense Twitter debate about the merit and implementation of React Server Components
- A few cycles on signals vs other reactivity paradigms
- Build times and lighthouse scores

Lest I seem a cynic, these are all great! RSC is promising technology that solves real problems. Good web vitals make your users happy, and fast build times make you happy!

But it's all marginal. We've hit the 80% improvement in React as a full stack tool. SSR, server-side loading and actions, and a shift back to "using the platform" for things like form submissions have changed the way we build websites for the better. Getting the perfect RSC implementation is the 20% optimization on top.

These technologies are important, and they will trickle down to the rest of us who build (typically boring) websites for work eventually. But I'd pay literal money if Vercel, Remix, or anyone invested in filling the still massive chasm between what a fresh React app and a fresh Laravel app can do out of the box.

PHP, Ruby, .NET and more have had batteries-included frameworks for years. But in Javascript land, we're running to the shiny new technologies before we've solved the core problems.

"But wait!" You may say, "We have solutions for this in JS!"

And you'd be right, there's basically two paths you can take right now:

1. Pay a bunch of SASS companies to manage each of the missing pieces: auth, queues, emails, scheduled jobs, etc.
2. Patch together 35 NPM packages for each of these and pray.

The challenges with the first option are obvious: cost, vendor-lock-in, and lack of control over your stack and expenses when/if you scale.

Conversely, the second option seems more palatable at first, but comes with some serious challenges:

- Documentation is fragmented. Good luck getting your team to read one doc site, let alone 25 different ones for different tools.
- Upgrades aren't coordinated between packages, and realistically they'll just all drift out of date cause it's too hard to keep them fresh.
- Nothing intrinsically works together — frameworks like Laravel or Rails can do so much because they all rely on the same foundations, ORM, auth system, `User` class, etc. You end up writing _a lot_ of boilerplate code to patch all these together and it still doesn't work 100% of the time.

Why don't I just use Laravel or Rails?

I do! I probably start about half of my new projects in Laravel. The productivity is unbelievable. But every time I go that direction, I miss the power and flexibility of React and Typescript a frontend stack. JSX might be one of the best frontend innovations of the decade: being able to build composable pieces of UI as code is powerful. Great autocomplete for your whole team powered by Typescript, which works in any editor, is even better.

Plus, when I leave React, I find myself longing for the wealth of community packages and tools that exist in its ecosystem. From component libraries like Shadcn/ui, Radix & React Aria, or even MUI, to one-off tools like date-pickers or random vendor components, 90% of the best web UI stuff happens in React today.

Laravel has a proposed solution to this: Intertia. It's a library that lets your render React views from your Laravel apps. But it has two fundamental flaws compared to building on modern Next or Remix:

1. It doesn't rely on web standards. You still have to manually manage form state and submissions. (This is probably solvable)
2. You lose automatic end-to-end typing. When riding from PHP to Typescript, I'm pretty sure this just isn't possible.

The React + TypeScript ecosystem is already the greatest and most flexible frontend UI ecosystem that exists. Even as languages like PHP and Ruby improve, they are coming from far behind on both typing and declarative UI.

To the big frontend companies (ahem ... ▲), for the sake of the whole React + frontend world, please consider investing in great first party tooling here.

To any other enterprising devs -- if the PHP guy can get a Lambo by building a great framework, maybe you can too...
