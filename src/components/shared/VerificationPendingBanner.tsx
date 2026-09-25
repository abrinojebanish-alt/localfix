import { Clock3 } from "lucide-react";

export function VerificationPendingBanner() {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-signal/30 bg-signal-light px-4 py-3">
      <Clock3 className="h-5 w-5 shrink-0 text-signal-dark" />
      <p className="text-sm text-signal-dark">Your application is waiting for LocalFix verification.</p>
    </div>
  );
}
