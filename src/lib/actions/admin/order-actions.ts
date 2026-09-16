"use server";

import { revalidatePath } from "next/cache";
import { getSuperAdminOrNull } from "@/lib/auth/admin-guard";
import * as adminOrderService from "@/lib/services/admin-order-service";
import type { OrderStatus } from "@/lib/services/order-service";
import type { ActionResult } from "@/lib/actions/admin/product-actions";

export async function updateOrderStatusAction(orderId: string, status: OrderStatus): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };

  try {
    await adminOrderService.updateOrderStatus(orderId, status);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not update order status." };
  }
}
