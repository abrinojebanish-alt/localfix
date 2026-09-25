import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { CommissionCard } from "@/components/shared/CommissionCard";
import { BookingCard } from "@/components/shared/BookingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { VerificationPendingBanner } from "@/components/shared/VerificationPendingBanner";
import { requireProfile } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/data/providers";
import { getProviderBookings } from "@/lib/data/bookings";
import { getProviderEarnings } from "@/lib/data/commission";
import { redirect } from "next/navigation";
import type { BookingWithDetails } from "@/types";

export const metadata: Metadata = { title: "Provider Dashboard" };

export default async function ProviderDashboardPage() {
  const profile = await requireProfile(["provider"]);
  const provider = await getProviderByUserId(profile.id);
  if (!provider) redirect("/provider/register");

  const [bookings, earnings] = await Promise.all([
    getProviderBookings(provider.id),
    getProviderEarnings(provider.id),
  ]);

  const newRequests = bookings.filter((b) => b.status === "pending");
  const acceptedJobs = bookings.filter((b) => b.status === "accepted");
  const activeJobs = bookings.filter((b) => ["on_the_way", "in_progress"].includes(b.status));
  const completedJobs = bookings.filter((b) => b.status === "completed");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-extrabold text-ink">{provider.business_name}</h1>

      {!provider.is_verified && (
        <div className="mt-6">
          <VerificationPendingBanner />
        </div>
      )}

      <section className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <CommissionCard label="Completed Service Value" amount={earnings.completedServiceValue} />
        <CommissionCard label="LocalFix Commission" amount={earnings.totalCommission} tone="signal" />
        <CommissionCard label="Provider Amount" amount={earnings.providerAmount} tone="brand" />
        <CommissionCard label="Pending LocalFix Commission" amount={earnings.pendingCommission} />
      </section>
      <p className="mt-2 text-xs text-ink/50">
        LocalFix commission is recorded separately. Customer payments are made directly to providers.
      </p>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">New Requests {newRequests.length > 0 && `(${newRequests.length})`}</h2>
          <Link href="/provider/bookings" className="text-sm font-medium text-brand hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4">
          {newRequests.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {newRequests.map((b) => (
                <BookingCard key={b.id} booking={b} viewerRole="provider" />
              ))}
            </div>
          ) : (
            <EmptyState icon={Inbox} title="You don't have any new service requests." />
          )}
        </div>
      </section>

      {acceptedJobs.length > 0 && (
        <DashboardSection title="Accepted Jobs" bookings={acceptedJobs} />
      )}
      {activeJobs.length > 0 && (
        <DashboardSection title="Active Jobs" bookings={activeJobs} />
      )}
      {completedJobs.length > 0 && (
        <DashboardSection title="Completed Jobs" bookings={completedJobs.slice(0, 4)} />
      )}
    </div>
  );
}

function DashboardSection({ title, bookings }: { title: string; bookings: BookingWithDetails[] }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {bookings.map((b) => (
          <BookingCard key={b.id} booking={b} viewerRole="provider" />
        ))}
      </div>
    </section>
  );
}
