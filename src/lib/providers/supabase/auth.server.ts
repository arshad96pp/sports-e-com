import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AuthSessionPort, AuthUser, ProfileRecord } from "@/lib/core/ports/auth.port";

/** Supabase implementation of `AuthSessionPort` — moved verbatim from `lib/auth/session.ts` / `actions/auth-actions.ts`. */
export function createSupabaseAuthSessionPort(): AuthSessionPort {
  return {
    async getAuthenticatedUser(): Promise<AuthUser | null> {
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

    async resetPasswordForEmail(email: string, redirectTo: string): Promise<void> {
      const supabase = await createClient();
      // Errors are intentionally swallowed beyond validation (done by the caller) —
      // the UI always shows a generic "if an account exists" message so this can't
      // be used to enumerate registered emails.
      await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    },
  };
}
