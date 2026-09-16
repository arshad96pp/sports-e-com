import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

/**
 * Per-request Supabase client for Server Components, Server Actions and Route
 * Handlers. Uses the anon key + the caller's session cookie, so every query
 * through this client is subject to RLS as that user (or anonymously).
 *
 * Server Components can't write cookies, so `setAll` is a no-op there — session
 * refresh in that context is handled by the proxy (middleware) instead.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component — safe to ignore, the proxy refreshes sessions.
          }
        },
      },
    }
  );
}
