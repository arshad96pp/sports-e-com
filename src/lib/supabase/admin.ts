import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Service-role Supabase client. Bypasses RLS entirely — use ONLY for operations
 * that must run outside a user's session (Storage uploads processed server-side,
 * the seed script). Never import this from a Client Component or expose the key
 * it uses to the browser. Prefer `@/lib/supabase/server`'s per-request client
 * (RLS-scoped) for everything else, including admin CRUD, which relies on the
 * `super_admin` RLS policies instead of bypassing RLS.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
