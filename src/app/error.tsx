"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger-light">
        <AlertTriangle className="h-6 w-6 text-danger" />
      </div>
      <h1 className="font-display text-xl font-bold text-ink">Something went wrong.</h1>
      <p className="max-w-sm text-sm text-ink/60">Please try again. If the problem continues, contact support.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
