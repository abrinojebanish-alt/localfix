import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { icons } from "lucide-react";
import { Wrench } from "lucide-react";
import { ProviderCard } from "@/components/shared/ProviderCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCategoryBySlug } from "@/lib/data/categories";
import { searchProviders } from "@/lib/data/providers";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `Find trusted ${category.name} providers near you on LocalFix.`,
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const providers = await searchProviders({ categorySlug: params.slug });
  const Icon = category.icon && category.icon in icons ? icons[category.icon as keyof typeof icons] : Wrench;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light">
          <Icon className="h-6 w-6 text-brand" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">{category.name}</h1>
          {category.description && <p className="text-sm text-ink/60">{category.description}</p>}
        </div>
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
            description="Check back soon, or browse other services."
            actionLabel="Browse all services"
            actionHref="/services"
          />
        )}
      </div>
    </div>
  );
}
