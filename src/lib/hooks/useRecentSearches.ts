"use client";

import { useCallback, useEffect, useState } from "react";
import { readStorage, writeStorage } from "@/lib/utils/storage";

const STORAGE_KEY = "stryde.recent-searches";
const MAX_ITEMS = 6;

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    // Read localStorage only after mount so the client's first render matches the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(readStorage(STORAGE_KEY, []));
  }, []);

  const add = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        MAX_ITEMS
      );
      writeStorage(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    writeStorage(STORAGE_KEY, []);
  }, []);

  return { recent, add, clear };
}
