/**
 * Development seed data — fictional providers only, per spec. Never run
 * this against a production project; it uses the service-role key and
 * inserts test accounts with a shared throwaway password.
 *
 * Usage: npm run seed   (reads .env.local via dotenv)
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const SEED_PASSWORD = "LocalFixDev123!";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TOWNS = ["Villukuri", "Thuckalay", "Marthandam"];

const FICTIONAL_PROVIDERS = [
  { name: "Arun Kumar", business: "Arun Electricals", email: "arun.electricals@example.com", categories: ["electrician"], town: "Villukuri", experience: 8, price: 200 },
  { name: "Suresh Kumar", business: "Kumar Plumbing Services", email: "kumar.plumbing@example.com", categories: ["plumber"], town: "Thuckalay", experience: 5, price: 250 },
  { name: "Mary Joseph", business: "Mary's AC Care", email: "marys.accare@example.com", categories: ["ac-repair", "refrigerator-repair"], town: "Marthandam", experience: 6, price: 350 },
  { name: "Rajesh Nair", business: "Raj Home Repairs", email: "raj.homerepairs@example.com", categories: ["carpenter", "painting"], town: "Villukuri", experience: 10, price: 300 },
  { name: "Divya Mohan", business: "Southside Appliance Care", email: "southside.appliance@example.com", categories: ["appliance-repair", "washing-machine-repair"], town: "Thuckalay", experience: 4, price: 250 },
  { name: "Karthik R", business: "Karthik Auto Works", email: "karthik.autoworks@example.com", categories: ["bike-service", "car-service"], town: "Marthandam", experience: 7, price: 300 },
  { name: "Lakshmi S", business: "Sparkle Home Cleaning", email: "sparkle.cleaning@example.com", categories: ["cleaning"], town: "Villukuri", experience: 3, price: 400 },
  { name: "Vinod P", business: "Pure Water RO Service", email: "purewater.ro@example.com", categories: ["ro-service"], town: "Thuckalay", experience: 5, price: 200 },
];

const FICTIONAL_CUSTOMERS = [
  { name: "Anitha Raj", email: "anitha.customer@example.com" },
  { name: "Bala Subramanian", email: "bala.customer@example.com" },
  { name: "Priya Chandran", email: "priya.customer@example.com" },
];

async function createUser(email: string, fullName: string, role: "customer" | "provider", phone: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: SEED_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName, role, phone },
  });
  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      const { data: list } = await admin.auth.admin.listUsers();
      const existing = list.users.find((u) => u.email === email);
      if (existing) return existing.id;
    }
    throw error;
  }
  return data.user!.id;
}

async function main() {
  console.log("Seeding LocalFix development data…\n");

  const { data: categories } = await admin.from("categories").select("id, slug");
  const categoryBySlug = new Map((categories ?? []).map((c) => [c.slug, c.id]));

  const providerIds: string[] = [];

  for (const p of FICTIONAL_PROVIDERS) {
    const phone = `9${Math.floor(100000000 + Math.random() * 899999999)}`;
    const userId = await createUser(p.email, p.name, "provider", phone);

    const { data: existingProvider } = await admin.from("providers").select("id").eq("user_id", userId).maybeSingle();

    let providerId = existingProvider?.id;
    if (!providerId) {
      const { data: provider, error } = await admin
        .from("providers")
        .insert({
          user_id: userId,
          business_name: p.business,
          description: `Trusted ${p.categories.join(", ")} service in ${p.town}.`,
          phone,
          town: p.town,
          experience_years: p.experience,
          starting_price: p.price,
          is_verified: true,
          is_active: true,
        })
        .select("id")
        .single();
      if (error) throw error;
      providerId = provider.id;

      const serviceRows = p.categories
        .map((slug) => categoryBySlug.get(slug))
        .filter(Boolean)
        .map((categoryId) => ({ provider_id: providerId, category_id: categoryId as string }));
      if (serviceRows.length > 0) {
        await admin.from("provider_services").insert(serviceRows);
      }
    }

    providerIds.push(providerId);
    console.log(`✓ Provider: ${p.business} (${p.town})`);
  }

  const customerIds: string[] = [];
  for (const c of FICTIONAL_CUSTOMERS) {
    const phone = `8${Math.floor(100000000 + Math.random() * 899999999)}`;
    const userId = await createUser(c.email, c.name, "customer", phone);
    customerIds.push(userId);
    console.log(`✓ Customer: ${c.name}`);
  }

  // A couple of sample bookings across a few statuses, so the app has
  // something to show immediately after seeding.
  const { data: firstCategory } = await admin.from("categories").select("id").limit(1).single();

  if (firstCategory && providerIds[0] && customerIds[0]) {
    await admin.from("bookings").insert({
      customer_id: customerIds[0],
      provider_id: providerIds[0],
      category_id: firstCategory.id,
      service_description: "Living room ceiling fan not working",
      customer_address: "12 Main Street, Villukuri",
      customer_phone: "9123456780",
      preferred_date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
      preferred_time: "10:00 AM",
      status: "pending",
    });

    // Insert as pending, then update to completed — the commission trigger
    // (002_functions_triggers.sql) only fires on UPDATE, matching how a real
    // booking reaches "completed" through the app's status flow.
    const { data: secondBooking } = await admin
      .from("bookings")
      .insert({
        customer_id: customerIds[1] ?? customerIds[0],
        provider_id: providerIds[1] ?? providerIds[0],
        category_id: firstCategory.id,
        service_description: "Kitchen tap leaking",
        customer_address: "45 Lake Road, Thuckalay",
        customer_phone: "9123456781",
        preferred_date: new Date().toISOString().slice(0, 10),
        preferred_time: "2:00 PM",
        status: "pending",
      })
      .select("id")
      .single();

    if (secondBooking) {
      await admin
        .from("bookings")
        .update({ status: "completed", final_amount: 500, customer_confirmed_amount: true })
        .eq("id", secondBooking.id);
    }

    console.log("✓ Sample bookings created");
  }

  console.log(`\nDone. All seeded accounts use the password: ${SEED_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
