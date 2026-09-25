import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminBookingActions } from "@/components/shared/AdminBookingActions";
import { requireProfile } from "@/lib/auth";
import { getBookingById } from "@/lib/data/bookings";
import { formatDate, formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Booking Details" };

export default async function AdminBookingDetailPage({ params }: { params: { id: string } }) {
  await requireProfile(["admin"]);
  const booking = await getBookingById(params.id);
  if (!booking) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-xl font-extrabold text-ink">
            {booking.customer_name} → {booking.provider_business_name}
          </h1>
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
          <p className="text-sm font-medium text-ink">Service description</p>
          <p className="mt-1 text-sm text-ink/70">{booking.service_description}</p>
        </div>
      </Card>

      {booking.final_amount !== null && (
        <Card className="mt-6">
          <p className="font-display text-base font-bold text-ink">Commission breakdown</p>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60">Service Amount</span>
              <span className="text-ink">{formatCurrency(booking.final_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Commission % </span>
              <span className="text-ink">{booking.commission_percentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Commission</span>
              <span className="text-ink">{formatCurrency(booking.commission_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Provider Amount</span>
              <span className="text-ink">{formatCurrency(booking.provider_amount)}</span>
            </div>
          </div>
        </Card>
      )}

      <div className="mt-6">
        <AdminBookingActions booking={booking} />
      </div>
    </div>
  );
}
