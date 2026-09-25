export type UserRole = "customer" | "provider" | "admin";

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "on_the_way"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";

export type CommissionStatus = "pending" | "paid_to_localfix" | "waived" | "disputed";

export type PaymentStatus = "unpaid" | "paid_directly" | "disputed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          full_name: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
      };
      providers: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          description: string | null;
          phone: string;
          profile_image: string | null;
          town: string;
          address: string | null;
          experience_years: number;
          starting_price: number | null;
          availability_note: string | null;
          is_verified: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["providers"]["Row"]> & {
          user_id: string;
          business_name: string;
          phone: string;
          town: string;
        };
        Update: Partial<Database["public"]["Tables"]["providers"]["Row"]>;
      };
      provider_services: {
        Row: {
          id: string;
          provider_id: string;
          category_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["provider_services"]["Row"]> & {
          provider_id: string;
          category_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["provider_services"]["Row"]>;
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          provider_id: string;
          category_id: string;
          service_description: string;
          customer_address: string;
          customer_phone: string;
          preferred_date: string;
          preferred_time: string;
          provider_note: string | null;
          customer_note: string | null;
          status: BookingStatus;
          estimated_amount: number | null;
          final_amount: number | null;
          customer_confirmed_amount: boolean;
          amount_confirmed_at: string | null;
          commission_percentage: number | null;
          commission_amount: number | null;
          provider_amount: number | null;
          commission_status: CommissionStatus;
          payment_status: PaymentStatus;
          admin_note: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["bookings"]["Row"]> & {
          customer_id: string;
          provider_id: string;
          category_id: string;
          service_description: string;
          customer_address: string;
          customer_phone: string;
          preferred_date: string;
          preferred_time: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Row"]>;
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          customer_id: string;
          provider_id: string;
          rating: number;
          review: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reviews"]["Row"]> & {
          booking_id: string;
          customer_id: string;
          provider_id: string;
          rating: number;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Row"]>;
      };
      commission_settings: {
        Row: {
          id: string;
          default_commission_percentage: number;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["commission_settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["commission_settings"]["Row"]>;
      };
      provider_commission_settings: {
        Row: {
          id: string;
          provider_id: string;
          commission_percentage: number;
          reason: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["provider_commission_settings"]["Row"]> & {
          provider_id: string;
          commission_percentage: number;
        };
        Update: Partial<Database["public"]["Tables"]["provider_commission_settings"]["Row"]>;
      };
      commission_history: {
        Row: {
          id: string;
          booking_id: string;
          provider_id: string;
          previous_status: string | null;
          new_status: string | null;
          previous_amount: number | null;
          new_amount: number | null;
          changed_by: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["commission_history"]["Row"]> & {
          booking_id: string;
          provider_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["commission_history"]["Row"]>;
      };
    };
  };
}
