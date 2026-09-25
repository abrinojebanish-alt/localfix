import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Uses the service-role key and therefore bypasses RLS entirely. Only ever
 * import this from Route Handlers, Server Actions, or scripts/seed.ts — never
 * from a Server Component that renders user-supplied data, and never from
 * anything that ships to the browser. The `server-only` import above makes
 * any accidental client-side import fail the build.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
