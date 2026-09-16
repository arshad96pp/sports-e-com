"use client";

import { CheckCircle2, Heart, ShoppingBag, Info } from "lucide-react";
import { useToast, type ToastKind } from "@/lib/context/ToastContext";

const ICONS: Record<ToastKind, React.ComponentType<{ className?: string }>> = {
  cart: ShoppingBag,
  wishlist: Heart,
  success: CheckCircle2,
  info: Info,
};

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-100 flex flex-col items-center gap-2 px-4 sm:bottom-6">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.kind];
        return (
          <div
            key={toast.id}
            role="status"
            onClick={() => dismissToast(toast.id)}
            className="pointer-events-auto flex animate-slide-up items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-medium text-white shadow-lg"
          >
            <Icon className="h-4 w-4 shrink-0 text-accent" />
            {toast.text}
          </div>
        );
      })}
    </div>
  );
}
