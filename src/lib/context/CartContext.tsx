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

export function cartKey(productId: string, size: string | null, color: string | null) {
  return `${productId}::${size ?? "-"}::${color ?? "-"}`;
}

interface AddItemOptions {
  quantity?: number;
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
  removeItem: (productId: string, size: string | null, color: string | null) => void;
  updateQuantity: (productId: string, size: string | null, color: string | null, quantity: number) => void;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Guests: cart lives entirely in localStorage.
 * Signed-in users: cart is persisted server-side (Postgres via server actions).
 * On login, any guest cart is merged into the account's DB cart exactly once.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSupabaseSession();
  const isAuthed = status === "authenticated";
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const mergedRef = useRef(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (status === "loading") return;

    if (!isAuthed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(readStorage(STORAGE_KEY, []));
      setHydrated(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        if (!mergedRef.current) {
          mergedRef.current = true;
          const guestItems = readStorage<CartItem[]>(STORAGE_KEY, []);
          if (guestItems.length > 0) {
            await mergeCartAction(guestItems);
            writeStorage(STORAGE_KEY, []);
          }
        }
        const dbItems = await getCartAction();
        if (!cancelled) setItems(dbItems);
      } catch {
        if (!cancelled) showToast("Couldn't load your cart. Please refresh.", "error");
      } finally {
        // Always settles `hydrated`, even on failure, so the cart page never
        // gets stuck on its skeleton forever.
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, isAuthed, showToast]);

  useEffect(() => {
    if (hydrated && !isAuthed) writeStorage(STORAGE_KEY, items);
  }, [items, hydrated, isAuthed]);

  const addItem = useCallback<CartContextValue["addItem"]>(
    (productId, opts) => {
      const quantity = opts?.quantity ?? 1;
      const size = opts?.size ?? null;
      const color = opts?.color ?? null;

      setItems((prev) => {
        const key = cartKey(productId, size, color);
        const existing = prev.find((i) => cartKey(i.productId, i.size, i.color) === key);
        if (existing) {
          return prev.map((i) =>
            cartKey(i.productId, i.size, i.color) === key
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prev, { productId, quantity, size, color }];
      });

      if (isAuthed) {
        addCartItemAction(productId, quantity, size, color).catch(() => {
          showToast("Couldn't sync your cart. Please refresh and try again.", "error");
        });
      }
      showToast(`${opts?.productName ?? "Item"} added to cart`, "cart");
    },
    [isAuthed, showToast]
  );

  const removeItem = useCallback<CartContextValue["removeItem"]>(
    (productId, size, color) => {
      const key = cartKey(productId, size, color);
      setItems((prev) => prev.filter((i) => cartKey(i.productId, i.size, i.color) !== key));
      if (isAuthed) {
        removeCartItemAction(productId, size, color).catch(() => {
          showToast("Couldn't sync your cart. Please refresh and try again.", "error");
        });
      }
    },
    [isAuthed, showToast]
  );

  const updateQuantity = useCallback<CartContextValue["updateQuantity"]>(
    (productId, size, color, quantity) => {
      const key = cartKey(productId, size, color);
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => cartKey(i.productId, i.size, i.color) !== key)
          : prev.map((i) =>
              cartKey(i.productId, i.size, i.color) === key ? { ...i, quantity } : i
            )
      );
      if (isAuthed) {
        setCartItemQuantityAction(productId, size, color, quantity).catch(() => {
          showToast("Couldn't sync your cart. Please refresh and try again.", "error");
        });
      }
    },
    [isAuthed, showToast]
  );

  const clear = useCallback(async () => {
    setItems([]);
    if (isAuthed) await clearCartAction();
  }, [isAuthed]);

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
