"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ErrorMessage, FRIENDLY_ERROR } from "@/components/ui/ErrorMessage";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types";

interface RequestServiceFormProps {
  providerId: string;
  categories: Category[];
  onSuccess: () => void;
}

export function RequestServiceForm({ providerId, categories, onSuccess }: RequestServiceFormProps) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { show } = useToast();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!categoryId || !description || !address || !phone || !date || !time) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: insertError } = await supabase.from("bookings").insert({
      customer_id: user.id,
      provider_id: providerId,
      category_id: categoryId,
      service_description: description,
      customer_address: address,
      customer_phone: phone,
      preferred_date: date,
      preferred_time: time,
      customer_note: note || null,
    });

    setLoading(false);

    if (insertError) {
      setError(FRIENDLY_ERROR);
      return;
    }

    show("Service request sent.");
    onSuccess();
    router.push("/bookings");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Select label="Service" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="service_description" className="text-sm font-medium text-ink">
          What do you need done? <span className="text-danger">*</span>
        </label>
        <textarea
          id="service_description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
          className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
          placeholder="e.g. Ceiling fan not working in the hall"
        />
      </div>

      <Input label="Your address" value={address} onChange={(e) => setAddress(e.target.value)} required />
      <Input label="Your phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Preferred date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <Input label="Preferred time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="note" className="text-sm font-medium text-ink">
          Note (optional)
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </div>

      {error && <ErrorMessage message={error} />}

      <Button type="submit" loading={loading} fullWidth>
        Request Service
      </Button>
    </form>
  );
}
