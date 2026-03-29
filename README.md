# Blink URL Shortener

Telegram-inspired URL shortener built with Next.js, Tailwind CSS, Drizzle, and Postgres.

## Features

- Custom alias support
- QR code generation with download
- Fast redirect route with click counting
- Browser-saved recent links
- Clean light UI tuned for mobile and desktop

## Setup

1. Install dependencies:

```bash
npm install
```

2. Add environment variables:

```bash
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Notes

- The app auto-creates the `links` table on first request.
- For future schema workflows, you can generate Drizzle files with:

```bash
npm run db:generate
```

## Testing

```bash
npm run lint
npm run test
```
