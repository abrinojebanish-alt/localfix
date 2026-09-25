-- All authorization is enforced here at the database level. The app's
-- frontend role checks (e.g. hiding the admin nav link) are UX only —
-- they are never the actual security boundary.

alter table profiles enable row level security;
alter table categories enable row level security;
alter table providers enable row level security;
alter table provider_services enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;
alter table commission_settings enable row level security;
alter table provider_commission_settings enable row level security;
alter table commission_history enable row level security;

-- ---------------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------------

create policy "profiles_select_own_or_admin"
  on profiles for select
  using (id = auth.uid() or is_admin(auth.uid()));

create policy "profiles_update_own_or_admin"
  on profiles for update
  using (id = auth.uid() or is_admin(auth.uid()))
  with check (id = auth.uid() or is_admin(auth.uid()));

-- No client-side insert policy: rows are created only by the
-- handle_new_user() trigger (security definer) on signup.

-- ---------------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------------

create policy "categories_select_active_or_admin"
  on categories for select
  using (is_active = true or is_admin(auth.uid()));

create policy "categories_admin_write"
  on categories for insert
  with check (is_admin(auth.uid()));

create policy "categories_admin_update"
  on categories for update
  using (is_admin(auth.uid()))
  with check (is_admin(auth.uid()));

create policy "categories_admin_delete"
  on categories for delete
  using (is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- PROVIDERS
-- ---------------------------------------------------------------------------

-- Public discovery only sees verified + active providers. Owners always see
-- their own row (so they can check status while pending review). Admins see
-- everything.
create policy "providers_select_public_or_own_or_admin"
  on providers for select
  using (
    (is_verified = true and is_active = true)
    or user_id = auth.uid()
    or is_admin(auth.uid())
  );

create policy "providers_insert_own"
  on providers for insert
  with check (user_id = auth.uid());

create policy "providers_update_own_or_admin"
  on providers for update
  using (user_id = auth.uid() or is_admin(auth.uid()))
  with check (user_id = auth.uid() or is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- PROVIDER_SERVICES
-- ---------------------------------------------------------------------------

create policy "provider_services_select"
  on provider_services for select
  using (
    exists (
      select 1 from providers p
      where p.id = provider_services.provider_id
        and (
          (p.is_verified = true and p.is_active = true)
          or p.user_id = auth.uid()
          or is_admin(auth.uid())
        )
    )
  );

create policy "provider_services_insert_own"
  on provider_services for insert
  with check (is_provider_owner(auth.uid(), provider_id) or is_admin(auth.uid()));

create policy "provider_services_delete_own"
  on provider_services for delete
  using (is_provider_owner(auth.uid(), provider_id) or is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- BOOKINGS
-- ---------------------------------------------------------------------------

create policy "bookings_select_participant_or_admin"
  on bookings for select
  using (
    customer_id = auth.uid()
    or is_provider_owner(auth.uid(), provider_id)
    or is_admin(auth.uid())
  );

create policy "bookings_insert_own_customer"
  on bookings for insert
  with check (
    customer_id = auth.uid()
    and exists (select 1 from profiles where id = auth.uid() and role = 'customer')
  );

-- Customers, the owning provider, and admins can all update a booking row —
-- which specific fields each is allowed to change (status transitions,
-- final_amount, confirmation, etc.) is enforced in the application layer
-- since Postgres RLS is row-level, not column-level.
create policy "bookings_update_participant_or_admin"
  on bookings for update
  using (
    customer_id = auth.uid()
    or is_provider_owner(auth.uid(), provider_id)
    or is_admin(auth.uid())
  )
  with check (
    customer_id = auth.uid()
    or is_provider_owner(auth.uid(), provider_id)
    or is_admin(auth.uid())
  );

-- ---------------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------------

-- Reviews are public (shown on provider profiles).
create policy "reviews_select_all"
  on reviews for select
  using (true);

create policy "reviews_insert_own_completed_booking"
  on reviews for insert
  with check (
    customer_id = auth.uid()
    and exists (
      select 1 from bookings b
      where b.id = booking_id
        and b.customer_id = auth.uid()
        and b.status = 'completed'
    )
  );

-- ---------------------------------------------------------------------------
-- COMMISSION_SETTINGS  (admin only)
-- ---------------------------------------------------------------------------

create policy "commission_settings_admin_select"
  on commission_settings for select
  using (is_admin(auth.uid()));

create policy "commission_settings_admin_update"
  on commission_settings for update
  using (is_admin(auth.uid()))
  with check (is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- PROVIDER_COMMISSION_SETTINGS
-- ---------------------------------------------------------------------------

create policy "provider_commission_settings_select"
  on provider_commission_settings for select
  using (is_provider_owner(auth.uid(), provider_id) or is_admin(auth.uid()));

create policy "provider_commission_settings_admin_write"
  on provider_commission_settings for insert
  with check (is_admin(auth.uid()));

create policy "provider_commission_settings_admin_update"
  on provider_commission_settings for update
  using (is_admin(auth.uid()))
  with check (is_admin(auth.uid()));

create policy "provider_commission_settings_admin_delete"
  on provider_commission_settings for delete
  using (is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- COMMISSION_HISTORY  (read-only audit trail; only the trigger writes to it)
-- ---------------------------------------------------------------------------

create policy "commission_history_select"
  on commission_history for select
  using (is_provider_owner(auth.uid(), provider_id) or is_admin(auth.uid()));

create policy "commission_history_admin_update"
  on commission_history for update
  using (is_admin(auth.uid()))
  with check (is_admin(auth.uid()));
