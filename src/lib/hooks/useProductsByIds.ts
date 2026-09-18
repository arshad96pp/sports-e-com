"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { getProductsByIdsAction } from "@/lib/actions/product-actions";

/**
 * Resolves live product data (price, name, image, stock) for a list of
 * product ids. Deliberately page-scoped rather than global — only the cart
 * and wishlist pages need full product rows for their ids; every other
 * consumer of cart/wishlist state (header badges, add-to-cart buttons,
 * heart toggles) only needs the id list itself, not the product data.
 */
export function useProductsByIds(ids: string[]): { products: Record<string, Product>; loading: boolean } {
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const idsKey = useMemo(() => [...new Set(ids)].sort().join(","), [ids]);

  useEffect(() => {
    const uniqueIds = idsKey ? idsKey.split(",") : [];
    if (uniqueIds.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadedKey(idsKey);
      return;
    }
    let cancelled = false;
    getProductsByIdsAction(uniqueIds).then((fetched) => {
      if (cancelled) return;
      setProducts((prev) => {
        const next = { ...prev };
        for (const p of fetched) next[p.id] = p;
        return next;
      });
      setLoadedKey(idsKey);
    });
    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  // Derived directly from render-time state (not the effect) so the very
  // first render after ids go from empty -> populated already reports
  // loading=true, instead of a one-tick gap where products/loading are both
  // stale and callers would render a false "resolved" state.
  const loading = idsKey !== "" && loadedKey !== idsKey;

  return { products, loading };
}
