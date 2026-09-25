import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";
import { BookingCard } from "@/components/shared/BookingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireProfile } from "@/lib/auth";
import { getCustomerBookings } from "@/lib/data/bookings";

export const metadata: Metadata = {
  title: "My Bookings",
};

export default async function CustomerBookingsPage() {
  const profile = await requireProfile(["customer"]);
  const bookings = await getCustomerBookings(profile.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-extrabold text-ink">My Bookings</h1>

      <div className="mt-6">
        {bookings.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} viewerRole="customer" />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarClock}
            title="You don't have any bookings yet."
            actionLabel="Find a Service"
            actionHref="/providers"
          />
        )}
      </div>
    </div>
  );
}
