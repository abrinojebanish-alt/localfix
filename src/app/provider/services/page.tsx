import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ManageServicesForm } from "@/components/shared/ManageServicesForm";
import { requireProfile } from "@/lib/auth";
import { getProviderByUserId, getProviderCategories } from "@/lib/data/providers";
import { getActiveCategories } from "@/lib/data/categories";

export const metadata: Metadata = { title: "Manage Services" };

export default async function ProviderServicesPage() {
  const profile = await requireProfile(["provider"]);
  const provider = await getProviderByUserId(profile.id);
  if (!provider) redirect("/provider/register");

  const [categories, providerCategories] = await Promise.all([
    getActiveCategories(),
    getProviderCategories(provider.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <ManageServicesForm
        providerId={provider.id}
        categories={categories}
        selectedIds={providerCategories.map((c) => c.id)}
      />
    </div>
  );
}
