-- Closes a gap in 002_functions_triggers.sql: the original trigger only
-- computed commission on the pending-ish -> 'completed' transition, keyed
-- off OLD.status. That breaks the moment a completed booking is disputed
-- and then resolved back to 'completed' by an admin (003/AdminBookingActions)
-- — OLD.status ('disputed') is distinct from 'completed', so the old trigger
-- would treat it as a fresh completion and recompute commission using
-- WHATEVER the current default/provider rate is, silently overwriting the
-- rate that was actually locked in when the job first completed. That
-- violates the hard requirement: "if the admin later changes the default
-- commission... historical bookings must remain at the commission
-- percentage that applied when they were completed."
--
-- Fix: key off whether commission_percentage has ever been set on the row,
-- not off the previous status. Once it's set, it's locked — full stop,
-- regardless of which status the booking bounces through afterwards. And
-- once locked, nobody (customer, provider, or the disputed->completed
-- resolution path) can change final_amount or the commission fields without
-- going through a fresh completion.

create or replace function set_booking_commission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  applicable_percentage numeric(5, 2);
begin
  -- Commission was already computed at some point (this booking has been
  -- completed before, however it got back to 'completed' status) — lock it.
  if old.commission_percentage is not null then
    if new.status = 'completed' and (
      new.final_amount is distinct from old.final_amount
      or new.commission_percentage is distinct from old.commission_percentage
      or new.commission_amount is distinct from old.commission_amount
      or new.provider_amount is distinct from old.provider_amount
    ) then
      raise exception 'final_amount and commission fields are locked once a booking has been completed';
    end if;
    return new;
  end if;

  -- First time this booking reaches 'completed' — compute and freeze.
  if new.status = 'completed' and old.status is distinct from 'completed' then

    if new.final_amount is null then
      raise exception 'final_amount must be set before a booking can be completed';
    end if;

    -- RLS lets the customer update their own booking rows too (so they can
    -- cancel / confirm / dispute), which means RLS alone can't stop a
    -- customer from setting status = 'completed' themselves. Enforce it
    -- here instead: only the owning provider, an admin, or a service-role
    -- context (auth.uid() is null — used by scripts/seed.ts) may complete
    -- a job.
    if auth.uid() is not null
       and not is_admin(auth.uid())
       and not exists (select 1 from providers where id = new.provider_id and user_id = auth.uid())
    then
      raise exception 'only the provider or an admin can complete a booking';
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
    new.commission_percentage := null;
    new.commission_amount := null;
    new.provider_amount := null;
  end if;

  return new;
end;
$$;
