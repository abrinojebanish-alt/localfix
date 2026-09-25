import type { Database } from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Provider = Database["public"]["Tables"]["providers"]["Row"];
export type ProviderService = Database["public"]["Tables"]["provider_services"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type CommissionSettings = Database["public"]["Tables"]["commission_settings"]["Row"];
export type ProviderCommissionSettings =
  Database["public"]["Tables"]["provider_commission_settings"]["Row"];
export type CommissionHistoryEntry = Database["public"]["Tables"]["commission_history"]["Row"];

export type { UserRole, BookingStatus, CommissionStatus, PaymentStatus } from "./database";

/** Provider profile card, as returned by the search/discovery query. */
export interface ProviderSummary extends Provider {
  categories: Category[];
  average_rating: number | null;
  review_count: number;
}

/** Full provider profile page data. */
export interface ProviderProfile extends ProviderSummary {
  reviews: (Review & { customer_name: string })[];
}

/** Booking with the joined names/labels the UI needs, without extra queries. */
export interface BookingWithDetails extends Booking {
  provider_business_name: string;
  provider_phone: string;
  category_name: string;
  customer_name: string;
}
