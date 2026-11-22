# Jeevan Geet

Jeevan Geet includes a gospel-centered Flutter app and a private Next.js admin
website for songs, articles, ministry reports, and a product catalog.

## Private web admin

Deploy this Next.js project to Vercel and open `/admin`. The login is a
configured email address and a password you choose; it is not Google/GitHub
sign-in, and the password is not your Gmail password. Set these variables in
Vercel **Project Settings → Environment Variables** and in a local ignored
`.env.local` file:

```env
ADMIN_EMAIL="your-admin-email@example.com"
ADMIN_PASSWORD="a new, unique password with at least 16 characters"
ADMIN_SESSION_SECRET="a random secret with at least 32 characters"
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your Supabase service-role key"
```

Generate a session secret with `openssl rand -base64 32`. Get the service-role
key from your Supabase project's API settings. Keep it only in the server
environment: never add it to Flutter, a browser variable, or source control.
The app's publishable/anon key is safe for the Flutter client.

The private `/admin` dashboard manages songs, articles, ministry reports (with
optional testimonies), images, and products priced in INR. Create app articles
and ministry reports in its **Articles & reports** section. Choose a content
type, complete the title, category, summary, cover image, and body, then select
**Publish now** to show the item in Flutter Discover. Both content types are
stored in `gospel_content`; the app does not read from an `articles` table.
Products can be listed in the app, but there is no cart, payment, or checkout
yet. Admin sessions use an HTTP-only cookie and expire after eight hours.
Changing the email, password, or session secret invalidates existing sessions.

## Supabase setup

Supabase is used as shared content and image storage only; no Supabase sign-in
or OAuth provider is needed. Apply
[`supabase/migrations/20261118200000_admin_dashboard_products.sql`](./supabase/migrations/20261118200000_admin_dashboard_products.sql)
to the Supabase project before using the dashboard or app. It creates the
`gospel_content` and `shop_products` tables, read policies, and public image
bucket. Apply it through the Supabase SQL Editor or your existing migration
workflow.

After adding or changing Vercel environment variables, redeploy the project.
The app's Discover page shows only published articles, reports, and products.

For local admin development, create an ignored `.env.local` with
`ADMIN_EMAIL`, a unique `ADMIN_PASSWORD` of at least 16 characters,
`ADMIN_SESSION_SECRET`, `SUPABASE_URL`, and a newly rotated
`SUPABASE_SERVICE_ROLE_KEY`. Keep the service-role key server-side only. Do not
reuse a key that has been shared in chat or committed.

## Flutter app

From `src/app/flutter_application_1/jeevan_geet`, run or build with the
Supabase project URL, publishable key, and deployed admin URL:

```sh
flutter run -d chrome \
  --dart-define=SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
  --dart-define=SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY \
  --dart-define=ADMIN_DASHBOARD_URL=https://YOUR_VERCEL_DOMAIN/admin
```

For older Supabase projects, `SUPABASE_ANON_KEY` is accepted instead of
`SUPABASE_PUBLISHABLE_KEY`. Never use the service-role key in the Flutter app.

The project also uses Prisma for the existing song APIs. Install dependencies
with `npm install`; run locally with `npm run dev`. Build using `npm run build`.
