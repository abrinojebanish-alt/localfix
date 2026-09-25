import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Inbox } from "lucide-react";
import { BookingCard } from "@/components/shared/BookingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireProfile } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/data/providers";
import { getProviderBookings } from "@/lib/data/bookings";

export const metadata: Metadata = { title: "My Bookings" };

export default async function ProviderBookingsPage() {
  const profile = await requireProfile(["provider"]);
  const provider = await getProviderByUserId(profile.id);
  if (!provider) redirect("/provider/register");

  const bookings = await getProviderBookings(provider.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-extrabold text-ink">Bookings</h1>

      <div className="mt-6">
        {bookings.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} viewerRole="provider" />
            ))}
          </div>
        ) : (
          <EmptyState icon={Inbox} title="You don't have any bookings yet." />
        )}
      </div>
    </div>
  );
}
