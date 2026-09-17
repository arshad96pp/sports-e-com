import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Only ever redirect back into this app — never to an attacker-supplied absolute/protocol-relative URL. */
function sanitizeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/account";
  return next;
}

/**
 * Finishes email-link signup confirmation — it arrives here as a `?code=...`
 * PKCE exchange (see `signUp`'s `emailRedirectTo` in auth.client.ts).
 * Password recovery does NOT go through here — see ResetPasswordClient,
 * which exchanges its own code client-side on `/auth/reset-password`.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = sanitizeNext(searchParams.get("next"));
  const code = searchParams.get("code");
  const linkError = searchParams.get("error_description") ?? searchParams.get("error");

  if (linkError) {
    return NextResponse.redirect(`${origin}/login?error=link_expired`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link_expired`);
}
