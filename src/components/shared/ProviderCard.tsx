import Link from "next/link";
import Image from "next/image";
import { MapPin, BadgeCheck, User } from "lucide-react";
import type { ProviderSummary } from "@/types";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";
import { formatCurrency } from "@/lib/utils";

export function ProviderCard({ provider }: { provider: ProviderSummary }) {
  return (
    <Link href={`/providers/${provider.id}`}>
      <Card className="flex gap-3 transition-colors hover:border-brand">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-light">
          {provider.profile_image ? (
            <Image
              src={provider.profile_image}
              alt={provider.business_name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-7 w-7 text-brand" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-display text-base font-bold text-ink">{provider.business_name}</p>
            {provider.is_verified && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-verified" aria-label="Verified" />
            )}
          </div>

          <p className="mt-0.5 flex items-center gap-1 text-sm text-ink/60">
            <MapPin className="h-3.5 w-3.5" /> {provider.town}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            {provider.average_rating !== null && (
              <Rating value={provider.average_rating} count={provider.review_count} size="sm" />
            )}
            {provider.starting_price !== null && (
              <span className="text-sm text-ink/70">From {formatCurrency(provider.starting_price)}</span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {provider.categories.slice(0, 3).map((cat) => (
              <span key={cat.id} className="rounded-full bg-ink/5 px-2 py-0.5 text-xs text-ink/70">
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}
