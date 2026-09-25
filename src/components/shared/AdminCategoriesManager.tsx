"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorMessage, FRIENDLY_ERROR } from "@/components/ui/ErrorMessage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AdminCategoriesManager({ categories }: { categories: Category[] }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const { show } = useToast();

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name) {
      setError("Category name is required.");
      return;
    }

    setLoading("add");
    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("categories")
      .insert({ name, slug: slugify(name), description: description || null, is_active: true });
    setLoading(null);

    if (insertError) {
      setError(insertError.message.includes("duplicate") ? "A category with that name already exists." : FRIENDLY_ERROR);
      return;
    }

    show("Category added.");
    setName("");
    setDescription("");
    router.refresh();
  }

  async function toggleActive(category: Category) {
    setLoading(category.id);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("categories")
      .update({ is_active: !category.is_active })
      .eq("id", category.id);
    setLoading(null);

    if (!updateError) {
      show(category.is_active ? "Category deactivated." : "Category activated.");
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <p className="font-display text-base font-bold text-ink">Add category</p>
        <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex-1">
            <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button type="submit" loading={loading === "add"}>
            Add
          </Button>
        </form>
        {error && (
          <div className="mt-3">
            <ErrorMessage message={error} />
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-2">
        {categories.map((cat) => (
          <Card key={cat.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-ink">{cat.name}</p>
              <p className="text-sm text-ink/60">{cat.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={cat.is_active ? "completed" : "cancelled"} label={cat.is_active ? "Active" : "Inactive"} />
              <Button size="sm" variant="outline" loading={loading === cat.id} onClick={() => toggleActive(cat)}>
                {cat.is_active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
