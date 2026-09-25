"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorMessage, FRIENDLY_ERROR } from "@/components/ui/ErrorMessage";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError(
        signInError.message.toLowerCase().includes("invalid")
          ? "Incorrect email or password."
          : FRIENDLY_ERROR
      );
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const destination =
      profile?.role === "admin" ? "/admin" : profile?.role === "provider" ? "/provider/dashboard" : "/dashboard";

    router.push(destination);
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <h1 className="font-display text-xl font-bold text-ink">Log in</h1>
      <p className="mt-1 text-sm text-ink/60">Welcome back to LocalFix.</p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && <ErrorMessage message={error} />}
        <Button type="submit" loading={loading} fullWidth>
          Log in
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink/60">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-brand hover:underline">
          Sign up
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-ink/60">
        Are you a service provider?{" "}
        <Link href="/provider/register" className="font-medium text-brand hover:underline">
          Register here
        </Link>
      </p>
    </Card>
  );
}
