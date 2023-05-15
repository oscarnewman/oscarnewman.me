---
title: A better solution for client-side environment variables in Remix
date: 2022-11-23
author: Oscar Newman
description: A better solution for client-side environment variables in Remix
published: false
slug: remix-env
---

Remix is awesome. But one thing I sorely missed when migrating from next was the
`NEXT_PUBLIC_` environment variable loader. For those who aren't familiar, Next
will take any environment variable that starts with `NEXT_PUBLIC_` and make it
available in the browser as well as the server, via
`process.env.NEXT_PUBLIC_[your var]{:js}`.

An issue with the Next system is that it statically compiles the environment
variables into the code, which means that if you want to change them in
production, you have to rebuild the entire app. This is a huge pain for changing
your `API_URL` or `XYZ_KEY` when it expires.

The default Remix advice of just passing vars through a loader when needed
always felt cumbersome to me. So here's the system I've setup to solve this
problem and more:

- `PUBLIC_` environment variables that are available in the browser, and can be
  changed without a rebuild
- `BUILD_` environment variables that are available in the browser, but require
  a rebuild to change
- Make sure both are available on the client _before_ the app renders (i.e. you
  need your `SENTRY_DSN` value in `entry.client.tsx` before the you even call
  `hydrate`).

## The solution

Let's start by seting up a `.env` file with three groups:

```bash showLineNumbers {1,3} /API/
# .env

# Private (server-side only variables)
# ===================================
SESSION_SECRET=foo_1234
ADMIN_API_KEY=bar_5678

# Public (client-side variables)
# ==============================
PUBLIC_APP_ENV=production
PUBLIC_API_URL=https://api.example.com

# Build (client-side variables that require a rebuild to change)
# ==============================================================
BUILD_SEGMENT_KEY=1234
```

Next, we need a helper function to get our public or build variables:

```ts showLineNumbers /env/ {16-18}
// app/util/env.server.ts

/**
 * All env vars prefixed with `_PUBLIC`
 */
export const publicEnvVars = Object.fromEntries(
  Object.entries(process.env)
    .filter(([key]) => key.startsWith("PUBLIC_"))
    .map(([key, value]) => {
      if (value?.toLowerCase() === "false") return [key, false];
      if (value?.toLowerCase() === "true") return [key, true];
      return [key, value];
    })
);

export function getBuildEnvVars() {
  return Object.entries(process.env).filter(([key]) =>
    key.startsWith("BUILD_")
  );
}
```
