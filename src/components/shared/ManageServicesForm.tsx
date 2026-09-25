"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ErrorMessage, FRIENDLY_ERROR } from "@/components/ui/ErrorMessage";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface ManageServicesFormProps {
  providerId: string;
  categories: Category[];
  selectedIds: string[];
}

export function ManageServicesForm({ providerId, categories, selectedIds }: ManageServicesFormProps) {
  const [selected, setSelected] = useState(new Set(selectedIds));
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const { show } = useToast();

  async function toggle(categoryId: string) {
    setError("");
    setPending(categoryId);
    const supabase = createClient();
    const isSelected = selected.has(categoryId);

    const { error: mutationError } = isSelected
      ? await supabase.from("provider_services").delete().eq("provider_id", providerId).eq("category_id", categoryId)
      : await supabase.from("provider_services").insert({ provider_id: providerId, category_id: categoryId });

    setPending(null);

    if (mutationError) {
      setError(FRIENDLY_ERROR);
      return;
    }

    setSelected((prev) => {
      const next = new Set(prev);
      if (isSelected) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
    show(isSelected ? "Service removed." : "Service added.");
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <h1 className="font-display text-xl font-bold text-ink">Manage services</h1>
      <p className="mt-1 text-sm text-ink/60">Select every service you offer.</p>

      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {categories.map((cat) => {
          const isSelected = selected.has(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
              disabled={pending === cat.id}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                isSelected ? "border-brand bg-brand-light text-brand-dark" : "border-line text-ink hover:bg-black/5"
              )}
            >
              {cat.name}
              {isSelected && <Check className="h-4 w-4" />}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
