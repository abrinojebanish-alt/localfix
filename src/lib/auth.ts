import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types";

/**
 * Loads the current user's profile, redirecting to /login if signed out.
 * Pass allowedRoles to also gate by role — anyone with the wrong role is
 * redirected to their own dashboard rather than seeing a blank/error page.
 */
export async function requireProfile(allowedRoles?: UserRole[]): Promise<Profile> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (!profile) redirect("/login");

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    redirect(dashboardPathForRole(profile.role));
  }

  return profile;
}

export function dashboardPathForRole(role: UserRole): string {
  if (role === "admin") return "/admin";
  if (role === "provider") return "/provider/dashboard";
  return "/dashboard";
}
