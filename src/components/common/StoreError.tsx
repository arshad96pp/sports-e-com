"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Shared error fallback for customer-facing route segments (`error.tsx`
 * boundaries) — keeps the storefront's header/footer/chrome in place instead
 * of falling back to Next's bare default error page.
 */
export function StoreError({
  error,
  reset,
  title = "Something went wrong.",
  description = "We hit a snag loading this page. Please try again.",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="mb-4 h-14 w-14 text-muted-soft" strokeWidth={1.5} />
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="tap-target mt-6 inline-flex items-center justify-center rounded-full bg-ink px-7 text-sm font-semibold text-white transition-colors hover:bg-ink-soft"
      >
        Try again
      </button>
    </div>
  );
}
