import "server-only";
import { getOrderRepository } from "@/lib/config/providers";
import type { Address } from "@/lib/types";
import type { OrderDTO, OrderItemDTO, OrderLineInput, OrderStatus, PlaceOrderResult } from "@/lib/core/ports/order.repository";

export type { OrderDTO, OrderItemDTO, OrderStatus, OrderLineInput, PlaceOrderResult };


export async function placeOrder(address: Address, lines: OrderLineInput[]): Promise<PlaceOrderResult> {
  return getOrderRepository().placeOrder(address, lines);
}

/** Whether the signed-in caller has purchased this product — gates "verified purchase" reviews. */
export async function hasPurchasedProduct(productId: string): Promise<boolean> {
  return getOrderRepository().hasPurchasedProduct(productId);
}
