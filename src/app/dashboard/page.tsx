import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, ListChecks } from "lucide-react";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { BookingCard } from "@/components/shared/BookingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { HeroSearch } from "@/components/shared/HeroSearch";
import { requireProfile } from "@/lib/auth";
import { getActiveCategories } from "@/lib/data/categories";
import { getCustomerBookings } from "@/lib/data/bookings";

export const metadata: Metadata = {
  title: "Dashboard",
};

const ACTIVE_STATUSES = ["pending", "accepted", "on_the_way", "in_progress"];

export default async function CustomerDashboardPage() {
  const profile = await requireProfile(["customer"]);
  const [categories, bookings] = await Promise.all([
    getActiveCategories(),
    getCustomerBookings(profile.id),
  ]);

  const activeBookings = bookings.filter((b) => ACTIVE_STATUSES.includes(b.status));
  const recentBookings = bookings.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-extrabold text-ink">
        Welcome back, {profile.full_name.split(" ")[0]}
      </h1>

      <div className="mt-6">
        <HeroSearch />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-ink">Popular Services</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <ServiceCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Active Bookings</h2>
          <Link href="/bookings" className="text-sm font-medium text-brand hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4">
          {activeBookings.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {activeBookings.map((booking) => (
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
      </section>

      {recentBookings.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Recent Bookings</h2>
            <Link href="/bookings" className="text-sm font-medium text-brand hover:underline">
              <span className="inline-flex items-center gap-1">
                <ListChecks className="h-4 w-4" /> Full history
              </span>
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {recentBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} viewerRole="customer" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
