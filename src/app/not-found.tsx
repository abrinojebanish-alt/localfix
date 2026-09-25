import { MapPin } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <EmptyState
        icon={MapPin}
        title="Page not found"
        description="The page you're looking for doesn't exist or may have moved."
        actionLabel="Go home"
        actionHref="/"
      />
    </div>
  );
}
