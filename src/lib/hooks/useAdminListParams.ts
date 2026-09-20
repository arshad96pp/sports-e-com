"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * URL-search-param-backed list state for admin list pages (search/filter/sort/page) —
 * mirrors `useProductFilterParams` so the actual querying happens server-side in the
 * page component via the paginated service call, not in client state.
 */
export function useAdminListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigate = useCallback(
    (mutate: (params: URLSearchParams) => void, resetPage = true) => {
      const next = new URLSearchParams(searchParams.toString());
      mutate(next);
      if (resetPage) next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setParam = useCallback(
    (key: string, value: string | null, opts?: { resetPage?: boolean }) =>
      navigate((params) => {
        if (!value) params.delete(key);
        else params.set(key, value);
      }, opts?.resetPage ?? true),
    [navigate]
  );

  const setPage = useCallback(
    (page: number) =>
      navigate((params) => {
        if (page <= 1) params.delete("page");
        else params.set("page", String(page));
      }, false),
    [navigate]
  );

  /** Clears the given search/filter params (not sort, which is a display preference) and resets to page 1. */
  const clearParams = useCallback(
    (keys: string[]) =>
      navigate((params) => {
        for (const key of keys) params.delete(key);
      }),
    [navigate]
  );

  return { searchParams, setParam, setPage, clearParams };
}
