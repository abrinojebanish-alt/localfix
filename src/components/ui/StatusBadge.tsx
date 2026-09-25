import { cn } from "@/lib/utils";
import { BOOKING_STATUS_LABELS } from "@/lib/utils";

type Tone = "neutral" | "brand" | "signal" | "verified" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-ink/5 text-ink/70",
  brand: "bg-brand-light text-brand-dark",
  signal: "bg-signal-light text-signal-dark",
  verified: "bg-verified-light text-verified",
  danger: "bg-danger-light text-danger",
};

const statusTone: Record<string, Tone> = {
  pending: "signal",
  accepted: "brand",
  rejected: "danger",
  on_the_way: "brand",
  in_progress: "brand",
  completed: "verified",
  cancelled: "neutral",
  disputed: "danger",
  paid_to_localfix: "verified",
  waived: "neutral",
  unpaid: "signal",
  paid_directly: "verified",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = statusTone[status] ?? "neutral";
  const text = label ?? BOOKING_STATUS_LABELS[status] ?? status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        toneClasses[tone]
      )}
    >
      {text}
    </span>
  );
}
