"use client";

import { SupabaseSessionProvider } from "@/lib/context/SupabaseSessionContext";
import { ToastProvider } from "@/lib/context/ToastContext";
import { AuthProvider } from "@/lib/context/AuthContext";
import { CartProvider } from "@/lib/context/CartContext";
import { WishlistProvider } from "@/lib/context/WishlistContext";
import { BuyNowProvider } from "@/lib/context/BuyNowContext";
import { QuickViewProvider } from "@/lib/context/QuickViewContext";
import { ToastViewport } from "@/components/ui/ToastViewport";
import { BuyNowModal } from "@/components/checkout/BuyNowModal";
import { QuickViewModal } from "@/components/product/QuickViewModal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseSessionProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <BuyNowProvider>
                <QuickViewProvider>
                  {children}
                  <ToastViewport />
                  <BuyNowModal />
                  <QuickViewModal />
                </QuickViewProvider>
              </BuyNowProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </SupabaseSessionProvider>
  );
}
