"use server";

import { resetPasswordForEmail } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validations/auth";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * The only auth action that runs purely server-side: it never changes the
 * caller's session, so there's no client/server cookie-sync concern. Sign-in,
 * sign-up and sign-out instead run on the *browser* auth client (see
 * AuthContext / admin login) — the provider's cookie-backed session storage
 * means a session change made by a server action wouldn't be picked up by the
 * already-mounted browser client without an extra round trip, whereas a
 * client-side auth call updates cookies, fires the session listener and keeps
 * every context in sync immediately.
 */
export async function forgotPasswordAction(email: string): Promise<ActionResult> {
  const parsed = registerSchema.shape.email.safeParse(email);
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await resetPasswordForEmail(parsed.data, `${siteUrl}/account`);
  return { ok: true };
}
