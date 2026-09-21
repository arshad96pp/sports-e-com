"use client";

import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateOrderStatusAction } from "@/lib/actions/admin/order-actions";
import { useToast } from "@/lib/context/ToastContext";
import type { OrderStatus } from "@/lib/services/order-service";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "cancelled"];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  cancelled: "Cancelled",
};

/** Keeps pending/confirmed/cancelled visually distinct using the existing brand color tokens. */
const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "border-accent bg-accent-soft text-ink",
  confirmed: "border-success/30 bg-success-soft text-success",
  shipped: "border-border bg-surface text-ink-soft",
  cancelled: "border-signal/30 bg-signal-soft text-signal",
};

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleChange(next: string) {
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, next as OrderStatus);
      if (!result.ok) {
        showToast(result.error ?? "Failed to update order status", "error");
        return;
      }
      showToast(`Order status updated to ${STATUS_LABELS[next as OrderStatus]}`, "success");
    });
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className={`h-9 w-44 font-medium ${STATUS_STYLES[status]}`}>
        <SelectValue>{STATUS_LABELS[status]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
