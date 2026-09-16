"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * Browser-side Supabase client — anon key only, RLS-scoped to the signed-in
 * user. Memoized to a single instance: the auth client port
 * (`providers/supabase/auth.client.ts`) calls this from several independent
 * methods, and each `createBrowserClient()` call spins up its own GoTrueClient
 * (its own listeners/refresh timers) — one shared instance is what
 * `SupabaseSessionContext`'s single `onAuthStateChange` subscription already
 * assumes.
 */
export function createClient() {
  browserClient ??= createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return browserClient;
}
