"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ErrorMessage, FRIENDLY_ERROR } from "@/components/ui/ErrorMessage";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import type { Provider } from "@/types";

interface AdminProviderRowProps {
  provider: Provider;
  currentOverride: number | null;
  defaultPercentage: number;
}

export function AdminProviderRow({ provider, currentOverride, defaultPercentage }: AdminProviderRowProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [commissionOpen, setCommissionOpen] = useState(false);
  const [commissionValue, setCommissionValue] = useState(String(currentOverride ?? defaultPercentage));
  const [reason, setReason] = useState("");
  const router = useRouter();
  const { show } = useToast();

  async function updateProvider(fields: Record<string, unknown>, action: string) {
    setError("");
    setLoading(action);
    const supabase = createClient();
    const { error: updateError } = await supabase.from("providers").update(fields).eq("id", provider.id);
    setLoading(null);

    if (updateError) {
      setError(FRIENDLY_ERROR);
      return;
    }
    show("Provider updated.");
    router.refresh();
  }

  async function saveCommission() {
    const percentage = Number(commissionValue);
    if (Number.isNaN(percentage) || percentage < 0 || percentage > 100) {
      setError("Enter a valid percentage between 0 and 100.");
      return;
    }
    setError("");
    setLoading("commission");
    const supabase = createClient();
    const { error: upsertError } = await supabase
      .from("provider_commission_settings")
      .upsert(
        { provider_id: provider.id, commission_percentage: percentage, reason: reason || null },
        { onConflict: "provider_id" }
      );
    setLoading(null);

    if (upsertError) {
      setError(FRIENDLY_ERROR);
      return;
    }
    show("Commission rate updated.");
    setCommissionOpen(false);
    router.refresh();
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-display text-base font-bold text-ink">{provider.business_name}</p>
            {provider.is_verified && <BadgeCheck className="h-4 w-4 text-verified" />}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-ink/60">
            <MapPin className="h-3.5 w-3.5" /> {provider.town} · {provider.phone}
          </p>
          <div className="mt-1.5 flex gap-1.5">
            <StatusBadge status={provider.is_verified ? "completed" : "pending"} label={provider.is_verified ? "Verified" : "Pending"} />
            <StatusBadge status={provider.is_active ? "completed" : "cancelled"} label={provider.is_active ? "Active" : "Disabled"} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!provider.is_verified ? (
            <>
              <Button size="sm" loading={loading === "approve"} onClick={() => updateProvider({ is_verified: true, is_active: true }, "approve")}>
                Approve
              </Button>
              <Button size="sm" variant="danger" loading={loading === "reject"} onClick={() => updateProvider({ is_verified: false, is_active: false }, "reject")}>
                Reject
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant={provider.is_active ? "outline" : "secondary"}
              loading={loading === "toggle"}
              onClick={() => updateProvider({ is_active: !provider.is_active }, "toggle")}
            >
              {provider.is_active ? "Disable" : "Enable"}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setCommissionOpen(true)}>
            Commission
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-3">
          <ErrorMessage message={error} />
        </div>
      )}

      <Modal open={commissionOpen} onClose={() => setCommissionOpen(false)} title="Provider Commission Rate">
        <p className="text-sm text-ink/60">
          Platform default is {defaultPercentage}%. Set a different rate for this provider, or leave it at the
          default.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <Input
            label="Commission percentage"
            type="number"
            min={0}
            max={100}
            value={commissionValue}
            onChange={(e) => setCommissionValue(e.target.value)}
          />
          <Input label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button loading={loading === "commission"} onClick={saveCommission} fullWidth>
            Save rate
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
