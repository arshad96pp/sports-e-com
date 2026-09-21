"use client";

import { ToastProvider } from "@/lib/context/ToastContext";
import { ToastViewport } from "@/components/ui/ToastViewport";

/**
 * Reuses the exact storefront toast system (ToastContext + ToastViewport) for
 * the Admin Panel, without pulling in customer-only providers (cart,
 * wishlist, etc.) — see `(customer)/layout.tsx` for why those stay scoped
 * to the storefront.
 */
export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastViewport />
    </ToastProvider>
  );
}
