import type { Metadata } from "next";
import { ProviderRegisterForm } from "@/components/auth/ProviderRegisterForm";
import { getActiveCategories } from "@/lib/data/categories";

export const metadata: Metadata = {
  title: "Become a Provider",
};

export default async function ProviderRegisterPage() {
  const categories = await getActiveCategories();
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <ProviderRegisterForm categories={categories} />
    </div>
  );
}
