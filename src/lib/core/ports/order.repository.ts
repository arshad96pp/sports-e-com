import type { Address } from "@/lib/types";

/**
 * Domain-owned enum — deliberately not re-exported from the Supabase-generated
 * `Database` type, so this port has zero dependency on a provider's schema
 * codegen. Values match `public.order_status` in the current Postgres schema.
 */
export type OrderStatus = "pending" | "confirmed" | "shipped" | "cancelled";

export interface OrderItemDTO {
  productId: string | null;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  addressFullName: string;
  addressLine1: string;
  addressCity: string;
  addressState: string;
  addressPincode: string;
  createdAt: string;
  items: OrderItemDTO[];
}

export interface AdminOrderListItemDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  customerName: string;
  createdAt: string;
}

export interface OrderLineInput {
  productId: string;
  quantity: number;
  size: string | null;
  color: string | null;
}

export interface PlaceOrderResult {
  orderNumber: string;
  total: number;
}

export interface OrderRepository {

  placeOrder(address: Address, lines: OrderLineInput[]): Promise<PlaceOrderResult>;

  listOrders(): Promise<AdminOrderListItemDTO[]>;
  getOrderById(id: string): Promise<(OrderDTO & { addressPhone: string }) | null>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
  hasPurchasedProduct(productId: string): Promise<boolean>;
}
