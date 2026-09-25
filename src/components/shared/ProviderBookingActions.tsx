"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ErrorMessage, FRIENDLY_ERROR } from "@/components/ui/ErrorMessage";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { previewCommissionSplit, formatCurrency } from "@/lib/utils";
import type { BookingWithDetails, BookingStatus } from "@/types";

interface ProviderBookingActionsProps {
  booking: BookingWithDetails;
  commissionPercentage: number;
}

export function ProviderBookingActions({ booking, commissionPercentage }: ProviderBookingActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [finalAmount, setFinalAmount] = useState("");
  const router = useRouter();
  const { show } = useToast();

  async function setStatus(status: BookingStatus, extraFields: Record<string, unknown> = {}) {
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status, ...extraFields })
      .eq("id", booking.id);
    setLoading(false);

    if (updateError) {
      setError(FRIENDLY_ERROR);
      return;
    }

    show("Booking updated.");
    router.refresh();
  }

  async function handleComplete() {
    const amount = Number(finalAmount);
    if (!finalAmount || Number.isNaN(amount) || amount <= 0) {
      setError("Enter a valid final amount.");
      return;
    }
    await setStatus("completed", { final_amount: amount });
  }

  if (booking.status === "pending") {
    return (
      <div className="flex gap-2">
        {error && <ErrorMessage message={error} />}
        <Button loading={loading} onClick={() => setStatus("accepted")}>
          Accept
        </Button>
        <Button variant="danger" loading={loading} onClick={() => setStatus("rejected")}>
          Reject
        </Button>
      </div>
    );
  }

  if (booking.status === "accepted") {
    return (
      <div className="flex flex-col gap-3">
        {error && <ErrorMessage message={error} />}
        <Button loading={loading} onClick={() => setStatus("on_the_way")}>
          Start Travelling
        </Button>
      </div>
    );
  }

  if (booking.status === "on_the_way") {
    return (
      <div className="flex flex-col gap-3">
        {error && <ErrorMessage message={error} />}
        <Button loading={loading} onClick={() => setStatus("in_progress")}>
          Start Job
        </Button>
      </div>
    );
  }

  if (booking.status === "in_progress") {
    const amount = Number(finalAmount) || 0;
    const { commissionAmount, providerAmount } = previewCommissionSplit(amount, commissionPercentage);

    return (
      <Card>
        <p className="font-display text-base font-bold text-ink">Enter final service amount</p>
        <div className="mt-3">
          <Input
            label="Final amount (₹)"
            type="number"
            min={0}
            value={finalAmount}
            onChange={(e) => setFinalAmount(e.target.value)}
          />
        </div>
        {amount > 0 && (
          <div className="mt-3 space-y-1.5 rounded-xl bg-canvas p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60">LocalFix Commission ({commissionPercentage}%)</span>
              <span className="text-ink/70">{formatCurrency(commissionAmount)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-ink">You receive</span>
              <span className="text-ink">{formatCurrency(providerAmount)}</span>
            </div>
          </div>
        )}
        {error && (
          <div className="mt-3">
            <ErrorMessage message={error} />
          </div>
        )}
        <Button className="mt-4" loading={loading} fullWidth onClick={handleComplete}>
          Complete Job
        </Button>
      </Card>
    );
  }

  return null;
}
