"use client";

import { Loader2 } from "lucide-react";
import { STORE } from "@/lib/config";

/**
 * Full-viewport cover for navigations where the destination's chrome
 * genuinely differs from the current page (e.g. admin login's centered card
 * vs. the dashboard's sidebar shell), so there's no sensible in-place
 * skeleton to swap to. Prefer rendering the destination's own skeleton
 * in-place instead of this wherever the surrounding layout persists across
 * the navigation (see LoginPageClient/RegisterPageClient for that pattern).
 * Deliberately wordless — a spinner communicates "something is happening"
 * without a message that can go stale or feel like padding.
 */
export function NavigationOverlay({ show }: { show: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!show}
      className={`fixed inset-0 z-70 flex flex-col items-center justify-center gap-3 bg-white/95 backdrop-blur-sm transition-opacity duration-150 ${
        show ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <span className="font-display text-lg font-extrabold tracking-tight text-ink">{STORE.name}</span>
      <Loader2 className="h-6 w-6 animate-spin text-ink-soft" />
    </div>
  );
}
