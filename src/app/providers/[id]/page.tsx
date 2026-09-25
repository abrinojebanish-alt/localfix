import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { BadgeCheck, MapPin, Briefcase, User, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProviderProfileActions } from "@/components/shared/ProviderProfileActions";
import { getProviderProfile } from "@/lib/data/providers";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const provider = await getProviderProfile(params.id);
  if (!provider) return {};
  return {
    title: provider.business_name,
    description: provider.description ?? `${provider.business_name} — local service provider in ${provider.town}.`,
  };
}

export default async function ProviderProfilePage({ params }: PageProps) {
  const provider = await getProviderProfile(params.id);
  if (!provider || !provider.is_verified || !provider.is_active) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-brand-light">
          {provider.profile_image ? (
            <Image src={provider.profile_image} alt={provider.business_name} fill sizes="96px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-10 w-10 text-brand" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-extrabold text-ink">{provider.business_name}</h1>
            {provider.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-verified-light px-2.5 py-1 text-xs font-medium text-verified">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink/60">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {provider.town}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" /> {provider.experience_years} yrs experience
            </span>
            {provider.starting_price !== null && <span>From {formatCurrency(provider.starting_price)}</span>}
          </div>

          {provider.average_rating !== null && (
            <div className="mt-2">
              <Rating value={provider.average_rating} count={provider.review_count} />
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {provider.categories.map((cat) => (
              <span key={cat.id} className="rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink/70">
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {provider.description && (
        <p className="mt-6 text-ink/70">{provider.description}</p>
      )}

      {provider.availability_note && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-ink/60">
          <Clock className="h-4 w-4" /> {provider.availability_note}
        </p>
      )}

      <div className="mt-6">
        <ProviderProfileActions
          providerId={provider.id}
          businessName={provider.business_name}
          phone={provider.phone}
          categories={provider.categories}
        />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-bold text-ink">
          Reviews {provider.review_count > 0 && `(${provider.review_count})`}
        </h2>

        {provider.reviews.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3">
            {provider.reviews.map((review) => (
              <Card key={review.id}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink">{review.customer_name}</p>
                  <span className="text-xs text-ink/50">{formatDate(review.created_at)}</span>
                </div>
                <Rating value={review.rating} size="sm" />
                {review.review && <p className="mt-2 text-sm text-ink/70">{review.review}</p>}
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState icon={User} title="No reviews yet" description="Be the first to book and review this provider." />
          </div>
        )}
      </div>
    </div>
  );
}
