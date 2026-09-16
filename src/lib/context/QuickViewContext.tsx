"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Product } from "@/lib/types";

interface QuickViewContextValue {
  product: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);

  const openQuickView = useCallback((p: Product) => setProduct(p), []);
  const closeQuickView = useCallback(() => setProduct(null), []);

  const value = useMemo(() => ({ product, openQuickView, closeQuickView }), [product, openQuickView, closeQuickView]);

  return <QuickViewContext.Provider value={value}>{children}</QuickViewContext.Provider>;
}

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error("useQuickView must be used within QuickViewProvider");
  return ctx;
}
