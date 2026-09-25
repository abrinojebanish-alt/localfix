"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ErrorMessage, FRIENDLY_ERROR } from "@/components/ui/ErrorMessage";
import { ReviewForm } from "./ReviewForm";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { isCancellableByCustomer } from "@/lib/data/bookings";
import type { BookingWithDetails } from "@/types";

interface CustomerBookingActionsProps {
  booking: BookingWithDetails;
  hasReview: boolean;
}

export function CustomerBookingActions({ booking, hasReview }: CustomerBookingActionsProps) {
  const [loading, setLoading] = useState<"cancel" | "confirm" | "dispute" | null>(null);
  const [error, setError] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const router = useRouter();
  const { show } = useToast();

  async function updateBooking(fields: Record<string, unknown>, kind: "cancel" | "confirm" | "dispute") {
    setError("");
    setLoading(kind);
    const supabase = createClient();
    const { error: updateError } = await supabase.from("bookings").update(fields).eq("id", booking.id);
    setLoading(null);

    if (updateError) {
      setError(FRIENDLY_ERROR);
      return;
    }

    show(
      kind === "cancel" ? "Booking cancelled." : kind === "confirm" ? "Amount confirmed." : "We've flagged this for review."
    );
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <ErrorMessage message={error} />}

      {isCancellableByCustomer(booking) && (
        <Button
          variant="danger"
          loading={loading === "cancel"}
          onClick={() => updateBooking({ status: "cancelled" }, "cancel")}
        >
          Cancel Booking
        </Button>
      )}

      {booking.status === "completed" && booking.final_amount !== null && !booking.customer_confirmed_amount && (
        <Card>
          <p className="font-display text-base font-bold text-ink">Confirm the final amount</p>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60">Final Service Amount</span>
              <span className="font-medium text-ink">{formatCurrency(booking.final_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">LocalFix Commission</span>
              <span className="text-ink/60">{formatCurrency(booking.commission_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Provider Amount</span>
              <span className="text-ink/60">{formatCurrency(booking.provider_amount)}</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink/50">
            LocalFix commission is recorded separately. Your payment goes directly to the provider.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              loading={loading === "confirm"}
              onClick={() => updateBooking({ customer_confirmed_amount: true, amount_confirmed_at: new Date().toISOString() }, "confirm")}
            >
              Confirm Amount
            </Button>
            <Button variant="outline" onClick={() => setDisputeOpen(true)}>
              Report a Problem
            </Button>
          </div>
        </Card>
      )}

      {booking.status === "completed" && booking.customer_confirmed_amount && !hasReview && (
        <Button variant="outline" onClick={() => setReviewOpen(true)}>
          Leave a Review
        </Button>
      )}

      {booking.status === "disputed" && (
        <Card className="border-danger/30 bg-danger-light">
          <p className="text-sm text-danger">
            This booking has been flagged for review. Our team will reach out about the final amount.
          </p>
        </Card>
      )}

      <Modal open={disputeOpen} onClose={() => setDisputeOpen(false)} title="Report a Problem">
        <p className="text-sm text-ink/70">
          We&apos;ll flag this booking so our team can look into the final amount with you and the provider.
        </p>
        <Button
          className="mt-4"
          variant="danger"
          fullWidth
          loading={loading === "dispute"}
          onClick={() => updateBooking({ status: "disputed" }, "dispute").then(() => setDisputeOpen(false))}
        >
          Confirm Report
        </Button>
      </Modal>

      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Leave a Review">
        <ReviewForm
          bookingId={booking.id}
          providerId={booking.provider_id}
          customerId={booking.customer_id}
          onSuccess={() => setReviewOpen(false)}
        />
      </Modal>
    </div>
  );
}
