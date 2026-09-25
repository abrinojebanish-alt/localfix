import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin, Phone, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { CustomerBookingActions } from "@/components/shared/CustomerBookingActions";
import { requireProfile } from "@/lib/auth";
import { getBookingById } from "@/lib/data/bookings";
import { createClient } from "@/lib/supabase/server";
import { formatDate, telLink, whatsappLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Booking Details" };

export default async function CustomerBookingDetailPage({ params }: { params: { id: string } }) {
  const profile = await requireProfile(["customer"]);
  const booking = await getBookingById(params.id);

  if (!booking || booking.customer_id !== profile.id) notFound();

  const supabase = createClient();
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", booking.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">{booking.provider_business_name}</h1>
          <p className="text-ink/60">{booking.category_name}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <Card className="mt-6">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-ink/70">
            <Calendar className="h-4 w-4" /> {formatDate(booking.preferred_date)}
          </div>
          <div className="flex items-center gap-2 text-ink/70">
            <Clock className="h-4 w-4" /> {booking.preferred_time}
          </div>
          <div className="flex items-center gap-2 text-ink/70">
            <MapPin className="h-4 w-4" /> {booking.customer_address}
          </div>
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <p className="text-sm font-medium text-ink">What you need done</p>
          <p className="mt-1 text-sm text-ink/70">{booking.service_description}</p>
        </div>

        {booking.customer_note && (
          <div className="mt-4">
            <p className="text-sm font-medium text-ink">Your note</p>
            <p className="mt-1 text-sm text-ink/70">{booking.customer_note}</p>
          </div>
        )}

        {booking.provider_note && (
          <div className="mt-4">
            <p className="text-sm font-medium text-ink">Note from provider</p>
            <p className="mt-1 text-sm text-ink/70">{booking.provider_note}</p>
          </div>
        )}

        <div className="mt-4 flex gap-2 border-t border-line pt-4">
          <a href={telLink(booking.provider_phone)}>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4" /> Call Provider
            </Button>
          </a>
          <a href={whatsappLink(booking.provider_phone)} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
          </a>
        </div>
      </Card>

      <div className="mt-6">
        <CustomerBookingActions booking={booking} hasReview={!!existingReview} />
      </div>
    </div>
  );
}
