"use server";

import { after } from "next/server";
import { cookies, headers } from "next/headers";
import { completePasswordReset, resetPasswordForEmail } from "@/lib/auth/session";
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/auth/password-recovery";
import { isRateLimited } from "@/lib/security/rate-limit";
import { registerSchema, resetPasswordSchema } from "@/lib/validations/auth";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const GENERIC_RESET_ERROR = "Could not update your password. Please request a new reset link and try again.";

function clientIp(headerList: Awaited<ReturnType<typeof headers>>): string {
  return headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown";
}

/**
 * The only auth actions that run purely server-side: they never establish a
 * new session for the caller. Sign-in, sign-up and sign-out instead run on the
 * *browser* auth client (see AuthContext / admin login) — the provider's
 * cookie-backed session storage means a session change made by a server action
 * wouldn't be picked up by the already-mounted browser client without an extra
 * round trip, whereas a client-side auth call updates cookies, fires the
 * session listener and keeps every context in sync immediately.
 *
 * resetPasswordAction is the exception that *does* sign the user out
 * (after a successful recovery) — the reset page then calls client signOut so
 * the mounted browser client drops the stale in-memory session.
 */
export async function forgotPasswordAction(email: string): Promise<ActionResult> {
  const parsed = registerSchema.shape.email.safeParse(email);
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email" };
  }

  const ip = clientIp(await headers());
  if (isRateLimited("forgot-password-ip", ip, 8, 60 * 60_000)) {
    return { ok: false, error: "Too many requests. Please try again later." };
  }

  // Per-email cap is silent (same generic success) so it cannot be used to
  // enumerate registered addresses. It still stops inbox flooding.
  const emailThrottled = isRateLimited("forgot-password-email", parsed.data, 3, 60 * 60_000);

  if (!emailThrottled) {
    after(async () => {
      try {
        await resetPasswordForEmail(parsed.data);
      } catch (err) {
        console.error("Password reset failed:", err instanceof Error ? err.message : err);
      }
    });
  }

  return { ok: true };
}

export async function resetPasswordAction(password: string, confirmPassword: string): Promise<ActionResult> {
  const cookieStore = await cookies();
  if (cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value !== "1") {
    return { ok: false, error: GENERIC_RESET_ERROR };
  }

  const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid password" };
  }

  const { error } = await completePasswordReset(parsed.data.password);
  if (error) {
    return { ok: false, error: GENERIC_RESET_ERROR };
  }

  cookieStore.set(PASSWORD_RECOVERY_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return { ok: true };
}
