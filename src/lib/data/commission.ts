import { createClient } from "@/lib/supabase/server";
import type { BookingWithDetails } from "@/types";

export interface CommissionSummary {
  totalServiceValue: number;
  totalCommission: number;
  commissionCollected: number;
  commissionPending: number;
  commissionDisputed: number;
  completedJobs: number;
}

export async function getCommissionSummary(): Promise<CommissionSummary> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("final_amount, commission_amount, commission_status")
    .eq("status", "completed");

  if (error) throw error;

  const rows = data ?? [];
  const summary: CommissionSummary = {
    totalServiceValue: 0,
    totalCommission: 0,
    commissionCollected: 0,
    commissionPending: 0,
    commissionDisputed: 0,
    completedJobs: rows.length,
  };

  for (const row of rows) {
    summary.totalServiceValue += row.final_amount ?? 0;
    summary.totalCommission += row.commission_amount ?? 0;
    if (row.commission_status === "paid_to_localfix") summary.commissionCollected += row.commission_amount ?? 0;
    if (row.commission_status === "pending") summary.commissionPending += row.commission_amount ?? 0;
    if (row.commission_status === "disputed") summary.commissionDisputed += row.commission_amount ?? 0;
  }

  return summary;
}

export async function getDefaultCommissionPercentage(): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("commission_settings")
    .select("default_commission_percentage")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.default_commission_percentage ?? 10;
}

export async function getCommissionSettingsRow() {
  const supabase = createClient();
  const { data, error } = await supabase.from("commission_settings").select("*").limit(1).maybeSingle();

  if (error) throw error;
  return data;
}

export async function getProviderEarnings(providerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("final_amount, commission_amount, provider_amount, commission_status, status")
    .eq("provider_id", providerId)
    .eq("status", "completed");

  if (error) throw error;

  const rows = data ?? [];
  let completedServiceValue = 0;
  let totalCommission = 0;
  let providerAmount = 0;
  let pendingCommission = 0;

  for (const row of rows) {
    completedServiceValue += row.final_amount ?? 0;
    totalCommission += row.commission_amount ?? 0;
    providerAmount += row.provider_amount ?? 0;
    if (row.commission_status === "pending") pendingCommission += row.commission_amount ?? 0;
  }

  return {
    completedServiceValue,
    totalCommission,
    providerAmount,
    pendingCommission,
    completedJobs: rows.length,
  };
}
