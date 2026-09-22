import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Address } from "@/lib/types";
import type {
  AdminOrderQueryParams,
  AdminOrderQueryResult,
  OrderDTO,
  OrderLineInput,
  OrderRepository,
  OrderStatus,
  PlaceOrderResult,
} from "@/lib/core/ports/order.repository";

const DETAIL_SELECT =
  "id, order_number, status, subtotal, discount, total, address_full_name, address_phone, address_line1, address_city, address_state, address_pincode, created_at, order_items ( product_id, variant_id, product_name, product_sku, quantity, price, size, color )";

const LIST_SELECT = "id, order_number, status, total, created_at, address_full_name, order_items ( quantity )";

export function createSupabaseOrderRepository(): OrderRepository {
  return {
    /**
     * Validates stock, recomputes pricing server-side, writes orders/order_items
     * and decrements stock — all inside the `create_order` RPC (Postgres function),
     * so it's atomic regardless of how many items are in the order.
     */
    async placeOrder(address: Address, lines: OrderLineInput[]): Promise<PlaceOrderResult> {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("create_order", {
        p_address: {
          fullName: address.fullName,
          phone: address.phone,
          line1: address.line1,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
        // create_order's `p_address_id uuid` param has no NOT NULL constraint
        // (Postgres args can't have one) and PostgREST accepts a JSON null
        // for it fine — `supabase gen types` just doesn't reflect that in
        // its Args type, unlike the version last used to generate this file.
        p_address_id: null as unknown as string,
        p_lines: lines.map((l) => ({
          product_id: l.productId,
          variant_id: l.variantId ?? null,
          quantity: l.quantity,
          size: l.size ?? null,
          color: l.color ?? null,
        })),
      });

      if (error || !data) {
        throw new Error(error?.message ?? "Could not place your order. Please try again.");
      }

      const order = data as {
        order_number: string;
        total: number;
        items?: {
          product_id: string;
          variant_id?: string | null;
          product_name: string;
          product_sku: string;
          quantity: number;
          price: number;
          size?: string | null;
          color?: string | null;
        }[];
      };

      return {
        orderNumber: order.order_number,
        total: Number(order.total),
        items: (order.items ?? []).map((item) => ({
          productId: item.product_id,
          variantId: item.variant_id || null,
          productName: item.product_name,
          productSku: item.product_sku,
          quantity: item.quantity,
          price: Number(item.price),
          size: item.size || null,
          color: item.color || null,
        })),
      };
    },

    /** RLS-scoped: `orders_select_own_or_admin` lets a super admin read every row. */
    async listOrders(params: AdminOrderQueryParams = {}): Promise<AdminOrderQueryResult> {
      const supabase = await createClient();
      const page = Math.max(1, params.page ?? 1);
      const pageSize = params.pageSize ?? 20;

      let query = supabase.from("orders").select(LIST_SELECT, { count: "exact" });

      if (params.search?.trim()) {
        const like = `%${params.search.trim()}%`;
        query = query.or(`order_number.ilike.${like},address_full_name.ilike.${like}`);
      }
      if (params.status) query = query.eq("status", params.status);

      switch (params.sort) {
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "total-high-low":
          query = query.order("total", { ascending: false });
          break;
        case "total-low-high":
          query = query.order("total", { ascending: true });
          break;
        case "newest":
        default:
          query = query.order("created_at", { ascending: false });
      }

      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, count } = await query;

      const orders = (data ?? []).map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        status: o.status,
        total: o.total,
        itemCount: o.order_items.reduce((sum, i) => sum + i.quantity, 0),
        customerName: o.address_full_name,
        createdAt: o.created_at,
      }));

      return {
        orders,
        total: count ?? orders.length,
        page,
        pageSize,
        pageCount: Math.max(1, Math.ceil((count ?? orders.length) / pageSize)),
      };
    },

    async getOrderById(id: string): Promise<(OrderDTO & { addressPhone: string }) | null> {
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
          variantId: i.variant_id,
          productName: i.product_name,
          productSku: i.product_sku,
          quantity: i.quantity,
          price: i.price,
          size: i.size,
          color: i.color,
        })),
      };
    },

    /** Goes through the `update_order_status` RPC (re-checks `is_super_admin()` itself) rather than a raw update. */
    async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
      const supabase = await createClient();
      const { error } = await supabase.rpc("update_order_status", { p_order_id: orderId, p_status: status });
      if (error) throw new Error(error.message);
    },

    async hasPurchasedProduct(productId: string): Promise<boolean> {
      const supabase = await createClient();
      const { data } = await supabase.from("order_items").select("id").eq("product_id", productId).limit(1);
      return (data ?? []).length > 0;
    },
  };
}
