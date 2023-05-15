---
title: Safely share secrets and env vars with your team using OpenSSL
date: 2022-11-20
description: "Two small NPM scripts make it dead-simple to share secrets and environment variables with your team. All you need is OpenSSL."
published: true
author: Oscar Newman
---

I hate sending secrets and environment variables to my team. Sometimes we use
[One time secret](https://onetimesecret.com), and sometimes (gasp) we send them
via Slack. No matter what, I still get slack questions about
`ERROR: 'STRIPE_KEY' is not defined` months after it was added.

There's a lot of potential solutions here, but my favorite is to check your
encrypted env file into git using a quick `openssl` command.

## Setup

Generate a secure "team secret" file. This will be the key to encrypt and
decrypt that everyone shares.

```bash
openssl rand 256 -out team-secret.key
```

Share `team-secret.key` with everyone (bonus points if you can get it pre-loaded
with your MDM). Add `$TEAM_SECRET_KEY` to everyone's terminal pointing to the
**absolute path** to this file.

```bash
# ~/.zshrc | ~/.bashrc | ~/.bash_profile
export $TEAM_SECRET_KEY=/Users/oscar/work/team-secret.key
```

## The scripts

Add the following scripts to your repo. Here’s a couple versions for a
`Makefile` or `package.json`, but the concept should be portable.

**`package.json`**

```tsx
{
	"env:encrypt": "openssl aes-256-cbc -in .env -out .env.enc -pass file:$TEAM_SECRET_KEY",
	"env:decrypt": "openssl aes-256-cbc -d -in .env.enc -out .env -pass file:$TEAM_SECRET_KEY"
}
```

**`Makefile`**

```makefile
env\:encrypt:
	openssl aes-256-cbc -in .env -out .env.enc -pass file:$$TEAM_SECRET_KEY

env\:decrypt:
	openssl aes-256-cbc -d -in .env.enc -out .env -pass file:$$TEAM_SECRET_KEY
```

Run `npm run env:encrypt`, check `.env.enc` into source control, and you're done
(once you tell your team to pull the latest `env` file).
