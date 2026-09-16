"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { setProductActiveAction } from "@/lib/actions/admin/product-actions";

export function ProductActiveToggle({ productId, isActive }: { productId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={isActive}
      disabled={isPending}
      onCheckedChange={(checked) =>
        startTransition(async () => {
          await setProductActiveAction(productId, checked);
        })
      }
      aria-label={isActive ? "Deactivate product" : "Activate product"}
    />
  );
}
