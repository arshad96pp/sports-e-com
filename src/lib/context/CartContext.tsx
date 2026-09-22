"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSupabaseSession } from "@/lib/context/SupabaseSessionContext";
import type { CartItem } from "@/lib/types";
import { readStorage, writeStorage } from "@/lib/utils/storage";
import { useToast } from "@/lib/context/ToastContext";
import {
  addCartItemAction,
  clearCartAction,
  getCartAction,
  mergeCartAction,
  removeCartItemAction,
  setCartItemQuantityAction,
} from "@/lib/actions/cart-actions";

const STORAGE_KEY = "stryde.cart";

/**
 * Module-level gate so React Strict Mode remounts (which reset useRef) and
 * overlapping login effects cannot run two merges at once and double quantities.
 */
let mergeInFlight: Promise<boolean> | null = null;

export function cartKey(productId: string, variantId: string | null, size: string | null, color: string | null) {
  return `${productId}::${variantId ?? "-"}::${size ?? "-"}::${color ?? "-"}`;
}

interface AddItemOptions {
  quantity?: number;
  variantId?: string | null;
  size?: string | null;
  color?: string | null;
  /** Shown in the "added to cart" toast — pass `product.name` from the call site so this never needs its own product lookup. */
  productName?: string;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  /** False until the cart has been restored from localStorage or the DB. */
  isInitialized: boolean;
  addItem: (productId: string, opts?: AddItemOptions) => void;
  removeItem: (productId: string, variantId: string | null, size: string | null, color: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null, size: string | null, color: string | null, quantity: number) => void;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Guests: cart lives entirely in localStorage.
 * Signed-in users: cart is persisted server-side (Postgres via server actions).
 * On login, any guest cart is merged into the account's DB cart exactly once,
 * and localStorage is cleared only after that write is confirmed.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSupabaseSession();
  const isAuthed = status === "authenticated";
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const mergedRef = useRef(false);
  const opChainRef = useRef(Promise.resolve());
  const { showToast } = useToast();

  const runExclusive = useCallback((op: () => Promise<void>) => {
    const next = opChainRef.current.then(op, op);
    opChainRef.current = next.then(
      () => undefined,
      () => undefined
    );
    return next;
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (!isAuthed) {
      mergedRef.current = false;
      mergeInFlight = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(readStorage(STORAGE_KEY, []));
      setHydrated(true);
      return;
    }

    let cancelled = false;
    void runExclusive(async () => {
      if (cancelled) return;
      try {
        if (!mergedRef.current) {
          const guestItems = readStorage<CartItem[]>(STORAGE_KEY, []);
          if (guestItems.length > 0) {
            if (!mergeInFlight) {
              mergeInFlight = (async () => {
                let result: { ok: boolean; error?: string };
                try {
                  result = await mergeCartAction(guestItems);
                } catch (error) {
                  console.error("Cart merge failed", error);
                  result = { ok: false, error: "Could not merge cart." };
                }
                if (!result.ok) {
                  console.error("Cart merge failed", result.error);
                  return false;
                }
                // Confirm DB success BEFORE touching localStorage.
                writeStorage(STORAGE_KEY, []);
                return true;
              })();
            }
            const merged = await mergeInFlight;
            if (!merged) {
              mergeInFlight = null;
              if (!cancelled) {
                showToast("Couldn't save your cart. Your items are still on this device — please refresh to try again.", "error");
              }
              return;
            }
          }
          mergedRef.current = true;
        }
        const dbItems = await getCartAction();
        if (!cancelled) setItems(dbItems);
      } catch {
        if (!cancelled) showToast("Couldn't load your cart. Please refresh.", "error");
      } finally {
        if (!cancelled) setHydrated(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [status, isAuthed, showToast, runExclusive]);

  useEffect(() => {
    if (hydrated && !isAuthed) writeStorage(STORAGE_KEY, items);
  }, [items, hydrated, isAuthed]);

  const addItem = useCallback<CartContextValue["addItem"]>(
    (productId, opts) => {
      const quantity = opts?.quantity ?? 1;
      const variantId = opts?.variantId ?? null;
      const size = opts?.size ?? null;
      const color = opts?.color ?? null;

      const applyLocal = () => {
        setItems((prev) => {
          const key = cartKey(productId, variantId, size, color);
          const existing = prev.find((i) => cartKey(i.productId, i.variantId, i.size, i.color) === key);
          if (existing) {
            return prev.map((i) =>
              cartKey(i.productId, i.variantId, i.size, i.color) === key
                ? { ...i, quantity: i.quantity + quantity }
                : i
            );
          }
          return [...prev, { productId, variantId, quantity, size, color }];
        });
      };

      if (!isAuthed) {
        applyLocal();
        showToast(`${opts?.productName ?? "Item"} added to cart`, "cart");
        return;
      }

      showToast(`${opts?.productName ?? "Item"} added to cart`, "cart");
      void runExclusive(async () => {
        applyLocal();
        try {
          const result = await addCartItemAction(productId, variantId, quantity, size, color);
          if (!result.ok) showToast(result.error ?? "Couldn't sync your cart. Please refresh and try again.", "error");
        } catch {
          showToast("Couldn't sync your cart. Please refresh and try again.", "error");
        }
      });
    },
    [isAuthed, showToast, runExclusive]
  );

  const removeItem = useCallback<CartContextValue["removeItem"]>(
    (productId, variantId, size, color) => {
      const key = cartKey(productId, variantId, size, color);
      const applyLocal = () => setItems((prev) => prev.filter((i) => cartKey(i.productId, i.variantId, i.size, i.color) !== key));

      if (!isAuthed) {
        applyLocal();
        return;
      }

      void runExclusive(async () => {
        applyLocal();
        try {
          await removeCartItemAction(productId, variantId, size, color);
        } catch {
          showToast("Couldn't sync your cart. Please refresh and try again.", "error");
        }
      });
    },
    [isAuthed, showToast, runExclusive]
  );

  const updateQuantity = useCallback<CartContextValue["updateQuantity"]>(
    (productId, variantId, size, color, quantity) => {
      const key = cartKey(productId, variantId, size, color);
      const applyLocal = () =>
        setItems((prev) =>
          quantity <= 0
            ? prev.filter((i) => cartKey(i.productId, i.variantId, i.size, i.color) !== key)
            : prev.map((i) =>
                cartKey(i.productId, i.variantId, i.size, i.color) === key ? { ...i, quantity } : i
              )
        );

      if (!isAuthed) {
        applyLocal();
        return;
      }

      void runExclusive(async () => {
        applyLocal();
        try {
          await setCartItemQuantityAction(productId, variantId, size, color, quantity);
        } catch {
          showToast("Couldn't sync your cart. Please refresh and try again.", "error");
        }
      });
    },
    [isAuthed, showToast, runExclusive]
  );

  const clear = useCallback(async () => {
    if (!isAuthed) {
      setItems([]);
      return;
    }
    await runExclusive(async () => {
      setItems([]);
      await clearCartAction();
    });
  }, [isAuthed, runExclusive]);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({ items, count, isInitialized: hydrated, addItem, removeItem, updateQuantity, clear }),
    [items, count, hydrated, addItem, removeItem, updateQuantity, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
