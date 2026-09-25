import { MapPin } from "lucide-react";
import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white">
        <MapPin className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight text-ink">
        Local<span className="text-brand">Fix</span>
      </span>
    </Link>
  );
}
