"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSupabaseSession } from "@/lib/context/SupabaseSessionContext";
import { readStorage, writeStorage } from "@/lib/utils/storage";
import { useToast } from "@/lib/context/ToastContext";
import {
  getWishlistAction,
  mergeWishlistAction,
  removeWishlistItemAction,
  toggleWishlistAction,
} from "@/lib/actions/wishlist-actions";

const STORAGE_KEY = "stryde.wishlist";

interface WishlistContextValue {
  productIds: string[];
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

/** Same guest-localStorage / signed-in-DB hybrid pattern as CartContext. */
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSupabaseSession();
  const isAuthed = status === "authenticated";
  const [productIds, setProductIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const mergedRef = useRef(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (status === "loading") return;

    if (!isAuthed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProductIds(readStorage(STORAGE_KEY, []));
      setHydrated(true);
      return;
    }

    let cancelled = false;
    (async () => {
      if (!mergedRef.current) {
        mergedRef.current = true;
        const guestIds = readStorage<string[]>(STORAGE_KEY, []);
        if (guestIds.length > 0) {
          await mergeWishlistAction(guestIds);
          writeStorage(STORAGE_KEY, []);
        }
      }
      const dbIds = await getWishlistAction();
      if (!cancelled) {
        setProductIds(dbIds);
        setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, isAuthed]);

  useEffect(() => {
    if (hydrated && !isAuthed) writeStorage(STORAGE_KEY, productIds);
  }, [productIds, hydrated, isAuthed]);

  const isWishlisted = useCallback((productId: string) => productIds.includes(productId), [productIds]);

  const toggle = useCallback(
    (productId: string) => {
      const exists = productIds.includes(productId);
      setProductIds((prev) =>
        exists ? prev.filter((id) => id !== productId) : [...prev, productId]
      );
      if (isAuthed) void toggleWishlistAction(productId);
      showToast(exists ? "Removed from wishlist" : "Added to wishlist", "wishlist");
    },
    [productIds, isAuthed, showToast]
  );

  const remove = useCallback(
    (productId: string) => {
      setProductIds((prev) => prev.filter((id) => id !== productId));
      if (isAuthed) void removeWishlistItemAction(productId);
    },
    [isAuthed]
  );

  const value = useMemo(
    () => ({ productIds, isWishlisted, toggle, remove }),
    [productIds, isWishlisted, toggle, remove]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
