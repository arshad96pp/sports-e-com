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
export function useProductsByIds(ids: string[]): Record<string, Product> {
  const [products, setProducts] = useState<Record<string, Product>>({});
  const idsKey = useMemo(() => [...new Set(ids)].sort().join(","), [ids]);

  useEffect(() => {
    const uniqueIds = idsKey ? idsKey.split(",") : [];
    if (uniqueIds.length === 0) return;
    let cancelled = false;
    getProductsByIdsAction(uniqueIds).then((fetched) => {
      if (cancelled) return;
      setProducts((prev) => {
        const next = { ...prev };
        for (const p of fetched) next[p.id] = p;
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  return products;
}
