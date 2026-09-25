import Link from "next/link";
import { icons } from "lucide-react";
import type { Category } from "@/types";
import { Card } from "@/components/ui/Card";

export function ServiceCard({ category }: { category: Category }) {
  const Icon = category.icon && category.icon in icons ? icons[category.icon as keyof typeof icons] : icons.Wrench;

  return (
    <Link href={`/services/${category.slug}`}>
      <Card className="flex h-full flex-col gap-3 transition-colors hover:border-brand">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light">
          <Icon className="h-5 w-5 text-brand" aria-hidden="true" />
        </div>
        <div>
          <p className="font-display text-base font-bold text-ink">{category.name}</p>
          {category.description && (
            <p className="mt-0.5 text-sm text-ink/60 line-clamp-2">{category.description}</p>
          )}
        </div>
      </Card>
    </Link>
  );
}
