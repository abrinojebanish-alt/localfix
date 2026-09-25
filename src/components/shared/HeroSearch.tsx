"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

const examples = ["AC repair", "Electrician", "Plumber", "Car service"];

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    router.push(query.trim() ? `/providers?q=${encodeURIComponent(query.trim())}` : "/providers");
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-line bg-paper p-1.5 shadow-floating">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-xl bg-canvas px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-ink/50" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What service do you need?"
          aria-label="What service do you need?"
          className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink/50 focus:outline-none"
        />
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>
      <div className="flex flex-wrap gap-1.5 px-3 pb-2.5 pt-2">
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => router.push(`/providers?q=${encodeURIComponent(ex)}`)}
            className="rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink/70 hover:bg-ink/10"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
