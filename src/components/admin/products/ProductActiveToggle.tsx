"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { setProductActiveAction } from "@/lib/actions/admin/product-actions";
import { useToast } from "@/lib/context/ToastContext";

export function ProductActiveToggle({ productId, isActive }: { productId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  return (
    <Switch
      checked={isActive}
      disabled={isPending}
      onCheckedChange={(checked) =>
        startTransition(async () => {
          const result = await setProductActiveAction(productId, checked);
          if (!result.ok) {
            showToast(result.error ?? "Failed to update product", "error");
            return;
          }
          showToast(checked ? "Product activated" : "Product deactivated", "success");
        })
      }
      aria-label={isActive ? "Deactivate product" : "Activate product"}
    />
  );
}
