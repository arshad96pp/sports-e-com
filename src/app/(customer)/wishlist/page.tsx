import type { Metadata } from "next";
import { WishlistPageClient } from "@/components/wishlist/WishlistPageClient";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved football, cricket, tennis and sports accessories.",
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
