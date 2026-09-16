"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getAuthClientPort } from "@/lib/config/providers.client";
import type { AuthUser } from "@/lib/core/ports/auth.port";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SupabaseSessionValue {
  status: SessionStatus;
  user: AuthUser | null;
}

const SupabaseSessionContext = createContext<SupabaseSessionValue | null>(null);

/**
 * Single shared subscription to the provider's client-side auth state, so
 * AuthContext/CartContext/WishlistContext don't each open their own listener.
 * Mirrors the shape of next-auth's `useSession()` (`status` + `user`) that
 * those contexts were originally built against, to keep their code unchanged.
 */
export function SupabaseSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SupabaseSessionValue>({ status: "loading", user: null });

  useEffect(() => {
    // Supabase fires this immediately on subscribe with the session already
    // in storage (event: INITIAL_SESSION), so this one subscription both
    // resolves the initial state and keeps listening for changes — no need
    // for a separate `getUser()` call, which would cost a second network
    // round trip to Supabase's auth server on every page load just to learn
    // what this callback already tells us for free.
    const unsubscribe = getAuthClientPort().onAuthStateChange((user) => {
      setState({ status: user ? "authenticated" : "unauthenticated", user });
    });

    return unsubscribe;
  }, []);

  return <SupabaseSessionContext.Provider value={state}>{children}</SupabaseSessionContext.Provider>;
}

export function useSupabaseSession() {
  const ctx = useContext(SupabaseSessionContext);
  if (!ctx) throw new Error("useSupabaseSession must be used within SupabaseSessionProvider");
  return ctx;
}

export function useIsAuthenticated() {
  const { status } = useSupabaseSession();
  return useMemo(() => status === "authenticated", [status]);
}
