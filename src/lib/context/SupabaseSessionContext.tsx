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
    const auth = getAuthClientPort();
    let active = true;

    auth.getUser().then((user) => {
      if (!active) return;
      setState({ status: user ? "authenticated" : "unauthenticated", user });
    });

    const unsubscribe = auth.onAuthStateChange((user) => {
      setState({ status: user ? "authenticated" : "unauthenticated", user });
    });

    return () => {
      active = false;
      unsubscribe();
    };
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
