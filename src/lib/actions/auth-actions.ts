"use server";

import { createClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validations/auth";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * The only auth action that runs purely server-side: it never changes the
 * caller's session, so there's no client/server cookie-sync concern. Sign-in,
 * sign-up and sign-out instead run on the *browser* Supabase client (see
 * AuthContext / admin login) — @supabase/ssr's cookie-backed session storage
 * means a session change made by a server action wouldn't be picked up by the
 * already-mounted browser client without an extra round trip, whereas a
 * client-side auth call updates cookies, fires `onAuthStateChange` and keeps
 * every context in sync immediately.
 */
export async function forgotPasswordAction(email: string): Promise<ActionResult> {
  const parsed = registerSchema.shape.email.safeParse(email);
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email" };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  // Errors are intentionally swallowed beyond validation — the UI always shows
  // a generic "if an account exists" message so this can't be used to enumerate
  // registered emails.
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${siteUrl}/account`,
  });
  return { ok: true };
}
