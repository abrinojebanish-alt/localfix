"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorMessage, FRIENDLY_ERROR } from "@/components/ui/ErrorMessage";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { show } = useToast();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!fullName) {
      setError("Name is required.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone: phone || null })
      .eq("id", profile.id);
    setLoading(false);

    if (updateError) {
      setError(FRIENDLY_ERROR);
      return;
    }

    show("Profile updated.");
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <h1 className="font-display text-xl font-bold text-ink">Your profile</h1>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
        <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input label="Email" value={profile.email} disabled helperText="Email can't be changed here." />
        <Input label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        {error && <ErrorMessage message={error} />}
        <Button type="submit" loading={loading} fullWidth>
          Save changes
        </Button>
      </form>
    </Card>
  );
}
