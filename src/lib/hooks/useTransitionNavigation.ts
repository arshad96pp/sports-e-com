"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/**
 * Wraps `router.push`/`replace` in a React transition. App Router
 * navigations are transitions internally, but that pending state isn't
 * exposed to the caller unless the call site opens its own `useTransition` —
 * this is that, so a component can render an in-place placeholder (ideally
 * the destination's own skeleton) for the exact window between "navigation
 * started" and "the destination — or its loading.tsx fallback — committed."
 */
export function useTransitionNavigation() {
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();

  function push(href: string) {
    startTransition(() => router.push(href));
  }

  function replace(href: string) {
    startTransition(() => router.replace(href));
  }

  // Exposed for compound cases (e.g. push + refresh) the two helpers above
  // don't cover.
  return { isNavigating, push, replace, startTransition };
}
