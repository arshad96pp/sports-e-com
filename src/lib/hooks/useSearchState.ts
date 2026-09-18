"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import {
  getSearchIdleContentAction,
  searchSuggestionsAction,
  type SearchCategoryHit,
} from "@/lib/actions/search-actions";
import { useRecentSearches } from "@/lib/hooks/useRecentSearches";

export type SearchStatus = "idle" | "loading" | "results" | "no-results";

const DEBOUNCE_MS = 260;

/**
 * Encapsulates all search state/logic (query, debounce, status, result sets)
 * independently of the overlay UI. `searchSuggestionsAction`/
 * `getSearchIdleContentAction` are the only functions that touch product
 * data — both run a targeted database query server-side rather than shipping
 * the whole catalogue to the browser to filter.
 *
 * `open` gates the idle-content fetch: the overlay is mounted (but hidden)
 * on every page via `HeaderActions`, so fetching on mount would cost every
 * visitor 2 Supabase queries even if they never open search. Fetched once,
 * on first open only.
 */
export function useSearchState(open: boolean) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [matchingProducts, setMatchingProducts] = useState<Product[]>([]);
  const [matchingCategories, setMatchingCategories] = useState<SearchCategoryHit[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const { recent, add: addRecentSearch, clear: clearRecentSearches } = useRecentSearches();
  const idleFetchedRef = useRef(false);

  useEffect(() => {
    if (!open || idleFetchedRef.current) return;
    idleFetchedRef.current = true;
    getSearchIdleContentAction().then(({ bestSellers }) => {
      setBestSellers(bestSellers);
    });
  }, [open]);

  useEffect(() => {
    if (query.trim() === "") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("idle");
      setMatchingProducts([]);
      setMatchingCategories([]);
      return;
    }

    setStatus("loading");
    let cancelled = false;
    const timer = setTimeout(() => {
      searchSuggestionsAction(query).then(({ products, categories }) => {
        if (cancelled) return;
        setMatchingProducts(products);
        setMatchingCategories(categories);
        setStatus(products.length === 0 && categories.length === 0 ? "no-results" : "results");
      });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return {
    query,
    setQuery,
    status,
    matchingProducts,
    matchingCategories,
    bestSellers,
    recentSearches: recent,
    addRecentSearch,
    clearRecentSearches,
  };
}
