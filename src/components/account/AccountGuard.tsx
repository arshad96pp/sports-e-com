"use client";

import Link from "next/link";
import { UserCircle } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export function AccountGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrated } = useAuth();

  // The proxy (see src/proxy.ts) already redirects signed-out requests away
  // from /account before this ever renders, so on first paint we can assume
  // authenticated rather than blanking the page until the client auth
  // listener catches up. Only swap to the logged-out state once hydration
  // actually confirms the session is gone (e.g. it expired while this tab
  // was open) — never during the loading window itself.
  if (hydrated && !isAuthenticated) {
    return (
      <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <UserCircle className="mb-4 h-14 w-14 text-muted-soft" strokeWidth={1.5} />
        <h1 className="font-display text-xl font-bold text-ink">Login to view this page</h1>
        <p className="mt-1.5 max-w-sm text-sm text-muted">
          Access your wishlist and account settings after logging in.
        </p>
        <Link
          href="/login"
          className="tap-target mt-6 inline-flex items-center justify-center rounded-full bg-ink px-7 text-sm font-semibold text-white"
        >
          Login
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
