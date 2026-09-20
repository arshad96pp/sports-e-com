"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { getProductsByIdsAction } from "@/lib/actions/product-actions";


export function useProductsByIds(
  ids: string[]
): { products: Record<string, Product>; loading: boolean; error: boolean; retry: () => void } {
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const idsKey = useMemo(() => [...new Set(ids)].sort().join(","), [ids]);

  useEffect(() => {
    const uniqueIds = idsKey ? idsKey.split(",") : [];
    if (uniqueIds.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadedKey(idsKey);
      setError(false);
      return;
    }
    let cancelled = false;
    setError(false);
    getProductsByIdsAction(uniqueIds)
      .then((fetched) => {
        if (cancelled) return;
        setProducts((prev) => {
          const next = { ...prev };
          for (const p of fetched) next[p.id] = p;
          return next;
        });
        setLoadedKey(idsKey);
      })
      .catch(() => {
        if (cancelled) return;
        // Marks this key as "settled" (not stuck) even on failure, so
        // `loading` doesn't hang forever — callers use `error` to show a
        // retry affordance instead of silently rendering an empty result.
        setError(true);
        setLoadedKey(idsKey);
      });
    return () => {
      cancelled = true;
    };
  }, [idsKey, attempt]);

  // Derived directly from render-time state (not the effect) so the very
  // first render after ids go from empty -> populated already reports
  // loading=true, instead of a one-tick gap where products/loading are both
  // stale and callers would render a false "resolved" state.
  const loading = idsKey !== "" && loadedKey !== idsKey;

  return { products, loading, error, retry: () => setAttempt((a) => a + 1) };
}
