---
title: Remix vs Next in production — A very brief comparison
date: 2022-11-22
author: Oscar Newman
description: "Four months since adopting Remix in production at Solv Health: HMR, image optimization, and community make Next great for static sites. Remix's mutations make it a no-brainer for everything else."
published: true
slug: remix-vs-next
---

I'm the guy who convinced his company ([Solv](https://www.solvhealth.com)) to go
all-in on Remix, migrating away from our 6-year old home-grown React codebase.
That means it's (somewhat) my reputation on the line if things don't go well.

I also ported [RealOpen](https://realopen.com) from Next to Remix earlier this
year go from a static site to one with a rich dashboard for logged-in users, got
a direct comparison of the two on a site with hunderds of thousands of visitors.

We're four months into runing Remix in production, and I've learned _a lot_ that
the docs and the (excellent)
[Remix stacks](https://remix.run/docs/en/v1/pages/stacks) don't teach you about
best practices, foot-guns, and how Remix works for real-world apps and teams.

Tl;dr? **It's awesome.** Developer producitivy is up. Bugs are _way_ down. Our
code feels more maintainable than ever. But I stil like Next for static sites
and some landing pages.

**Caveat**: This is super opinionated. I'm a huge fan of both Remix as well as
basically everything Vercel does. You truly can't go wrong with either of these
tools, and real competition in this space is pushing everyone forward.

## Slightly longer tl;dr

Performance, speed, deployment, and behavior under load are great on both.

Use Next if:

- Your site is purely static, with almost no user-triggered mutations.
- Your app will rely on complex React state and not having full Fast Refresh is
  a deal-breaker.

Use Remix:

- For basically everything else

## Where Remix wins

I think this list is just gonna grow over time. With the
[Shopify acquisition](https://remix.run/blog/remixing-shopify) and the
[public roadmap](https://remix.run/blog/open-development) Remix is just gonna
get better.

- **Literally anything with a data mutation.** I built a landing page for a new
  project in Next.js this month. Life was great until I had to add the email
  signup form. In Remix, it took me 5 minutes to get a working form connected to
  the Mailchimp api, with great UX and zero external libraries. In Next, I had
  to:

  - Add `react-hook-form` or some sort of state management
  - Add `react-query` to handle the mutation
  - Write an API route in `/pages/api`

  It's not much but it's boilerplate that slows time-to-ship, and introduces
  surface area for mistakes and errors.

  Next has `getServerSideProps`, and nested data-loading in version 13, but the
  mutation story in Remix—`actions`, the automatic refetching of `loaders`, adn
  more—is what let us ideate, design, build, and launch complicated new
  multi-step forms and flows in under a month.

- **Complex apps with lots of user interaction.** We don't have a single
  ContextProvider or global store in our Remix app, nor do we need one. Even for
  complex, branching multi-step forms and flows. Instead, Remix lets us lean on:
  - Cookies
  - Storing state in the URL
  - Accessing data from parent `loaders` to get universal access to things like
    the `useUser()` hook.

## Where Next wins

Like I said above—I just started a new projet in Next.js. What gives?

- **HMR is great.** The Remix team
  [opted not to implement HMR](https://github.com/remix-run/remix/issues/34),
  instead relying on full page reloads after changes. This is a small quibble,
  but as someone who often wants to quickly iterate on styles in a modal, on the
  bottom of a long scrolling page, or deep into some stateful flow, I _really_
  miss HMR in Remix, and Next's implementation is blazing fast.

- **Image optimization.** `next/Image`, especially with it's API refresh in Next
  13, saves a monumental amount of time in image-heavy apps. Never once having
  to think about where you store images, or if you need to shell out a kidney
  for Cloudinary is pretty great.

  Porting [RealOpen](https://realopen.com) from Next to Remix was a breeze, and
  really opened up a lot of easy possibilities for user interaction, but losing
  out on the image optimization and automatice blur placeholders for an
  image-heavy site was painful.

- **Communtiy support and polish**. This will likely change over time, but right
  now, you get more "polish" out of the box with Next and it's very well
  supported community plugins. One example that we learned the hard way is that
  [Next SEO](https://github.com/garmeeh/next-seo) is battle tested and
  feature-rich, while the equlivalent
  [Remix SEO package](https://github.com/chaance/remix-seo) has some
  show-stopping bugs and no response to PRs or issues since June. This is just
  one package, but its indicative of the maturity of the 3rd-party ecosystem for
  Remix so far.

  Next also still has some more polish in it's build tooling and CLI. Just being
  to run `next build` or `next dev` is _very_ nice. Especially for static pages
  where you know at build-time whether there's an error or not. In our remix
  app, `npm run build` and `npm run dev` each invoke 5-6 sub-commands to do
  different things (run the dev server, build `server.ts`, run the Remix build
  watcher, build our CSS, inline our env vars, etc).

## Toward the future

Ok, this wasn't as brief as I hoped. But both of these frameworks are pushing
each other forward, which is awesome. I'll keep reporting on learnings as we
grow Remix production.
