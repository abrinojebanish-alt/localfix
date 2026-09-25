import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import type { BookingWithDetails, UserRole } from "@/types";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";

interface BookingCardProps {
  booking: BookingWithDetails;
  viewerRole: UserRole;
}

export function BookingCard({ booking, viewerRole }: BookingCardProps) {
  const href =
    viewerRole === "provider"
      ? `/provider/bookings/${booking.id}`
      : viewerRole === "admin"
        ? `/admin/bookings/${booking.id}`
        : `/bookings/${booking.id}`;

  const title =
    viewerRole === "provider"
      ? booking.customer_name
      : viewerRole === "admin"
        ? `${booking.customer_name} → ${booking.provider_business_name}`
        : booking.provider_business_name;

  return (
    <Link href={href}>
      <Card className="transition-colors hover:border-brand">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-base font-bold text-ink">{title}</p>
            <p className="text-sm text-ink/60">{booking.category_name}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink/60">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {formatDate(booking.preferred_date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {booking.preferred_time}
          </span>
        </div>
      </Card>
    </Link>
  );
}
