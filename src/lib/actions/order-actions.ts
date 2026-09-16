"use server";

import { addressSchema } from "@/lib/validations/auth";
import { buildOrderMessage, buildWhatsAppLink, type WhatsAppOrderLine } from "@/lib/utils/whatsapp";
import { getStoreSettings } from "@/lib/services/settings-service";
import { getCurrentUser, getCurrentCustomerId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import * as orderService from "@/lib/services/order-service";
import type { OrderDTO } from "@/lib/services/order-service";
import type { Address } from "@/lib/types";

export interface BuildWhatsAppOrderLinkResult {
  ok: boolean;
  error?: string;
  whatsappUrl?: string;
  orderNumber?: string;
}

/**
 * Places the order (via the `create_order` RPC — validates stock, recomputes
 * pricing server-side, writes `orders`/`order_items`, decrements stock) and
 * then builds the WhatsApp link the customer sends to the store owner. The
 * WhatsApp message is a notification of an order that now exists in the
 * database, not the order mechanism itself.
 */
export async function buildWhatsAppOrderLinkAction(
  lines: WhatsAppOrderLine[],
  address: Address
): Promise<BuildWhatsAppOrderLinkResult> {
  // Guests can check out (no account required), but a signed-in admin never
  // places a customer order — they manage orders from /admin/orders instead.
  const user = await getCurrentUser();
  if (user?.role === "super_admin") {
    return { ok: false, error: "Admin accounts can't place customer orders. Use Admin Order Management instead." };
  }

  const parsedAddress = addressSchema.safeParse(address);
  if (!parsedAddress.success) {
    return { ok: false, error: parsedAddress.error.issues[0]?.message ?? "Invalid delivery address" };
  }
  if (!lines.length) {
    return { ok: false, error: "Your order has no items." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_order", {
    p_address: {
      fullName: parsedAddress.data.fullName,
      phone: parsedAddress.data.phone,
      line1: parsedAddress.data.line1,
      city: parsedAddress.data.city,
      state: parsedAddress.data.state,
      pincode: parsedAddress.data.pincode,
    },
    p_address_id: null,
    p_lines: lines.map((l) => ({
      product_id: l.productId,
      quantity: l.quantity,
      size: l.size ?? null,
      color: l.color ?? null,
    })),
  });

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not place your order. Please try again." };
  }

  const order = data as { order_number: string; total: number };
  const message = buildOrderMessage({ total: order.total, address: parsedAddress.data, lines });
  const settings = await getStoreSettings();
  const whatsappUrl = buildWhatsAppLink(message, settings.whatsappNumber);

  return { ok: true, whatsappUrl, orderNumber: order.order_number };
}

/** Customer-only: an admin session never returns "their own orders" here. */
export async function getMyOrdersAction(): Promise<OrderDTO[]> {
  const userId = await getCurrentCustomerId();
  if (!userId) return [];
  return orderService.getMyOrders(userId);
}
