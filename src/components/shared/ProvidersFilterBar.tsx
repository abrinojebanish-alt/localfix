"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TOWNS } from "@/lib/utils";
import type { Category } from "@/types";

export function ProvidersFilterBar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query !== (searchParams.get("q") ?? "")) updateParam("q", query);
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Input
        placeholder="Search providers…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search providers"
      />
      <Select
        defaultValue={searchParams.get("service") ?? ""}
        onChange={(e) => updateParam("service", e.target.value)}
        aria-label="Filter by service"
      >
        <option value="">All services</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </Select>
      <Select
        defaultValue={searchParams.get("town") ?? ""}
        onChange={(e) => updateParam("town", e.target.value)}
        aria-label="Filter by town"
      >
        <option value="">All towns</option>
        {TOWNS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>
    </div>
  );
}
