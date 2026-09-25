import { createClient } from "@/lib/supabase/server";
import type { BookingWithDetails, Booking } from "@/types";

const DETAIL_SELECT = `
  *,
  provider:providers(business_name, phone),
  category:categories(name),
  customer:profiles!bookings_customer_id_fkey(full_name)
`;

function toBookingWithDetails(row: any): BookingWithDetails {
  return {
    ...row,
    provider_business_name: row.provider?.business_name ?? "Provider",
    provider_phone: row.provider?.phone ?? "",
    category_name: row.category?.name ?? "Service",
    customer_name: row.customer?.full_name ?? "Customer",
  };
}

export async function getCustomerBookings(customerId: string): Promise<BookingWithDetails[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(DETAIL_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toBookingWithDetails);
}

export async function getProviderBookings(providerId: string): Promise<BookingWithDetails[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(DETAIL_SELECT)
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toBookingWithDetails);
}

export async function getBookingById(id: string): Promise<BookingWithDetails | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? toBookingWithDetails(data) : null;
}

export async function getAllBookings(): Promise<BookingWithDetails[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(DETAIL_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toBookingWithDetails);
}
