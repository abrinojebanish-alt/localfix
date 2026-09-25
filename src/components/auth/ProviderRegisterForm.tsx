"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { cn, TOWNS } from "@/lib/utils";
import type { Category } from "@/types";

export function ProviderRegisterForm({ categories }: { categories: Category[] }) {
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [town, setTown] = useState("");
  const [address, setAddress] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [description, setDescription] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  function toggleCategory(id: string) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!fullName || !businessName || !email || !password || !phone || !town || !experienceYears) {
      setError("Please fill in all required fields.");
      return;
    }
    if (categoryIds.length === 0) {
      setError("Please select at least one service you offer.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/provider/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          businessName,
          email,
          password,
          phone,
          town,
          address,
          experienceYears,
          startingPrice: startingPrice || undefined,
          description,
          categoryIds,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card className="mx-auto flex w-full max-w-lg flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-10 w-10 text-verified" />
        <h1 className="font-display text-lg font-bold text-ink">Application submitted successfully.</h1>
        <p className="text-sm text-ink/60">
          Our team will review your provider profile. You can log in now to check your status any time.
        </p>
        <Button onClick={() => router.push("/login")}>Go to login</Button>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <h1 className="font-display text-xl font-bold text-ink">Become a LocalFix provider</h1>
      <p className="mt-1 text-sm text-ink/60">
        Tell us about your business. Our team reviews every new provider before you go live.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required helperText="At least 6 characters" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <Select label="Town" value={town} onChange={(e) => setTown(e.target.value)} required>
            <option value="">Select a town</option>
            {TOWNS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>

        <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Years of experience"
            type="number"
            min={0}
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            required
          />
          <Input
            label="Starting price (₹)"
            type="number"
            min={0}
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink">
            Services you offer <span className="text-danger">*</span>
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  categoryIds.includes(cat.id)
                    ? "bg-brand text-white"
                    : "bg-ink/5 text-ink/70 hover:bg-ink/10"
                )}
                aria-pressed={categoryIds.includes(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm font-medium text-ink">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
            placeholder="Tell customers about your experience and specialties."
          />
        </div>

        {error && <ErrorMessage message={error} />}

        <Button type="submit" loading={loading} fullWidth>
          Submit application
        </Button>
      </form>
    </Card>
  );
}
