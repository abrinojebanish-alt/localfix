"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Rating } from "@/components/ui/Rating";
import { Button } from "@/components/ui/Button";
import { ErrorMessage, FRIENDLY_ERROR } from "@/components/ui/ErrorMessage";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

interface ReviewFormProps {
  bookingId: string;
  providerId: string;
  customerId: string;
  onSuccess: () => void;
}

export function ReviewForm({ bookingId, providerId, customerId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { show } = useToast();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("reviews").insert({
      booking_id: bookingId,
      provider_id: providerId,
      customer_id: customerId,
      rating,
      review: review || null,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message.includes("duplicate") ? "You've already reviewed this booking." : FRIENDLY_ERROR);
      return;
    }

    show("Review submitted.");
    onSuccess();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Your rating</p>
        <Rating value={rating} interactive onChange={setRating} size="lg" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="review" className="text-sm font-medium text-ink">
          Your review (optional)
        </label>
        <textarea
          id="review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
          placeholder="How was the service?"
        />
      </div>
      {error && <ErrorMessage message={error} />}
      <Button type="submit" loading={loading} fullWidth>
        Submit review
      </Button>
    </form>
  );
}
