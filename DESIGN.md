# LocalFix Design System

Grounded in the actual subject: local tradespeople (electricians, plumbers, AC techs,
painters, carpenters, mechanics) serving three small Tamil Nadu towns. The visual
language borrows from hardware-store signage and service-vehicle livery — sturdy,
legible, a little industrial — not a generic SaaS dashboard.

## Color (use as Tailwind theme tokens, not raw hex in components)

- `canvas` #F4F6F3 — page background, pale sage-white (not cream/terracotta — avoids
  the templated AI palette)
- `ink` #142420 — primary text, deep charcoal-green (never pure black)
- `brand` #0E5C52 — deep pipe-teal, primary/trust color: nav, links, verified provider
  accents, primary outline buttons
- `signal` #E39A2D — hazard-amber, the one CTA color: "Request Service", "Book Now",
  "Get Started" — used sparingly, only for the primary action on a screen
- `line` #DCE3DD — soft sage-grey borders/dividers (cards use 1px borders, not heavy
  drop shadows)
- `verified` #3F7D4C — verified badge / success states (distinct hue from brand teal)
- `danger` #B3452F — muted brick red for disputed/cancelled/errors (never pure red)
- `paper` #FFFFFF — card surfaces on top of canvas

## Type

- Display/headings: **Archivo** (700/800) — wide, confident, sign-like. Used for H1–H3
  and anything acting as a visual anchor (hero headline, section titles, big stats).
- Body/UI: **Inter** (400/500/600) — all body copy, labels, buttons, form fields.
- No all-caps labels, no tracked-out eyebrows, no single-word-highlight headlines.
- Line length under ~75ch for body copy.

## Shape & elevation (brief mandates these — keep them but avoid the generic kit)

- Buttons: `rounded-xl` (major actions) — never a full pill except status/category
  badges, which are pill-shaped per brief.
- Cards: `rounded-2xl`, 1px `line`-colored border, minimal/no shadow. Hierarchy comes
  from color-blocking and spacing, not stacked drop shadows.
- One soft shadow reserved for floating/sticky elements only (mobile bottom nav,
  toast notifications) — not on every card.

## Layout

- Mobile-first, single column, left-aligned text (not centered marketing blocks).
- Hero on the home page: real content first — a search box framed like a job-request
  ticket, not a big centered headline + gradient blob.
- Motion: one deliberate entrance on the hero search box on load; otherwise motion
  only responds to user action (accept/reject, status change, accordion, modal).

## Components sharing this system

Button, Card, Input, Select, StatusBadge, Rating, ProviderCard, ServiceCard,
BookingCard, CommissionCard all pull from the same Tailwind tokens defined in
`tailwind.config.ts` — never hardcode hex values in a component.
