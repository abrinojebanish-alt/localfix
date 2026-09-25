import type { Metadata } from "next";
import { AdminSettingsForm } from "@/components/shared/AdminSettingsForm";
import { requireProfile } from "@/lib/auth";
import { getCommissionSettingsRow } from "@/lib/data/commission";

export const metadata: Metadata = { title: "Platform Settings" };

export default async function AdminSettingsPage() {
  await requireProfile(["admin"]);
  const settings = await getCommissionSettingsRow();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-extrabold text-ink">Platform Settings</h1>
      <div className="mt-6">
        {settings && (
          <AdminSettingsForm settingsId={settings.id} currentPercentage={settings.default_commission_percentage} />
        )}
      </div>
    </div>
  );
}
