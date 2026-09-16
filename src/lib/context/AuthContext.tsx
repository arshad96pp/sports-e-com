"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { UserProfile } from "@/lib/types";
import { useToast } from "@/lib/context/ToastContext";
import { useSupabaseSession } from "@/lib/context/SupabaseSessionContext";
import { getAuthClientPort } from "@/lib/config/providers.client";
import { getMyProfileAction } from "@/lib/actions/profile-actions";

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Deliberately just identity + display profile. Login/Register call
 * Supabase directly (see LoginPageClient/RegisterPageClient) so auth never
 * waits on this; account-data (addresses, orders, etc.) is fetched by the
 * pages/components that actually need it, not here.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSupabaseSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { showToast } = useToast();

  const hydrated = status !== "loading";
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    if (!isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(null);
      return;
    }
    let cancelled = false;
    getMyProfileAction().then((p) => {
      if (!cancelled) setProfile(p);
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const logout = useCallback(() => {
    void getAuthClientPort().signOut();
    showToast("You have been logged out", "info");
  }, [showToast]);

  const value = useMemo<AuthContextValue>(
    () => ({ user: profile, isAuthenticated, hydrated, logout }),
    [profile, isAuthenticated, hydrated, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
