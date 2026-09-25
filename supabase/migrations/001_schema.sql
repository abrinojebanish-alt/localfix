-- LocalFix V1 — core schema
-- Run in order: 001_schema.sql, 002_functions_triggers.sql, 003_rls.sql, 004_seed_categories.sql

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

create type user_role as enum ('customer', 'provider', 'admin');

create type booking_status as enum (
  'pending',
  'accepted',
  'rejected',
  'on_the_way',
  'in_progress',
  'completed',
  'cancelled',
  'disputed'
);

create type commission_status as enum (
  'pending',
  'paid_to_localfix',
  'waived',
  'disputed'
);

create type payment_status as enum (
  'unpaid',
  'paid_directly',
  'disputed'
);

-- ---------------------------------------------------------------------------
-- PROFILES  (1:1 with auth.users)
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role user_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on profiles(role);

-- ---------------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------------

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- PROVIDERS
-- ---------------------------------------------------------------------------

create table providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  business_name text not null,
  description text,
  phone text not null,
  profile_image text,
  town text not null,
  address text,
  experience_years integer not null default 0 check (experience_years >= 0),
  starting_price numeric(10, 2) check (starting_price >= 0),
  is_verified boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index providers_town_idx on providers(town);
create index providers_verified_active_idx on providers(is_verified, is_active);

-- ---------------------------------------------------------------------------
-- PROVIDER SERVICES (many-to-many: providers <-> categories)
-- ---------------------------------------------------------------------------

create table provider_services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (provider_id, category_id)
);

create index provider_services_provider_idx on provider_services(provider_id);
create index provider_services_category_idx on provider_services(category_id);

-- ---------------------------------------------------------------------------
-- COMMISSION SETTINGS (platform default — singleton table)
-- ---------------------------------------------------------------------------

create table commission_settings (
  id uuid primary key default gen_random_uuid(),
  default_commission_percentage numeric(5, 2) not null default 10.00
    check (default_commission_percentage >= 0 and default_commission_percentage <= 100),
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- PROVIDER-SPECIFIC COMMISSION OVERRIDES
-- ---------------------------------------------------------------------------

create table provider_commission_settings (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null unique references providers(id) on delete cascade,
  commission_percentage numeric(5, 2) not null
    check (commission_percentage >= 0 and commission_percentage <= 100),
  reason text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- BOOKINGS
-- ---------------------------------------------------------------------------

create table bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id) on delete cascade,
  provider_id uuid not null references providers(id) on delete cascade,
  category_id uuid not null references categories(id),

  service_description text not null,
  customer_address text not null,
  customer_phone text not null,
  preferred_date date not null,
  preferred_time text not null,
  provider_note text,
  customer_note text,

  status booking_status not null default 'pending',

  estimated_amount numeric(10, 2) check (estimated_amount >= 0),
  final_amount numeric(10, 2) check (final_amount >= 0),
  customer_confirmed_amount boolean not null default false,
  amount_confirmed_at timestamptz,

  -- commission is frozen onto the booking at completion time — see 002_functions_triggers.sql
  commission_percentage numeric(5, 2),
  commission_amount numeric(10, 2),
  provider_amount numeric(10, 2),
  commission_status commission_status not null default 'pending',
  payment_status payment_status not null default 'unpaid',

  admin_note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index bookings_customer_idx on bookings(customer_id);
create index bookings_provider_idx on bookings(provider_id);
create index bookings_status_idx on bookings(status);
create index bookings_commission_status_idx on bookings(commission_status);

-- ---------------------------------------------------------------------------
-- REVIEWS  (one per completed booking)
-- ---------------------------------------------------------------------------

create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id) on delete cascade,
  customer_id uuid not null references profiles(id) on delete cascade,
  provider_id uuid not null references providers(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  review text,
  created_at timestamptz not null default now()
);

create index reviews_provider_idx on reviews(provider_id);

-- ---------------------------------------------------------------------------
-- COMMISSION HISTORY (audit trail for manual/system commission changes)
-- ---------------------------------------------------------------------------

create table commission_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  provider_id uuid not null references providers(id) on delete cascade,
  previous_status text,
  new_status text,
  previous_amount numeric(10, 2),
  new_amount numeric(10, 2),
  changed_by uuid references profiles(id),
  reason text,
  created_at timestamptz not null default now()
);

create index commission_history_booking_idx on commission_history(booking_id);

-- seed the singleton commission_settings row (default 10%)
insert into commission_settings (default_commission_percentage) values (10.00);
