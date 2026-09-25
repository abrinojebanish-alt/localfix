"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (value: number) => void;
}

const sizeClasses = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-6 w-6" };

export function Rating({ value, count, size = "md", interactive, onChange }: RatingProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center" role={interactive ? "radiogroup" : undefined} aria-label="Rating">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            role={interactive ? "radio" : undefined}
            aria-checked={interactive ? star === Math.round(value) : undefined}
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            className={cn(!interactive && "cursor-default")}
          >
            <Star
              className={cn(
                sizeClasses[size],
                star <= Math.round(value) ? "fill-signal text-signal" : "fill-transparent text-ink/25"
              )}
            />
          </button>
        ))}
      </div>
      {count !== undefined && <span className="text-sm text-ink/60">({count})</span>}
    </div>
  );
}
