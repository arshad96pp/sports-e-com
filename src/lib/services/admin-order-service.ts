import "server-only";
import { getOrderRepository } from "@/lib/config/providers";
import type { OrderDTO, OrderStatus } from "@/lib/services/order-service";
import type { AdminOrderListItemDTO, AdminOrderQueryParams, AdminOrderQueryResult } from "@/lib/core/ports/order.repository";

export type { AdminOrderListItemDTO, AdminOrderQueryParams, AdminOrderQueryResult };

/** RLS-scoped: `orders_select_own_or_admin` lets a super admin read every row. */
export async function listOrders(params?: AdminOrderQueryParams): Promise<AdminOrderQueryResult> {
  return getOrderRepository().listOrders(params);
}

export async function getOrderById(id: string): Promise<(OrderDTO & { addressPhone: string }) | null> {
  return getOrderRepository().getOrderById(id);
}

/** Goes through the `update_order_status` RPC (re-checks `is_super_admin()` itself) rather than a raw update. */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  return getOrderRepository().updateOrderStatus(orderId, status);
}
