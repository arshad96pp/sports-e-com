"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { WhatsAppOrderLine } from "@/lib/utils/whatsapp";

export interface BuyNowRequest {
  lines: WhatsAppOrderLine[];
  clearCartAfter: boolean;
}

interface BuyNowContextValue {
  request: BuyNowRequest | null;
  openBuyNow: (lines: WhatsAppOrderLine[], opts?: { clearCartAfter?: boolean }) => void;
  closeBuyNow: () => void;
}

const BuyNowContext = createContext<BuyNowContextValue | null>(null);

export function BuyNowProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<BuyNowRequest | null>(null);

  const openBuyNow = useCallback<BuyNowContextValue["openBuyNow"]>((lines, opts) => {
    setRequest({ lines, clearCartAfter: opts?.clearCartAfter ?? false });
  }, []);

  const closeBuyNow = useCallback(() => setRequest(null), []);

  const value = useMemo(() => ({ request, openBuyNow, closeBuyNow }), [request, openBuyNow, closeBuyNow]);

  return <BuyNowContext.Provider value={value}>{children}</BuyNowContext.Provider>;
}

export function useBuyNow() {
  const ctx = useContext(BuyNowContext);
  if (!ctx) throw new Error("useBuyNow must be used within BuyNowProvider");
  return ctx;
}
