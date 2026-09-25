import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return inr.format(amount);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Display-only preview of the commission split. The database trigger
 * (set_booking_commission in 002_functions_triggers.sql) is the source of
 * truth — this is only used to show a live preview in the UI before the
 * provider submits a final amount, and always rounds to 2 decimals the same
 * way the trigger does.
 */
export function previewCommissionSplit(finalAmount: number, commissionPercentage: number) {
  const commissionAmount = Math.round(finalAmount * commissionPercentage) / 100;
  const providerAmount = Math.round((finalAmount - commissionAmount) * 100) / 100;
  return { commissionAmount, providerAmount };
}

export function whatsappLink(phone: string, message?: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  const normalized = digits.startsWith("91") ? digits : `91${digits}`;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${normalized}${text}`;
}

export function telLink(phone: string): string {
  return `tel:${phone}`;
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  on_the_way: "On the way",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

export const TOWNS = ["Villukuri", "Thuckalay", "Marthandam"] as const;
