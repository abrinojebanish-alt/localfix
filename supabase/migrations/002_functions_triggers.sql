-- ---------------------------------------------------------------------------
-- HELPER FUNCTIONS (used by RLS policies — must be stable + security definer
-- where they need to read profiles/providers across RLS boundaries)
-- ---------------------------------------------------------------------------

create or replace function is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = uid and role = 'admin'
  );
$$;

create or replace function is_provider_owner(uid uuid, target_provider_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from providers where id = target_provider_id and user_id = uid
  );
$$;

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();

create trigger providers_set_updated_at before update on providers
  for each row execute function set_updated_at();

create trigger bookings_set_updated_at before update on bookings
  for each row execute function set_updated_at();

create trigger provider_commission_settings_set_updated_at before update on provider_commission_settings
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create a profile row when a new auth user signs up.
-- full_name / role / phone are passed in via signUp() options.data.
-- ---------------------------------------------------------------------------

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Commission calculation.
--
-- Fires only on the pending/accepted/... -> 'completed' transition.
-- The applicable commission % is resolved at THIS moment (provider override,
-- else platform default) and frozen onto the row — later changes to
-- commission_settings or provider_commission_settings must never retroactively
-- change an already-completed booking.
--
-- Uses numeric(10,2)/numeric(5,2) throughout — never floating point — and
-- rounds to 2 decimal places per spec.
-- ---------------------------------------------------------------------------

create or replace function set_booking_commission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  applicable_percentage numeric(5, 2);
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then

    if new.final_amount is null then
      raise exception 'final_amount must be set before a booking can be completed';
    end if;

    select coalesce(
      (select commission_percentage from provider_commission_settings
        where provider_id = new.provider_id),
      (select default_commission_percentage from commission_settings limit 1),
      10.00
    ) into applicable_percentage;

    new.commission_percentage := applicable_percentage;
    new.commission_amount := round(new.final_amount * applicable_percentage / 100, 2);
    new.provider_amount := round(new.final_amount - new.commission_amount, 2);
    new.commission_status := 'pending';
    new.completed_at := now();

  elsif new.status in ('pending', 'rejected', 'cancelled') then
    -- no commission applies to these states
    new.commission_percentage := null;
    new.commission_amount := null;
    new.provider_amount := null;
  end if;

  return new;
end;
$$;

create trigger bookings_set_commission
  before update on bookings
  for each row execute function set_booking_commission();

-- ---------------------------------------------------------------------------
-- Commission audit log — records every status or amount change relevant to
-- commission so admins have a full history.
-- ---------------------------------------------------------------------------

create or replace function log_commission_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (old.status is distinct from new.status)
     or (old.commission_status is distinct from new.commission_status)
     or (old.commission_amount is distinct from new.commission_amount) then

    insert into commission_history (
      booking_id, provider_id, previous_status, new_status,
      previous_amount, new_amount, changed_by, reason
    ) values (
      new.id, new.provider_id, old.status::text, new.status::text,
      old.commission_amount, new.commission_amount,
      auth.uid(),
      case
        when old.commission_status is distinct from new.commission_status
          then 'commission_status: ' || old.commission_status::text || ' -> ' || new.commission_status::text
        else null
      end
    );
  end if;
  return new;
end;
$$;

create trigger bookings_log_commission_history
  after update on bookings
  for each row execute function log_commission_history();
