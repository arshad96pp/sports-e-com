"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { setCustomerActiveAction } from "@/lib/actions/admin/customer-actions";

export function CustomerActiveToggle({ userId, isActive }: { userId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={isActive}
      disabled={isPending}
      onCheckedChange={(checked) =>
        startTransition(async () => {
          await setCustomerActiveAction(userId, checked);
        })
      }
      aria-label={isActive ? "Deactivate customer" : "Activate customer"}
    />
  );
}
