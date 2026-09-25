import { AlertCircle } from "lucide-react";

export const FRIENDLY_ERROR = "Something went wrong. Please try again.";

export function ErrorMessage({ message = FRIENDLY_ERROR }: { message?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-danger-light px-3.5 py-2.5 text-sm text-danger">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
