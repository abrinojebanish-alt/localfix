import type { Metadata } from "next";
import { IndianRupee } from "lucide-react";
import { CommissionCard } from "@/components/shared/CommissionCard";
import { AdminCommissionTableRow } from "@/components/shared/AdminCommissionTableRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireProfile } from "@/lib/auth";
import { getCommissionSummary } from "@/lib/data/commission";
import { getAllBookings } from "@/lib/data/bookings";

export const metadata: Metadata = { title: "Commissions" };

export default async function AdminCommissionsPage() {
  await requireProfile(["admin"]);
  const [summary, allBookings] = await Promise.all([getCommissionSummary(), getAllBookings()]);
  const completedBookings = allBookings.filter((b) => b.status === "completed");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-extrabold text-ink">Commissions</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <CommissionCard label="Total Service Value" amount={summary.totalServiceValue} />
        <CommissionCard label="Total Commission" amount={summary.totalCommission} tone="signal" />
        <CommissionCard label="Commission Collected" amount={summary.commissionCollected} tone="brand" />
        <CommissionCard label="Commission Pending" amount={summary.commissionPending} />
        <CommissionCard label="Disputed" amount={summary.commissionDisputed} />
        <div className="rounded-2xl border border-line bg-paper p-4 sm:p-5">
          <p className="text-sm text-ink/60">Completed Jobs</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-ink">{summary.completedJobs}</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-bold text-ink">Commission Table</h2>
        {completedBookings.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink/50">
                  <th className="py-2 pr-4 font-medium">Provider</th>
                  <th className="py-2 pr-4 font-medium">Service Amount</th>
                  <th className="py-2 pr-4 font-medium">Commission %</th>
                  <th className="py-2 pr-4 font-medium">Commission</th>
                  <th className="py-2 pr-4 font-medium">Provider Amount</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {completedBookings.map((booking) => (
                  <AdminCommissionTableRow key={booking.id} booking={booking} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState icon={IndianRupee} title="No completed jobs yet." />
          </div>
        )}
      </div>
    </div>
  );
}
