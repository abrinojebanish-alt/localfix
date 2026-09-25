import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Calendar, Clock, MapPin, Phone, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ProviderBookingActions } from "@/components/shared/ProviderBookingActions";
import { requireProfile } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/data/providers";
import { getBookingById } from "@/lib/data/bookings";
import { getDefaultCommissionPercentage } from "@/lib/data/commission";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatCurrency, telLink, whatsappLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Booking Details" };

export default async function ProviderBookingDetailPage({ params }: { params: { id: string } }) {
  const profile = await requireProfile(["provider"]);
  const provider = await getProviderByUserId(profile.id);
  if (!provider) redirect("/provider/register");

  const booking = await getBookingById(params.id);
  if (!booking || booking.provider_id !== provider.id) notFound();

  const supabase = createClient();
  const { data: override } = await supabase
    .from("provider_commission_settings")
    .select("commission_percentage")
    .eq("provider_id", provider.id)
    .maybeSingle();

  const commissionPercentage = override?.commission_percentage ?? (await getDefaultCommissionPercentage());

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">{booking.customer_name}</h1>
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
          <p className="text-sm font-medium text-ink">Customer request</p>
          <p className="mt-1 text-sm text-ink/70">{booking.service_description}</p>
        </div>

        {booking.customer_note && (
          <div className="mt-4">
            <p className="text-sm font-medium text-ink">Customer note</p>
            <p className="mt-1 text-sm text-ink/70">{booking.customer_note}</p>
          </div>
        )}

        <div className="mt-4 flex gap-2 border-t border-line pt-4">
          <a href={telLink(booking.customer_phone)}>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4" /> Call Customer
            </Button>
          </a>
          <a href={whatsappLink(booking.customer_phone)} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
          </a>
        </div>
      </Card>

      {booking.status === "completed" && (
        <Card className="mt-6">
          <p className="font-display text-base font-bold text-ink">Commission breakdown</p>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60">Final Service Amount</span>
              <span className="text-ink">{formatCurrency(booking.final_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">LocalFix Commission ({booking.commission_percentage}%)</span>
              <span className="text-ink">{formatCurrency(booking.commission_amount)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-ink">You receive</span>
              <span className="text-ink">{formatCurrency(booking.provider_amount)}</span>
            </div>
          </div>
          <StatusBadge status={booking.commission_status} />
        </Card>
      )}

      <div className="mt-6">
        <ProviderBookingActions booking={booking} commissionPercentage={commissionPercentage} />
      </div>
    </div>
  );
}
