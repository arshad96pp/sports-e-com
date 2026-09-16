import "server-only";
import { getOrderRepository } from "@/lib/config/providers";
import type { Address } from "@/lib/types";
import type { OrderDTO, OrderItemDTO, OrderLineInput, OrderStatus, PlaceOrderResult } from "@/lib/core/ports/order.repository";

export type { OrderDTO, OrderItemDTO, OrderStatus, OrderLineInput, PlaceOrderResult };

/**
 * Places the order (validates stock, recomputes pricing server-side, writes
 * orders/order_items, decrements stock — atomically, via the repository) and
 * returns the order number/total the caller needs to build a confirmation
 * message. Throws on failure; callers decide how to surface that.
 */
export async function placeOrder(address: Address, lines: OrderLineInput[]): Promise<PlaceOrderResult> {
  return getOrderRepository().placeOrder(address, lines);
}
