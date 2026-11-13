# EXEPRA — online store

A complete e-commerce platform for EXEPRA: storefront, customer accounts, server-side cart and wishlist, Stripe checkout with verified webhooks, order management, admin dashboard, transactional email, GDPR tooling and German legal-page structure.

> **Status:** functionally complete and tested against a local database. **Not yet ready for real customers** — see [Before going live](#before-going-live).

## Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16.2 (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS 4, Framer Motion, Lucide icons, Inter + Poppins |
| Database | PostgreSQL + Prisma 7 (driver adapter `@prisma/adapter-pg`) |
| Auth | Better Auth (email + password, DB sessions, roles via admin plugin) |
| Payments | Stripe Checkout (hosted) + signed webhooks |
| Email | Resend |
| Images | Cloudinary (signed uploads, no SDK) |
| Validation | Zod 4 |
| Tests | Vitest + Testing Library (unit/integration), Playwright (end-to-end) |

> Note: the project was already on Next.js 16 when this work started, so it was kept there rather than downgraded to 15. Next 16 renames `middleware.ts` to `proxy.ts` and makes `params`/`searchParams` async.

## Project structure

```
app/
  (store)/            storefront: home, shop, [category], product/[slug], cart, checkout,
                      wishlist, search, collections, account/*, legal pages, info pages
  admin/              admin dashboard (role-protected) + server actions
  api/                auth, cart, wishlist, search, products, uploads, account export,
                      webhooks/stripe, cron/release-stock
  sitemap.ts robots.ts
components/            layout, home, product, cart, checkout, account, admin, content, ui
lib/
  pricing.ts          pure pricing engine (subtotal, coupons, shipping, VAT) — single source of truth
  cart.ts wishlist.ts server-side cart/wishlist (guest cookie → merged into account on sign-in)
  orders.ts           order creation, stock reservation, payment, release, refunds
  payments/           Stripe client + webhook event handling
  auth.ts session.ts  Better Auth config, session/role helpers
  catalog.ts          catalogue queries, filtering, facets, search
  email/              Resend client + branded templates
  storage.ts          image uploads (Cloudinary / local dev fallback)
  validation.ts       Zod schemas (addresses incl. EU postal codes, checkout, forms)
prisma/               schema.prisma, migrations/, seed.ts
scripts/create-admin.ts
tests/                unit/, integration/, e2e/
proxy.ts              optimistic auth gate for /admin and /account
```

## Local development

Requirements: Node.js ≥ 20 (tested on 26), npm.

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # then fill in the values below
```

### 1. Database

Easiest locally — Prisma's built-in Postgres server (no Docker needed):

```bash
npm run db:local            # starts `prisma dev` in the background and prints a postgres:// URL
```

Put the printed **TCP** URL (`postgres://postgres:postgres@localhost:…/template1?sslmode=disable`) into `DATABASE_URL` and set `DATABASE_POOL_MAX=1`. Any other PostgreSQL 15+ works too.

```bash
npm run db:migrate          # apply migrations
npm run db:seed             # demo catalogue, shipping rates, hero slides, WELCOME10 demo code
```

### 2. Auth secret

```bash
openssl rand -base64 32     # → BETTER_AUTH_SECRET
```

### 3. Admin account

Administrators can never be created through public registration. Create one from the command line:

```bash
npm run admin:create -- owner@your-domain.de "Owner Name"
```

You'll be prompted for a password (min. 12 characters). Running it for an existing account promotes that account to admin.

### 4. Run

```bash
npm run dev                 # http://localhost:3000 — admin at /admin
```

Without Stripe keys the checkout works up to the payment step and then explains that online payment isn't available — no fake payments. Without Resend keys, emails are not sent: they're printed to the dev console and logged as `skipped` in the `EmailLog` table.

## Payments (Stripe)

1. Create a Stripe account and complete business verification.
2. Dashboard → **Settings → Payment methods**: enable what you want to offer in Germany (cards, PayPal, Klarna, SEPA Direct Debit, Apple Pay/Google Pay…). The checkout automatically shows whatever is enabled — nothing is hard-coded.
3. Copy the secret key into `STRIPE_SECRET_KEY` (use `sk_test_…` until you go live).
4. Add a webhook endpoint `https://YOUR-DOMAIN/api/webhooks/stripe` with these events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
   - `charge.refunded`

   Copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
5. Local testing with the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe   # prints a whsec_… for .env
   ```
   Pay with test card `4242 4242 4242 4242`, any future date, any CVC.

**How payment confirmation works**

- Clicking *Buy now* re-validates everything on the server, recalculates totals from the database, **reserves stock atomically** and creates a `PENDING` order, then redirects to Stripe Checkout.
- The order becomes `PAID` **only** when a signature-verified webhook arrives. The success page merely displays the stored status (and polls while waiting).
- Webhook events are de-duplicated (`WebhookEvent` table) and every handler is idempotent, so retries can't double-process an order.
- Abandoned checkouts: Stripe sessions expire after ~31 min (`checkout.session.expired` releases the stock). `/api/cron/release-stock` is a safety net that releases stock held for more than 90 min.
- Refunds are issued from **Admin → Orders → (order) → Refund**; the order updates when Stripe confirms via `charge.refunded`. Optionally restocks items.

## Email (Resend)

1. Create a Resend account and **verify your sending domain** (DNS records).
2. Set `RESEND_API_KEY` and `EMAIL_FROM` (e.g. `EXEPRA <orders@your-domain.de>`).

Templates (in `lib/email/templates.ts`): password reset, email verification, order received (async payments), order confirmation, shipping confirmation, cancellation, refund, newsletter double opt-in, contact-form notification. Every send is recorded in `EmailLog` with the provider's message id or the error — visible per order in the admin.

## Images (Cloudinary)

Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Admin uploads are validated by file signature (JPEG/PNG/WebP/AVIF, ≤ 8 MB) and stored under `exepra/<folder>`. In development without Cloudinary, uploads go to `public/uploads/` (git-ignored; **not** persistent on serverless hosts, so production refuses to use it).

## Tests

```bash
npm run typecheck
npm run lint
npm test                    # Vitest: unit + database integration tests (needs DATABASE_URL + seed)
npx playwright install chromium   # once
npm run test:e2e            # Playwright: storefront, checkout steps, accounts, admin, responsive (7 widths)
```

The admin e2e test needs `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` for a **local test** admin (created with `admin:create`); it's skipped otherwise. Integration tests create and delete their own data. The full Stripe round trip is covered by integration tests using genuinely signed test webhook events; a live end-to-end payment test needs real test-mode keys (see above).

## Deployment (Vercel + Neon)

1. **Database:** create a Neon project (region: Frankfurt `eu-central-1`). Use the pooled URL for `DATABASE_URL` and the direct URL for `DIRECT_URL`.
2. **Vercel:** import the Git repository. Framework preset: Next.js. Set the region to Frankfurt (`fra1`) to keep data in the EU.
3. **Environment variables:** add everything from `.env.example` (except the `E2E_*` ones) for Production — and separate test-mode values for Preview.
4. **Migrations:** run against production before/with the first deploy:
   ```bash
   DATABASE_URL="<direct url>" npx prisma migrate deploy
   ```
   Optionally set the Vercel build command to `prisma migrate deploy && next build`.
5. **Seed?** Do **not** seed demo products in production. Instead create categories, products, shipping rates and hero slides in the admin. (Shipping rates and settings can be bootstrapped by running the seed once and then deleting the demo products/coupon, if you prefer.)
6. **Admin:** run `npm run admin:create` locally with `DATABASE_URL` pointing at production.
7. **Stripe webhook:** add the production endpoint (see above) and set `STRIPE_WEBHOOK_SECRET`.
8. **Cron:** `vercel.json` runs `/api/cron/release-stock` daily at 03:00 UTC (the Hobby plan only allows daily jobs; on Pro you can run it every 30 minutes). Abandoned checkouts are normally released sooner by Stripe's `checkout.session.expired` webhook. Set `CRON_SECRET`.
9. **Domain:** Vercel → Project → Domains → add `your-domain.de` and `www.your-domain.de`; set the DNS records shown (A/ALIAS for apex, CNAME for www). HTTPS certificates are issued automatically. Then update `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL` to `https://your-domain.de` and redeploy.
10. **Search engines:** submit `https://your-domain.de/sitemap.xml` in Google Search Console. `robots.txt` blocks indexing on non-production (preview) deployments automatically. Product pages include `Product` + `BreadcrumbList` structured data (ratings only when real approved reviews exist), ready for Google Merchant Center.
11. **Error logging:** Vercel captures server logs (Project → Logs). For alerting, add Sentry (`npx @sentry/wizard@latest -i nextjs`) or a log drain.

## Security notes

- Passwords hashed by Better Auth (scrypt); sessions in the database, `httpOnly`, `secure` in production; login/registration/password-reset rate-limited.
- Roles: `customer` (default) and `admin`. Admin pages check the role in the layout; **every** admin server action and upload route re-checks it. Public sign-up can never set the role.
- Customers can only read their own orders/addresses (all queries scoped by `userId`); guest order tracking requires order number **and** email.
- All mutations validated with Zod on the server. JSON route handlers check the `Origin` header (CSRF); server actions have built-in origin checks.
- Prices, discounts, shipping and VAT are always recomputed on the server; client totals are display-only.
- Security headers + CSP in `next.config.ts`. Secrets only in environment variables; nothing sensitive is exposed via `NEXT_PUBLIC_*`.
- GDPR: consent banner (necessary vs. analytics vs. marketing; nothing optional loads before consent), double opt-in newsletter with stored consent text/time/IP, customer data export (JSON) and self-service account deletion (orders retained unlinked for statutory retention).

## Before going live

**Business owner must provide**

- [ ] Impressum details (company, address, register, VAT ID, representative) — `app/(store)/impressum`
- [ ] Datenschutzerklärung, AGB, Widerrufsbelehrung, return policy — complete the highlighted placeholders **and have them reviewed by a lawyer** or generated by a legal-text service (IT-Recht Kanzlei, Händlerbund, Trusted Shops). Then remove the draft notice (`draft={false}` in `LegalPage`).
- [ ] Real product catalogue with professional photography — the seeded products are demo content (`isDemo`), mostly home/lifestyle images; there are **no women's or kids' fashion photos yet**, and the Kids category is empty.
- [ ] Hero images that match the fashion positioning (the current four are interiors / desk / fitness).
- [ ] Final shipping rates and free-shipping threshold (seeded values are placeholders: DE 4,95 € / free from 75 €, express 9,95 €, EU 9,95 €).
- [ ] Contact email, social links (Admin → Settings).

**Configuration**

- [ ] Stripe live keys + live webhook; payment methods enabled and approved
- [ ] Resend with verified domain
- [ ] Cloudinary
- [ ] Production database, migrations deployed, admin created
- [ ] Domain + HTTPS, `NEXT_PUBLIC_SITE_URL` / `BETTER_AUTH_URL` updated
- [ ] Delete demo products and the `WELCOME10` demo coupon
- [ ] Place a real low-value test order end-to-end in live mode, then refund it

## Known limitations / next steps

- UI language is English; German translations (and `/en` routing) are not implemented yet.
- Newsletter sending itself (campaigns) is not built — subscribers with consent records are stored and can be exported.
- DHL label/tracking integration is not built; tracking numbers are entered manually and emailed to the customer. Shipping rules are centralised in the `ShippingRate` table for a future carrier integration.
- Analytics integration is Plausible-ready but disabled until a domain is configured.
- Newsletter confirmation is a GET link; some corporate mail scanners pre-open links, which could confirm a subscription automatically. Consider switching to a confirm button.
