import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import { BookingCard } from "@/components/shared/BookingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireProfile } from "@/lib/auth";
import { getAllBookings } from "@/lib/data/bookings";
import { BOOKING_STATUS_LABELS } from "@/lib/utils";

export const metadata: Metadata = { title: "Manage Bookings" };

interface PageProps {
  searchParams: { status?: string };
}

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  await requireProfile(["admin"]);
  const bookings = await getAllBookings();
  const filtered = searchParams.status ? bookings.filter((b) => b.status === searchParams.status) : bookings;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-extrabold text-ink">Bookings</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href="/admin/bookings"
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${!searchParams.status ? "bg-brand text-white" : "bg-ink/5 text-ink/70"}`}
        >
          All
        </a>
        {Object.entries(BOOKING_STATUS_LABELS).map(([status, label]) => (
          <a
            key={status}
            href={`/admin/bookings?status=${status}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${searchParams.status === status ? "bg-brand text-white" : "bg-ink/5 text-ink/70"}`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="mt-6">
        {filtered.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((booking) => (
              <BookingCard key={booking.id} booking={booking} viewerRole="admin" />
            ))}
          </div>
        ) : (
          <EmptyState icon={ClipboardList} title="No bookings found." />
        )}
      </div>
    </div>
  );
}
