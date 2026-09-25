"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorMessage, FRIENDLY_ERROR } from "@/components/ui/ErrorMessage";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !phone || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, role: "customer" },
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(
        signUpError.message.toLowerCase().includes("already")
          ? "An account with this email already exists."
          : FRIENDLY_ERROR
      );
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <Card className="mx-auto flex w-full max-w-sm flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-10 w-10 text-verified" />
        <h1 className="font-display text-lg font-bold text-ink">Check your email</h1>
        <p className="text-sm text-ink/60">
          We&apos;ve sent a confirmation link to {email}. Confirm your email to finish creating your
          account.
        </p>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <h1 className="font-display text-xl font-bold text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-ink/60">Book trusted local services in minutes.</p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
        <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <Input label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required autoComplete="tel" />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          helperText="At least 6 characters"
        />
        {error && <ErrorMessage message={error} />}
        <Button type="submit" loading={loading} fullWidth>
          Sign up
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink/60">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
