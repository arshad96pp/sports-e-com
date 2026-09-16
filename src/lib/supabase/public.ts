import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Anon-key client with no cookie/session dependency. Use for read paths that
 * are public regardless of who's asking (active products, categories, hero
 * banners, store settings, approved reviews) — the RLS policies for this data
 * are identical for anon and authenticated, so there's no reason to depend on
 * request-scoped cookies. Crucially, this also makes these calls safe to use
 * inside `generateStaticParams`/build-time contexts, which have no request
 * (and therefore no `cookies()`) to read at all — the per-request client in
 * `@/lib/supabase/server` throws there.
 *
 * Never use this for anything user-scoped (cart, wishlist, orders, addresses,
 * profile) or admin-authorized writes — those need the caller's own session,
 * i.e. `@/lib/supabase/server`'s `createClient()`.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
