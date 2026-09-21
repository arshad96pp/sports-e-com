"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { setCustomerActiveAction } from "@/lib/actions/admin/customer-actions";
import { useToast } from "@/lib/context/ToastContext";

export function CustomerActiveToggle({ userId, isActive }: { userId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  return (
    <Switch
      checked={isActive}
      disabled={isPending}
      onCheckedChange={(checked) =>
        startTransition(async () => {
          const result = await setCustomerActiveAction(userId, checked);
          if (!result.ok) {
            showToast(result.error ?? "Failed to update customer", "error");
            return;
          }
          showToast(checked ? "Customer activated" : "Customer deactivated", "success");
        })
      }
      aria-label={isActive ? "Deactivate customer" : "Activate customer"}
    />
  );
}
