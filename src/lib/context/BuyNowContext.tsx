"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { WhatsAppOrderLine } from "@/lib/utils/whatsapp";
import type { Address } from "@/lib/types";

export interface BuyNowRequest {
  lines: WhatsAppOrderLine[];
  clearCartAfter: boolean;
  /** Gate this request behind login — see BuyNowModal. Cart checkout sets this; PDP "Buy Now" doesn't. */
  requireAuth: boolean;
}

/** What to re-open, with what the guest had already typed, once they're signed in. One-time — consumed by BuyNowModal's resume effect. */
export interface PendingWhatsAppResume {
  lines: WhatsAppOrderLine[];
  address: Address;
  clearCartAfter: boolean;
}

interface BuyNowContextValue {
  request: BuyNowRequest | null;
  openBuyNow: (lines: WhatsAppOrderLine[], opts?: { clearCartAfter?: boolean; requireAuth?: boolean }) => void;
  closeBuyNow: () => void;
  pendingResume: PendingWhatsAppResume | null;
  setPendingResume: (resume: PendingWhatsAppResume | null) => void;
}

const BuyNowContext = createContext<BuyNowContextValue | null>(null);

export function BuyNowProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<BuyNowRequest | null>(null);
  const [pendingResume, setPendingResume] = useState<PendingWhatsAppResume | null>(null);

  const openBuyNow = useCallback<BuyNowContextValue["openBuyNow"]>((lines, opts) => {
    setRequest({ lines, clearCartAfter: opts?.clearCartAfter ?? false, requireAuth: opts?.requireAuth ?? false });
  }, []);

  const closeBuyNow = useCallback(() => setRequest(null), []);

  const value = useMemo(
    () => ({ request, openBuyNow, closeBuyNow, pendingResume, setPendingResume }),
    [request, openBuyNow, closeBuyNow, pendingResume]
  );

  return <BuyNowContext.Provider value={value}>{children}</BuyNowContext.Provider>;
}

export function useBuyNow() {
  const ctx = useContext(BuyNowContext);
  if (!ctx) throw new Error("useBuyNow must be used within BuyNowProvider");
  return ctx;
}
