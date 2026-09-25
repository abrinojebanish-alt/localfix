# LocalFix

A local services marketplace connecting customers with trusted electricians, plumbers,
AC technicians, and other local professionals in Villukuri, Thuckalay, and Marthandam.

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase. No payment gateway —
LocalFix tracks commission on completed jobs; customers pay providers directly.

## 1. Prerequisites

- Node.js 18.17+
- A [Supabase](https://supabase.com) project (free tier is enough for V1's ~50
  providers / 100–200 customers)

## 2. Set up Supabase

1. Create a new Supabase project.
2. In **Project Settings → API**, copy the Project URL, anon/public key, and
   service_role key.
3. Copy `.env.local.example` to `.env.local` and fill in those three values, plus
   `NEXT_PUBLIC_SITE_URL` (use `http://localhost:3000` for local dev).
4. Run the SQL migrations **in order** — either paste each file into the Supabase SQL
   Editor, or use the Supabase CLI:

   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

   Migration order matters:
   `001_schema.sql` → `002_functions_triggers.sql` → `003_rls.sql` →
   `004_seed_categories.sql` → `005_storage.sql` → `006_availability.sql` →
   `007_lock_completed_commission.sql`

5. In **Authentication → Providers**, make sure Email is enabled. For the simplest V1
   launch, consider turning **Confirm email** off under **Authentication → Settings**
   so customer signup doesn't require an email round-trip (provider registration
   always auto-confirms, since it goes through a service-role API route).

## 3. Install and run

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## 4. Create your first admin

There's no self-serve admin signup (by design). After signing up a normal account,
promote it to admin directly in Supabase:

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

## 5. Seed development data (optional)

Creates ~8 fictional providers (verified, spread across all three towns), 3 fictional
customers, and a couple of sample bookings — enough to test search, booking, and
commission calculations locally.

```bash
npm run seed
```

All seeded accounts share the password printed at the end of the script. **Never run
this against a production project** — it uses the service-role key.

## 6. Before deploying

```bash
npm run typecheck
npm run lint
npm run build
```

Fix anything that fails before shipping. Then deploy to Vercel, setting the same four
environment variables from `.env.local` in the Vercel project settings
(`SUPABASE_SERVICE_ROLE_KEY` as a server-only/secret variable — never expose it to the
client).

## Project structure

```
src/
  app/            routes (App Router) — public, customer, provider, admin
  components/
    ui/           generic building blocks (Button, Card, Modal, ...)
    layout/       Navbar, Footer, Logo
    shared/       domain components (ProviderCard, BookingCard, forms, ...)
    auth/         login/signup/provider-registration forms
  lib/
    supabase/     browser / server / admin (service-role) clients
    data/         server-side query functions, grouped by domain
    auth.ts       requireProfile() route guard
    utils.ts      formatting helpers, constants
  types/          hand-written Database types + domain types
supabase/
  migrations/     run in numeric order
scripts/
  seed.ts         development-only seed data
```

## Commission model, in short

- Default rate is 10%, configurable at `/admin/settings`.
- Admins can set a different rate per provider at `/admin/providers` → **Commission**.
- The rate that actually applies is resolved and frozen onto the booking **at the
  moment it's marked completed** (`002_functions_triggers.sql`) — later changes to the
  default or a provider's rate never retroactively change a completed booking.
- LocalFix never claims to have collected the customer's payment — `payment_status` is
  informational only; money moves directly between customer and provider.
