import type { Metadata } from "next";
import { Wrench } from "lucide-react";
import { ProviderCard } from "@/components/shared/ProviderCard";
import { ProvidersFilterBar } from "@/components/shared/ProvidersFilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { getActiveCategories } from "@/lib/data/categories";
import { searchProviders } from "@/lib/data/providers";

export const metadata: Metadata = {
  title: "Find Providers",
};

interface PageProps {
  searchParams: { q?: string; service?: string; town?: string };
}

export default async function ProvidersPage({ searchParams }: PageProps) {
  const [categories, providers] = await Promise.all([
    getActiveCategories(),
    searchProviders({
      query: searchParams.q,
      categorySlug: searchParams.service,
      town: searchParams.town,
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-ink">Find a Provider</h1>

      <div className="mt-6">
        <ProvidersFilterBar categories={categories} />
      </div>

      <div className="mt-8">
        {providers.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Wrench}
            title="No providers found in this area."
            description="Try a different service, town, or search term."
          />
        )}
      </div>
    </div>
  );
}
