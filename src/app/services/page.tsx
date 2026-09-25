import type { Metadata } from "next";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { getActiveCategories } from "@/lib/data/categories";

export const metadata: Metadata = {
  title: "Services",
  description: "Browse all local services available on LocalFix.",
};

export default async function ServicesPage() {
  const categories = await getActiveCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-ink">All Services</h1>
      <p className="mt-2 text-ink/60">Choose a category to find providers near you.</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((category) => (
          <ServiceCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
