import type { Metadata } from "next";
import { ProfileForm } from "@/components/shared/ProfileForm";
import { requireProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "My Profile" };

export default async function CustomerProfilePage() {
  const profile = await requireProfile(["customer"]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <ProfileForm profile={profile} />
    </div>
  );
}
