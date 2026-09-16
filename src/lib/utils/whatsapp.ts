import { STORE_WHATSAPP_NUMBER } from "@/lib/config";
import { formatPrice } from "@/lib/utils/format";
import type { Address } from "@/lib/types";

export interface WhatsAppOrderLine {
  name: string;
  /** Real database product id — used to look up the product's image, never shown to the customer. */
  productId: string;
  /** Human-readable product code (e.g. "FB-101") — what actually prints as "Product ID" in the message. */
  sku: string;
  quantity: number;
  price: number;
  size?: string | null;
  color?: string | null;
  imageUrl?: string | null;
}

export interface WhatsAppOrderPayload {
  lines: WhatsAppOrderLine[];
  total: number;
  address: Address;
}

/**
 * Builds the order-request message sent to the store owner over WhatsApp.
 * This is an inquiry only — nothing is persisted, so there is no order id.
 */
export function buildOrderMessage({ lines, total, address }: WhatsAppOrderPayload): string {
  const itemsBlock = lines
    .map((line) => {
      const variant = [line.size, line.color].filter(Boolean).join(", ");
      return [
        `Product: ${line.name}`,
        `Product ID: ${line.sku}`,
        `Quantity: ${line.quantity}`,
        `Variant/Size: ${variant || "-"}`,
        `Price: ${formatPrice(line.price)}`,
        `Total: ${formatPrice(line.price * line.quantity)}`,
      ].join("\n");
    })
    .join("\n\n");

  return [
    "Hello, I would like to place an order.",
    "",
    itemsBlock,
    "",
    `Total: ${formatPrice(total)}`,
    "",
    `Customer Name: ${address.fullName}`,
    `Phone: ${address.phone}`,
    `Delivery Address: ${address.line1}, ${address.city}, ${address.state} - ${address.pincode}`,
    "",
    "Please confirm availability and order details.",
  ].join("\n");
}

export function buildWhatsAppLink(message: string, phoneNumber: string = STORE_WHATSAPP_NUMBER): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
