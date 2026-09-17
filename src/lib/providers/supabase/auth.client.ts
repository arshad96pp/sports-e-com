import { createClient } from "@/lib/supabase/client";
import type { AuthClientPort } from "@/lib/core/ports/auth.port";

/**
 * Browser-side Supabase auth adapter. Deliberately has no `"server-only"`
 * import (unlike every other adapter) — it must be importable from client
 * components, since sign-in/up/out have to run in the browser for
 * `@supabase/ssr`'s cookie storage to stay in sync with the mounted UI.
 */
export function createSupabaseAuthClientPort(): AuthClientPort {
  return {
    onAuthStateChange(callback) {
      const supabase = createClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ? { id: session.user.id } : null);
      });
      return () => subscription.unsubscribe();
    },

    async signInWithPassword(email, password) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { user: null, error: { code: error.code, message: error.message } };
      return { user: data.user ? { id: data.user.id } : null, error: null };
    },

    async signUp(email, password, profile) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: profile.fullName, phone: profile.phone || null },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
        },
      });
      if (error) return { needsEmailConfirmation: false, error: { code: error.code, message: error.message } };

      return { needsEmailConfirmation: !data.session, error: null };
    },

    async signOut(): Promise<void> {
      const supabase = createClient();
      await supabase.auth.signOut();
    },

    async getProfileRole(userId) {
      const supabase = createClient();
      const { data: profile } = await supabase.from("profiles").select("role, is_active").eq("id", userId).single();
      if (!profile) return null;
      return { role: profile.role, isActive: profile.is_active };
    },

    async updatePassword(newPassword) {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error: error ? { code: error.code, message: error.message } : null };
    },
  };
}
