import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light">
        <Icon className="h-6 w-6 text-brand" aria-hidden="true" />
      </div>
      <p className="font-display text-base font-bold text-ink">{title}</p>
      {description && <p className="max-w-xs text-sm text-ink/60">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-1">
          <Button size="sm">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
