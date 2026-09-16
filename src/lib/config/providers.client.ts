import { createSupabaseAuthClientPort } from "@/lib/providers/supabase/auth.client";
import type { AuthClientPort } from "@/lib/core/ports/auth.port";

/**
 * Client-safe counterpart to `config/providers.ts` (which has `"server-only"`
 * and cannot be imported from a Client Component). Only `AuthClientPort` is
 * needed here — sign-in/up/out and the session listener are the only
 * provider calls that must run in the browser; everything else goes through
 * server actions.
 *
 * `NEXT_PUBLIC_` prefix is required so this is inlined into the browser
 * bundle — a bare `process.env.AUTH_PROVIDER` would be `undefined` client-side.
 */
const AUTH_PROVIDER = process.env.NEXT_PUBLIC_AUTH_PROVIDER ?? "supabase";

export function getAuthClientPort(): AuthClientPort {
  switch (AUTH_PROVIDER) {
    case "supabase":
    default:
      return createSupabaseAuthClientPort();
  }
}
