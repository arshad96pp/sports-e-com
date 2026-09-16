# STRYDE — Sports Accessories E-Commerce

A production-oriented, full-stack e-commerce storefront for football, cricket, tennis and other
sports accessories, built with Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui and
Supabase (Postgres, Auth, Storage).

## Stack

- **Next.js App Router** — Server Components, Server Actions, Route Handlers
- **Supabase** — Postgres (with Row Level Security), Auth, Storage
- **Tailwind CSS v4** + **shadcn/ui**, Poppins, a black/white + lime-accent design system
- **sharp** — server-side image validation/resize/WebP pipeline for every admin upload
- No payment gateway by design — checkout ends in a WhatsApp message to the store owner

## Getting started

```bash
pnpm install
pnpm db:start     # starts the local Supabase stack (Postgres, Auth, Storage, Studio) via Docker
pnpm seed         # seeds categories, ~50 products, reviews, banners, offers, settings, demo accounts
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Supabase Studio (local DB browser) is at
[http://localhost:54323](http://localhost:54323).

`pnpm db:start` prints your local `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` /
`SUPABASE_SERVICE_ROLE_KEY` — copy `.env.local.example` to `.env.local` and fill them in (a working
set of the well-known local dev keys is already there for convenience). `pnpm seed` reads
`SEED_SUPER_ADMIN_EMAIL` / `SEED_SUPER_ADMIN_PASSWORD` and `SEED_DEMO_EMAIL` / `SEED_DEMO_PASSWORD`
from the same file.

### Demo accounts (after `pnpm seed`)

- **Customer** — `demo@stryde.in` / `demo1234` — comes with a saved address book and order history.
- **Super Admin** — the email/password you set as `SEED_SUPER_ADMIN_EMAIL` / `SEED_SUPER_ADMIN_PASSWORD`
  in `.env.local` — sign in at `/admin/login`. If that password isn't set, the seed script skips
  creating the admin account and prints a warning.

### Other useful scripts

```bash
pnpm db:reset      # drops and re-applies every migration (supabase/migrations/*.sql) — reseed after
pnpm db:types      # regenerates src/lib/supabase/types.ts from the local schema
pnpm db:stop       # stops the local Supabase stack
```

## Configuring the WhatsApp order number

There is no payment gateway. "Buy Now" and "Proceed to Buy" open a shadcn Dialog confirmation that,
on confirm, opens WhatsApp with a pre-filled order message addressed to the store's WhatsApp number.
That number — along with the rest of the store's contact info, social links, shipping/return policy
text and SEO defaults — lives in the database (`store_settings` table) and is editable at
`/admin/settings`, not hardcoded in components. `NEXT_PUBLIC_WHATSAPP_NUMBER` in `.env.local` is only
the fallback used the first time that row is created.

## Architecture

```
UI (Server/Client Components)
  → Server Actions (src/lib/actions/**)     — validation, auth checks, orchestration
    → Services (src/lib/services/**)        — the only modules that query Supabase
      → Supabase (Postgres + RLS, Storage, Auth)
```

- **Supabase clients** (`src/lib/supabase/`): `client.ts` (browser, anon key), `server.ts`
  (per-request, cookie-bound, RLS-scoped to the caller — used by nearly everything), `public.ts`
  (anon key, no cookies — used by public-read catalogue queries so they also work inside
  `generateStaticParams`, which has no request to read cookies from), `admin.ts` (service-role,
  `server-only`, used exclusively for Storage uploads — never for data a user's own RLS grants
  should already cover).
- **Auth**: Supabase Auth. Sign-in/sign-up/sign-out run on the *browser* client (inside
  `AuthContext` and the admin login form) so session changes are picked up immediately by every
  client context; `src/lib/auth/session.ts` and `admin-guard.ts` are the server-side source of
  truth every protected page/action re-checks — `proxy.ts` (middleware) is only a UX-level early
  redirect, not the authorization boundary.
- **Database** (`supabase/migrations/*.sql`): UUID PKs, RLS on every table, a `create_order`
  Postgres function that validates stock and recomputes price/discount/total from current DB
  prices atomically (client-supplied prices are never trusted).
- **Images**: `src/lib/services/image-service.ts` validates (real decoded format, not just the
  declared MIME type), resizes, strips metadata, re-encodes to WebP and uploads to Supabase
  Storage — used by every admin image upload (products, categories, banners, store logo). Nothing
  is ever stored as base64 in Postgres or written to the filesystem.
- **Listings**: `/category/[slug]` and `/search` build their filter/sort/pagination state from URL
  search params and run one `queryProducts()` database query — the full catalogue is never fetched
  into the browser to filter client-side.
- **Cart/Wishlist**: guest state lives in `localStorage`; signed-in state is persisted server-side
  and merged into the account on login. Either way, the product data shown (price, name, image,
  stock) is always re-fetched from the database, never trusted from a stale client copy.
- **Admin** (`/admin/**`): a separate `SUPER_ADMIN`-only area sharing the same Next.js app. Every
  admin page and Server Action independently re-verifies the caller's role server-side.

## Notes / known limitations

- Seed data intentionally ships **without product/banner photography** — Wikimedia Commons search
  doesn't reliably return clean, topically-accurate product photos, and there's no stock-photo API
  key configured here. Seeded products/banners render the existing icon-on-tint `ProductArt`/
  `HeroArt` placeholders instead. The full image pipeline is real and working — upload real photos
  for any product, category or banner via `/admin/products`, `/admin/categories` or `/admin/banners`
  and they render immediately (WebP, optimized, served from Supabase Storage).
- Deploying to Vercel: create a hosted Supabase project, run `supabase link` then
  `supabase db push` to apply `supabase/migrations/`, set `NEXT_PUBLIC_SUPABASE_URL` /
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` (server-only — never expose this one
  to the browser) as Vercel environment variables, then run `pnpm seed` once against that project
  (or use the admin panel to populate it from scratch).
