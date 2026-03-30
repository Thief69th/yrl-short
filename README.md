# Blink URL Shortener Pro

Production-ready URL shortener SaaS built with Next.js App Router, Tailwind CSS, Clerk auth, Drizzle ORM, and Neon Postgres.

## What ships in this repo

- Email/password auth with Clerk sign-in, sign-up, and password reset
- Free and paid user plans with data isolation
- Dashboard with totals, recent links, QR preview, and analytics charts
- Manual admin upgrade flow for free-to-paid switching
- Public short links under `/r/[code]`
- Free-plan monetization through an internal ad interstitial
- Click tracking with country/device enrichment
- Neon-ready Drizzle schema and generated SQL migration

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Clerk for authentication
- Neon Postgres + Drizzle ORM
- Recharts for analytics

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables from `.env.example` into `.env.local`.

3. Provision your services:

- Create a Neon Postgres database and copy its `DATABASE_URL`
- Create a Clerk app with email/password enabled
- Add your admin email to `ADMIN_EMAILS`
- Add optional sponsor/ad settings for the free-plan interstitial

4. Generate or apply the schema:

```bash
npm run db:generate
npm run db:push
```

5. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Core routes

- `/` marketing page
- `/sign-in` Clerk sign-in
- `/sign-up` Clerk sign-up
- `/dashboard` authenticated product dashboard
- `/pricing` public pricing page
- `/admin` admin-only user management
- `/r/[code]` public redirect and interstitial flow

## API routes

- `POST /api/links`
- `GET /api/links`
- `PATCH /api/links/:id`
- `DELETE /api/links/:id`
- `GET /api/analytics/overview`
- `GET /api/analytics/links/:id`
- `POST /api/ads/impression`
- `POST /api/ads/click`
- `POST /api/admin/users/:id/plan`

## Database schema

The app uses four tables:

- `users`
- `links`
- `click_events`
- `earnings`

Generated SQL lives in `drizzle/0000_wide_menace.sql`.

## Deploying to Vercel

1. Push the repository to GitHub.
2. Create a Vercel project and import the repo.
3. Add the same environment variables from `.env.local` into the Vercel project.
4. Provision Neon and Clerk for the production environment.
5. Run `npm run db:push` against the production `DATABASE_URL` before the first launch.
6. Deploy.

Recommended production values:

- `NEXT_PUBLIC_APP_URL=https://your-project.vercel.app`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_AD_INTERSTITIAL_SECONDS=5`

## Verification

```bash
npm run lint
npm test
npm run build
```
