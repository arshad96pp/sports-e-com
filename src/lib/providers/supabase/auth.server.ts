import "server-only";
import { headers } from "next/headers";
import { SITE_URL } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSmtpConfigured, sendMail } from "@/lib/email/smtp";
import { renderResetPasswordEmail } from "@/lib/email/reset-password-email";
import type { AuthSessionPort, AuthUser, ProfileRecord } from "@/lib/core/ports/auth.port";

function publicOrigin(): string {
  const origin = SITE_URL.replace(/\/$/, "");
  if (
    process.env.NODE_ENV === "production" &&
    (origin.startsWith("http://") || origin.includes("localhost") || origin.includes("127.0.0.1"))
  ) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a public HTTPS URL in production.");
  }
  return origin;
}

/**
 * Consumes a recovery token that was created but never emailed, so it cannot
 * later be used. Runs on an ephemeral service-role client (no cookies), so it
 * cannot attach a session to the caller.
 */
async function consumeRecoveryToken(tokenHash: string): Promise<void> {
  try {
    const ephemeral = createAdminClient();
    await ephemeral.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
    await ephemeral.auth.signOut({ scope: "local" });
  } catch (err) {
    console.error("Failed to invalidate unused recovery token:", err instanceof Error ? err.message : err);
  }
}

/** Supabase implementation of `AuthSessionPort` — moved verbatim from `lib/auth/session.ts` / `actions/auth-actions.ts`. */
export function createSupabaseAuthSessionPort(): AuthSessionPort {
  return {
    async getAuthenticatedUser(): Promise<AuthUser | null> {
      // On routes the proxy (middleware) covers (see lib/supabase/middleware.ts),
      // it already called `auth.getUser()` — a real network round trip to
      // Supabase's auth server — and forwarded the verified id via this header.
      // Reusing it here avoids paying for that same round trip a second time
      // in this request. Routes the proxy doesn't cover won't have the header
      // and fall through to the real check below, so nothing loses verification.
      const verifiedUserId = (await headers()).get("x-verified-user-id");
      if (verifiedUserId) return { id: verifiedUserId };

      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user ? { id: user.id } : null;
    },

    async getProfileById(userId: string): Promise<ProfileRecord | null> {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, phone, role, is_active")
        .eq("id", userId)
        .single();
      if (!profile) return null;
      return {
        fullName: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        isActive: profile.is_active,
      };
    },

    async resetPasswordForEmail(email: string): Promise<void> {
      // Errors (unknown email, SMTP, inactive account) are swallowed so the
      // UI always shows the same "if an account exists" message.
      if (!isSmtpConfigured()) {
        console.error("Password reset skipped: SMTP is not configured.");
        return;
      }

      const origin = publicOrigin();
      const admin = createAdminClient();
      const { data, error } = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
      });

      const tokenHash = data?.properties?.hashed_token;
      if (error || !tokenHash || !data.user) {
        return;
      }

      const { data: profile } = await admin
        .from("profiles")
        .select("full_name, is_active")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile && profile.is_active === false) {
        await consumeRecoveryToken(tokenHash);
        return;
      }

      const fullName =
        profile?.full_name ||
        (typeof data.user.user_metadata?.full_name === "string" ? data.user.user_metadata.full_name : "");
      const resetUrl = `${origin}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=recovery`;
      const mail = renderResetPasswordEmail({ fullName, resetUrl });

      try {
        await sendMail({
          to: email,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
        });
      } catch (err) {
        console.error("Failed to send password reset email:", err instanceof Error ? err.message : err);
        await consumeRecoveryToken(tokenHash);
      }
    },

    async completePasswordReset(newPassword: string): Promise<{ error: { code?: string; message: string } | null }> {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { error: { message: "No recovery session" } };
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        console.error("Password reset failed:", error.code ?? "unknown");
        return { error: { code: error.code, message: error.message } };
      }
      try {
        // Default signOut scope is global — revokes refresh tokens on every device.
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Password reset: session revoke failed:", err instanceof Error ? err.message : err);
      }
      return { error: null };
    },

    async updateProfile(userId: string, data: { fullName: string; phone: string }): Promise<void> {
      const supabase = await createClient();
      await supabase
        .from("profiles")
        .update({ full_name: data.fullName, phone: data.phone || null })
        .eq("id", userId);
    },
  };
}
