import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type OrderStatus = Database["public"]["Enums"]["order_status"];

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

const ORDER_SELECT =
  "id, order_number, status, subtotal, discount, total, address_full_name, address_line1, address_city, address_state, address_pincode, created_at, order_items ( product_id, product_name, product_sku, quantity, price, size, color )";

function toDTO(row: {
  id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  address_full_name: string;
  address_line1: string;
  address_city: string;
  address_state: string;
  address_pincode: string;
  created_at: string;
  order_items: {
    product_id: string | null;
    product_name: string;
    product_sku: string;
    quantity: number;
    price: number;
    size: string | null;
    color: string | null;
  }[];
}): OrderDTO {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    subtotal: row.subtotal,
    discount: row.discount,
    total: row.total,
    addressFullName: row.address_full_name,
    addressLine1: row.address_line1,
    addressCity: row.address_city,
    addressState: row.address_state,
    addressPincode: row.address_pincode,
    createdAt: row.created_at,
    items: row.order_items.map((i) => ({
      productId: i.product_id,
      productName: i.product_name,
      productSku: i.product_sku,
      quantity: i.quantity,
      price: i.price,
      size: i.size,
      color: i.color,
    })),
  };
}

/** RLS-scoped: `orders_select_own_or_admin` restricts this to the caller's own rows. */
export async function getMyOrders(userId: string): Promise<OrderDTO[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as unknown as Parameters<typeof toDTO>[0][]).map(toDTO);
}
