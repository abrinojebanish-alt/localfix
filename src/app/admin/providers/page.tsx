import type { Metadata } from "next";
import { Wrench } from "lucide-react";
import { AdminProviderRow } from "@/components/shared/AdminProviderRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireProfile } from "@/lib/auth";
import { getAllProvidersForAdmin } from "@/lib/data/admin";
import { getDefaultCommissionPercentage } from "@/lib/data/commission";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Manage Providers" };

export default async function AdminProvidersPage() {
  await requireProfile(["admin"]);

  const [providers, defaultPercentage] = await Promise.all([
    getAllProvidersForAdmin(),
    getDefaultCommissionPercentage(),
  ]);

  const supabase = createClient();
  const { data: overrides } = await supabase.from("provider_commission_settings").select("provider_id, commission_percentage");
  const overrideMap = new Map((overrides ?? []).map((o) => [o.provider_id, o.commission_percentage]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-extrabold text-ink">Providers</h1>

      <div className="mt-6 flex flex-col gap-3">
        {providers.length > 0 ? (
          providers.map((provider) => (
            <AdminProviderRow
              key={provider.id}
              provider={provider}
              currentOverride={overrideMap.get(provider.id) ?? null}
              defaultPercentage={defaultPercentage}
            />
          ))
        ) : (
          <EmptyState icon={Wrench} title="No providers yet." />
        )}
      </div>
    </div>
  );
}
