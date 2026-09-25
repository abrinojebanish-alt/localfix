import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  fullName: z.string().min(1),
  businessName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10),
  town: z.string().min(1),
  address: z.string().optional(),
  experienceYears: z.coerce.number().int().min(0),
  startingPrice: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  categoryIds: z.array(z.string().uuid()).min(1, "Select at least one service"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." },
      { status: 400 }
    );
  }

  const {
    fullName,
    businessName,
    email,
    password,
    phone,
    town,
    address,
    experienceYears,
    startingPrice,
    description,
    categoryIds,
  } = parsed.data;

  const admin = createAdminClient();

  // Auto-confirmed so a new provider can log in immediately and see their
  // "waiting for verification" status — the review gate is is_verified on
  // the providers table, not email confirmation.
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone, role: "provider" },
  });

  if (userError || !userData.user) {
    const message = userError?.message.toLowerCase().includes("already")
      ? "An account with this email already exists."
      : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { data: provider, error: providerError } = await admin
    .from("providers")
    .insert({
      user_id: userData.user.id,
      business_name: businessName,
      description: description || null,
      phone,
      town,
      address: address || null,
      experience_years: experienceYears,
      starting_price: startingPrice ?? null,
      is_verified: false,
      is_active: true,
    })
    .select()
    .single();

  if (providerError || !provider) {
    // Roll back the auth user so a failed registration doesn't leave an
    // orphaned account behind.
    await admin.auth.admin.deleteUser(userData.user.id);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  const { error: servicesError } = await admin
    .from("provider_services")
    .insert(categoryIds.map((categoryId) => ({ provider_id: provider.id, category_id: categoryId })));

  if (servicesError) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
