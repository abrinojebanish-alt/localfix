-- Simple free-text availability, per spec's "Set availability" provider
-- capability. Kept intentionally simple for V1 — no calendar/slot system.

alter table providers add column availability_note text;
