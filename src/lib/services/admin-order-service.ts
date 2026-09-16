import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { OrderDTO, OrderStatus } from "@/lib/services/order-service";

export interface AdminOrderListItemDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  customerName: string;
  createdAt: string;
}

const LIST_SELECT = "id, order_number, status, total, created_at, address_full_name, order_items ( quantity )";

/** RLS-scoped: `orders_select_own_or_admin` lets a super admin read every row. */
export async function listOrders(): Promise<AdminOrderListItemDTO[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select(LIST_SELECT).order("created_at", { ascending: false });

  return (data ?? []).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    status: o.status,
    total: o.total,
    itemCount: o.order_items.reduce((sum, i) => sum + i.quantity, 0),
    customerName: o.address_full_name,
    createdAt: o.created_at,
  }));
}

const DETAIL_SELECT =
  "id, order_number, status, subtotal, discount, total, address_full_name, address_phone, address_line1, address_city, address_state, address_pincode, created_at, order_items ( product_id, product_name, product_sku, quantity, price, size, color )";

export async function getOrderById(id: string): Promise<(OrderDTO & { addressPhone: string }) | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select(DETAIL_SELECT).eq("id", id).maybeSingle();
  if (!data) return null;

  return {
    id: data.id,
    orderNumber: data.order_number,
    status: data.status,
    subtotal: data.subtotal,
    discount: data.discount,
    total: data.total,
    addressFullName: data.address_full_name,
    addressPhone: data.address_phone,
    addressLine1: data.address_line1,
    addressCity: data.address_city,
    addressState: data.address_state,
    addressPincode: data.address_pincode,
    createdAt: data.created_at,
    items: data.order_items.map((i) => ({
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

/** Goes through the `update_order_status` RPC (re-checks `is_super_admin()` itself) rather than a raw update. */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_order_status", { p_order_id: orderId, p_status: status });
  if (error) throw new Error(error.message);
}
