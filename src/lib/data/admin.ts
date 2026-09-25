import { createClient } from "@/lib/supabase/server";
import type { Provider, Profile } from "@/types";

export async function getAllProvidersForAdmin(): Promise<Provider[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAllCustomersForAdmin(): Promise<Profile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export interface PlatformStats {
  totalCustomers: number;
  totalProviders: number;
  pendingProviders: number;
  totalBookings: number;
  completedBookings: number;
  activeBookings: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const supabase = createClient();

  const [{ count: totalCustomers }, providers, { count: totalBookings }, { count: completedBookings }, { count: activeBookings }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("providers").select("is_verified"),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "completed"),
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "accepted", "on_the_way", "in_progress"]),
    ]);

  const providerRows = providers.data ?? [];

  return {
    totalCustomers: totalCustomers ?? 0,
    totalProviders: providerRows.length,
    pendingProviders: providerRows.filter((p) => !p.is_verified).length,
    totalBookings: totalBookings ?? 0,
    completedBookings: completedBookings ?? 0,
    activeBookings: activeBookings ?? 0,
  };
}
