import type { Metadata } from "next";
import { WishlistPageClient } from "@/components/wishlist/WishlistPageClient";
import { requireNotAdmin } from "@/lib/auth/admin-guard";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved football, cricket, tennis and sports accessories.",
  robots: { index: false, follow: true },
};

export default async function WishlistPage() {
  await requireNotAdmin();
  return <WishlistPageClient />;
}
