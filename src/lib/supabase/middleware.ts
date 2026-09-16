import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Header set only by this function, carrying the user id `getUser()` below
 * already verified over the network this request. `getAuthenticatedUser()`
 * (see providers/supabase/auth.server.ts) trusts it instead of paying for a
 * second `auth.getUser()` round trip for the same request — it's overwritten
 * (or stripped when unauthenticated) below, so nothing a client sends survives.
 */
const VERIFIED_USER_HEADER = "x-verified-user-id";

/**
 * Refreshes the Supabase auth cookie on every request (so server components see
 * a valid session) and returns both the response to continue with and the
 * authenticated user, if any. Call this first in `proxy.ts` before any
 * route-gating logic.
 */
export async function updateSession(request: NextRequest) {
  let cookiesToForward: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToForward = cookiesToSet;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const forwardedHeaders = new Headers(request.headers);
  if (user) {
    forwardedHeaders.set(VERIFIED_USER_HEADER, user.id);
  } else {
    forwardedHeaders.delete(VERIFIED_USER_HEADER);
  }

  const response = NextResponse.next({ request: { headers: forwardedHeaders } });
  cookiesToForward.forEach(({ name, value, options }) => response.cookies.set(name, value, options));

  return { response, user };
}
