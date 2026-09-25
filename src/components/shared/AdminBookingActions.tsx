"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ErrorMessage, FRIENDLY_ERROR } from "@/components/ui/ErrorMessage";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import type { BookingWithDetails, CommissionStatus } from "@/types";

const commissionStatuses: CommissionStatus[] = ["pending", "paid_to_localfix", "waived", "disputed"];

export function AdminBookingActions({ booking }: { booking: BookingWithDetails }) {
  const [commissionStatus, setCommissionStatus] = useState<CommissionStatus>(booking.commission_status);
  const [adminNote, setAdminNote] = useState(booking.admin_note ?? "");
  const [loading, setLoading] = useState<"commission" | "resolve" | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const { show } = useToast();

  async function saveCommissionStatus() {
    setError("");
    setLoading("commission");
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ commission_status: commissionStatus, admin_note: adminNote || null })
      .eq("id", booking.id);
    setLoading(null);

    if (updateError) {
      setError(FRIENDLY_ERROR);
      return;
    }
    show("Commission updated.");
    router.refresh();
  }

  async function resolveDispute() {
    setError("");
    setLoading("resolve");
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "completed", admin_note: adminNote || null })
      .eq("id", booking.id);
    setLoading(null);

    if (updateError) {
      setError(FRIENDLY_ERROR);
      return;
    }
    show("Dispute resolved.");
    router.refresh();
  }

  return (
    <Card>
      <p className="font-display text-base font-bold text-ink">Admin controls</p>

      {booking.status === "disputed" && (
        <div className="mt-3 rounded-xl bg-danger-light p-3 text-sm text-danger">
          This booking was flagged by the customer and needs review.
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <Select
          label="Commission status"
          value={commissionStatus}
          onChange={(e) => setCommissionStatus(e.target.value as CommissionStatus)}
        >
          {commissionStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replace(/_/g, " ")}
            </option>
          ))}
        </Select>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="admin_note" className="text-sm font-medium text-ink">
            Admin note
          </label>
          <textarea
            id="admin_note"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="flex flex-wrap gap-2">
          <Button loading={loading === "commission"} onClick={saveCommissionStatus}>
            Save
          </Button>
          {booking.status === "disputed" && (
            <Button variant="secondary" loading={loading === "resolve"} onClick={resolveDispute}>
              Mark Resolved (Completed)
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
