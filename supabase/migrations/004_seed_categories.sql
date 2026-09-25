-- Initial service categories. This is real launch data, unlike scripts/seed.ts
-- (which creates fictional providers for local development only).

insert into categories (name, slug, description, icon) values
  ('Electrician', 'electrician', 'Wiring, switches, fans, and electrical repairs', 'Zap'),
  ('Plumber', 'plumber', 'Pipes, taps, leaks, and bathroom fittings', 'Wrench'),
  ('AC Repair', 'ac-repair', 'AC installation, servicing, and gas refill', 'Snowflake'),
  ('Appliance Repair', 'appliance-repair', 'Home appliance repair and maintenance', 'Settings'),
  ('Cleaning', 'cleaning', 'Home and office deep cleaning', 'Sparkles'),
  ('Painting', 'painting', 'Interior and exterior painting', 'PaintRoller'),
  ('Carpenter', 'carpenter', 'Furniture repair and woodwork', 'Hammer'),
  ('RO Service', 'ro-service', 'Water purifier installation and service', 'Droplet'),
  ('Washing Machine Repair', 'washing-machine-repair', 'Washing machine repair and service', 'WashingMachine'),
  ('Refrigerator Repair', 'refrigerator-repair', 'Refrigerator repair and gas refill', 'Refrigerator'),
  ('Bike Service', 'bike-service', 'Two-wheeler servicing and repair', 'Bike'),
  ('Car Service', 'car-service', 'Car servicing and repair', 'Car');
