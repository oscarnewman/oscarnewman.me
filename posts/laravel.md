---
title: Commit-by-commit, how I setup Laravel for a team
date: 2023-03-26
description: "All the steps I use to go from a fresh install of Laravel to a continuously-deployed repo with lining, testing, shared secrets, and one-line setup to get a new team project going."
published: false
author: Oscar Newman
---

I don't know Laravel that well.

In fact, I seldom use it in production. Maybe don't listen to me. But I'm tired of looking at old commit logs to remember how I do this every time, so I'm writing it down and hopefully it'll be useful to someone else.

However, it's the first tool I reach for on every side project. _Everything_ comes out of the box. Auth, UI scaffolding, email, queues, SMS, API, and way more.

It even has a [slick Docker-based setup tool](https://laravel.com/docs/10.x/sail) that makes spinning up your database, Redis, and more a one-command operation.

But at least to my taste, there are a few issues and things missing to _really_ have a production-ready, and more importantly "share with my team/friends/partners"-ready.

- Once it's scaffolded, you need [an obscure docker command](https://stackoverflow.com/questions/71025461/laravel-sail-after-cloning-from-git-repository) for anyone who clones the repo to get setup
- A [local environment seeder](https://stefanzweifel.dev/posts/2023/01/30/local-environment-seeders-in-laravel)
- `.env` secret sharing [by using OpenSSL](https://oscarnewman.me/articles/env-encrypt)
- A one-line setup script for _any_ new dev to get up and running and seed their database (and validate their config)
- Linting + formatting on save
- CI that runs listing and tests (and runs the tests with a proper database setup)
- CD to handle automatic deployments to a service of your chose (I'm partial to [Vapor](https://vapor.laravel.com))

Let's get started.

## 1. Install Laravel and Sail

[Reference commit ↗](https://github.com/oscarnewman/laravel-setup-step-by-step/commit/999a91744f82f13e3938faff3972d898bb59177a)

```bash
curl -s "https://laravel.build/example?with=pgsql,redis,selenium,mailpit" | bash
```

I like Postgres, but you do you.

Otherwise:

- Redis is nice for caching & queues
- Selenium is for end-to-end testing (think Cypress or Playwright)
- Mailpit is a local mail server that catches all your outgoing email

There's [more services available](https://laravel.com/docs/10.x/installation#choosing-your-sail-services) if you wanna customize.

_Warning! If you're using Postgres do this:_

Avoid a headache and setup your `.env.example` with the
Right vars from the start. The default `mysql` ones don't work. Here's how I do it:

```bash
DB_CONNECTION=pgsql
DB_HOST=pgsql
DB_PORT=5432
DB_DATABASE=example
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

## 2. Add `.env` encryption and sharing

[Reference commit ↗](https://github.com/oscarnewman/laravel-setup-step-by-step/commit/74a97bb93b223d35f7568745d48f9882f7419f21)

I [wrote about this in more detail before](https://oscarnewman.me/articles/env-encrypt) so I'll be brief here.

Sending new devs a bunch of API keys, or iMessaging your whole `.env` file gets old real quick.

Instead, let's generate one secret key file we can share with our team.

```bash
openssl rand 256 -out team-secret.key

# add to ~/.zshrc | ~/.bashrc | ~/.bash_profile
export $TEAM_SECRET_KEY=/Users/oscar/work/team-secret.key
```

And then a `Makefile` to handle encrypting and decrypting our `.env` so we can safely share it.

```make
# Makefile
env\:encrypt: .env
	openssl aes-256-cbc -in .env -out .env.enc -pass file:$$TEAM_SECRET_KEY
	@touch .env.enc

env\:decrypt: .env.enc
	openssl aes-256-cbc -d -in .env.enc -out .env -pass file:$$TEAM_SECRET_KEY
	@touch .env
```

Finally, encrypt our `.env` and check it into source.

```bash
cp .env.example .env # just copy the example to start
make env:encrypt
git add .env.enc
```

## 3. Add a setup script

[Reference commit ↗](https://github.com/oscarnewman/laravel-setup-step-by-step/commit/d2e3f20b9a4b023d116177d337bcab10a1ad5364)

The first time try to onboard a new dev to your Laravel app, you'll likely have a problem:

- Running `composer install` locally, outside Docker, is prone to fail
- You can't `sail composer install` because you haven't installed Sail (via composer) yet.

The trick is to run a command via a slim Docker container like so:

```bash
docker run --rm \
     -u "$(id -u):$(id -g)" \
     -v $(pwd):/opt \
     -w /opt \
     laravelsail/php82-composer:latest \
     composer install --ignore-platform-reqs
```

This is kinda gross, though. So let's add a new setup script in `tools/setup.sh`.

This script, sequentially:

- Installs fresh Composer dependencies
- Installs `npm` dependencies
- Decrypts the `.env` file
- Launches Sail (and all the Docker services)
- Generates a fresh application key
- Resets and seeds the database (we'll get to seeding in soon...)
- Builds the frontend and runs the PHP test suite

The first handful of steps are necessary for setup, and the last couple (building and testing) help our new dev validate that everything actually works as expected.

```bash
# tools/setup.sh
#! /bin/bash

echo -e "\033[1;32mSetting up your local dev environment\033[0m"
echo -e "\033[1;41mWarning! This will destroy your local database and reseed it with test data.\033[0m"
# Exit if they say no
read -p "Are you sure you want to continue? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi


echo "Installing composer dependencies..."
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v $(pwd):/opt \
    -w /opt \
    laravelsail/php82-composer:latest \
    composer install --ignore-platform-reqs

echo "Installing npm dependencies..."
npm i

echo "Decrypting .env file..."
make env:decrypt

echo "Booting up Sail in the background..."
echo -e "\033[1;30m(note: Run \`sail up\` to reconnect)\033[0m"
./vendor/bin/sail up -d

echo "Generating application key..."
./vendor/bin/sail artisan key:generate

echo "Migrating and seeding database..."
./vendor/bin/sail artisan migrate:fresh --seed

echo "Building frontend..."
npm run build

echo "Running tests..."
./vendor/bin/sail test
```

For convenience, we'll also make the script executable:

```bash
chmod +x tools/setup.sh
```

## 4. Build and test in CI

[Reference commit ↗](https://github.com/oscarnewman/laravel-setup-step-by-step/commit/2be6c49d988d997fed3e4b925b9db9d2b35074ef)

I'm going to set this up specific to GitHub actions and Postgres, but you can likely generalize this to other tools and providers.

First, we'll add a `.env.test` file that we check into git to load in our test-time configuration. (I think you're technically able to do this out of the box in `phpunit.xml` — however I personally like having `.env.test` live next to `.env`).

It's useful to configure logging, mail, and more for your CI tests without having to set env vars in the CI provider itself.

```bash
APP_NAME=YourApp
APP_ENV=test
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=test
DB_USERNAME=postgres
DB_PASSWORD=postgres

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MAIL_MAILER=log
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

I add a lint and test workflow that:

- Spins up Postgres for local testing
- Validates that your frontend builds
- Runs your PHP tests

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:

concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

jobs:
  test:
    name: 🐛 Unit tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 16
          cache: "npm"

      - name: Install Node Dependencies
        run: npm ci

      - name: Build assets
        run: npm run build

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: 8.2
          tools: composer:v2
          coverage: none

      - name: Get composer cache directory
        id: composer-cache
        run: echo "dir=$(composer config cache-files-dir)" >> $GITHUB_OUTPUT

      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: ${{ steps.composer-cache.outputs.dir }}
          key: ${{ runner.os }}-composer-${{ hashFiles('**/composer.lock') }}
          restore-keys: ${{ runner.os }}-composer-

      - name: Install Project Dependencies
        run: composer install --no-interaction --prefer-dist --optimize-autoloader

      - name: Copy env
        run: cp .env.test .env

      - name: Generate app key
        run: php artisan key:generate

      - name: Migrate database
        run: php artisan migrate --force

      - name: Load .env file
        uses: xom9ikk/dotenv@v2

      - run: php artisan test
```
