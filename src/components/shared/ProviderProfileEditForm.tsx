"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ErrorMessage, FRIENDLY_ERROR } from "@/components/ui/ErrorMessage";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { TOWNS } from "@/lib/utils";
import type { Provider } from "@/types";

export function ProviderProfileEditForm({ provider }: { provider: Provider }) {
  const [businessName, setBusinessName] = useState(provider.business_name);
  const [description, setDescription] = useState(provider.description ?? "");
  const [phone, setPhone] = useState(provider.phone);
  const [town, setTown] = useState(provider.town);
  const [address, setAddress] = useState(provider.address ?? "");
  const [experienceYears, setExperienceYears] = useState(String(provider.experience_years));
  const [startingPrice, setStartingPrice] = useState(provider.starting_price ? String(provider.starting_price) : "");
  const [availabilityNote, setAvailabilityNote] = useState(provider.availability_note ?? "");
  const [imageUrl, setImageUrl] = useState(provider.profile_image);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { show } = useToast();

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    const supabase = createClient();
    const path = `${provider.user_id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from("provider-images").upload(path, file, {
      upsert: true,
    });

    if (uploadError) {
      setUploading(false);
      setError("Couldn't upload image. Please try again.");
      return;
    }

    const { data } = supabase.storage.from("provider-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!businessName || !phone || !town || !experienceYears) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("providers")
      .update({
        business_name: businessName,
        description: description || null,
        phone,
        town,
        address: address || null,
        experience_years: Number(experienceYears),
        starting_price: startingPrice ? Number(startingPrice) : null,
        availability_note: availabilityNote || null,
        profile_image: imageUrl,
      })
      .eq("id", provider.id);
    setLoading(false);

    if (updateError) {
      setError(FRIENDLY_ERROR);
      return;
    }

    show("Profile updated.");
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <h1 className="font-display text-xl font-bold text-ink">Business profile</h1>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-brand-light">
            {imageUrl ? (
              <Image src={imageUrl} alt="Profile" fill sizes="64px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-7 w-7 text-brand" />
              </div>
            )}
          </div>
          <div>
            <label className="inline-block cursor-pointer rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink hover:bg-black/5">
              {uploading ? "Uploading…" : "Change photo"}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>

        <Input label="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <Select label="Town" value={town} onChange={(e) => setTown(e.target.value)} required>
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

        <Input
          label="Availability"
          value={availabilityNote}
          onChange={(e) => setAvailabilityNote(e.target.value)}
          placeholder="e.g. Mon–Sat, 9am–7pm"
        />

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
          />
        </div>

        {error && <ErrorMessage message={error} />}

        <Button type="submit" loading={loading} fullWidth>
          Save changes
        </Button>
      </form>
    </Card>
  );
}
