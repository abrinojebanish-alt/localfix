import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProviderProfileEditForm } from "@/components/shared/ProviderProfileEditForm";
import { VerificationPendingBanner } from "@/components/shared/VerificationPendingBanner";
import { requireProfile } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/data/providers";

export const metadata: Metadata = { title: "Business Profile" };

export default async function ProviderProfilePage() {
  const profile = await requireProfile(["provider"]);
  const provider = await getProviderByUserId(profile.id);
  if (!provider) redirect("/provider/register");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {!provider.is_verified && <VerificationPendingBanner />}
      <ProviderProfileEditForm provider={provider} />
    </div>
  );
}
