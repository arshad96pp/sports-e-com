"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SupabaseSessionValue {
  status: SessionStatus;
  user: User | null;
}

const SupabaseSessionContext = createContext<SupabaseSessionValue | null>(null);

/**
 * Single shared subscription to Supabase's client-side auth state, so
 * AuthContext/CartContext/WishlistContext don't each open their own listener.
 * Mirrors the shape of next-auth's `useSession()` (`status` + `user`) that
 * those contexts were originally built against, to keep their code unchanged.
 */
export function SupabaseSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SupabaseSessionValue>({ status: "loading", user: null });

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setState({ status: data.user ? "authenticated" : "unauthenticated", user: data.user });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ status: session?.user ? "authenticated" : "unauthenticated", user: session?.user ?? null });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
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
