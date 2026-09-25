"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorMessage, FRIENDLY_ERROR } from "@/components/ui/ErrorMessage";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

export function AdminSettingsForm({ settingsId, currentPercentage }: { settingsId: string; currentPercentage: number }) {
  const [percentage, setPercentage] = useState(String(currentPercentage));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { show } = useToast();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const value = Number(percentage);
    if (Number.isNaN(value) || value < 0 || value > 100) {
      setError("Enter a valid percentage between 0 and 100.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: updateError } = await supabase
      .from("commission_settings")
      .update({ default_commission_percentage: value, updated_by: user?.id, updated_at: new Date().toISOString() })
      .eq("id", settingsId);
    setLoading(false);

    if (updateError) {
      setError(FRIENDLY_ERROR);
      return;
    }

    show("Default commission updated.");
    router.refresh();
  }

  return (
    <Card className="max-w-sm">
      <p className="font-display text-base font-bold text-ink">Default commission rate</p>
      <p className="mt-1 text-sm text-ink/60">
        Applies to every provider without an individual override. Existing completed bookings keep the rate that
        applied when they were completed.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <Input
          label="Default commission (%)"
          type="number"
          min={0}
          max={100}
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
        />
        {error && <ErrorMessage message={error} />}
        <Button type="submit" loading={loading}>
          Save
        </Button>
      </form>
    </Card>
  );
}
