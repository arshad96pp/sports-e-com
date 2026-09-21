"use client";

import { createContext, useCallback, useContext, useState } from "react";

export type ToastKind = "cart" | "wishlist" | "success" | "info" | "error";

export interface ToastMessage {
  id: number;
  text: string;
  kind: ToastKind;
  leaving?: boolean;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  showToast: (text: string, kind?: ToastKind) => void;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const EXIT_ANIMATION_MS = 200;

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_ANIMATION_MS);
  }, []);

  const showToast = useCallback(
    (text: string, kind: ToastKind = "info") => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, text, kind }]);
      setTimeout(() => dismissToast(id), 2600);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
