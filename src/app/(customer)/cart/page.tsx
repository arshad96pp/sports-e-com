import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/CartPageClient";
import { requireNotAdmin } from "@/lib/auth/admin-guard";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review the items in your cart before checking out via WhatsApp.",
  robots: { index: false, follow: true },
};

export default async function CartPage() {
  await requireNotAdmin();
  return <CartPageClient />;
}
