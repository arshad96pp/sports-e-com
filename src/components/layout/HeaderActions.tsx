"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import { useAuth } from "@/lib/context/AuthContext";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { MobileNavDrawer } from "@/components/layout/MobileNavDrawer";
import type { CategoryDTO } from "@/lib/services/category-service";

function CountBubble({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-ink">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function HeaderMenuButton({ categories }: { categories: CategoryDTO[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open menu"
        className="tap-target -ml-2 flex items-center justify-center lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <MobileNavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} categories={categories} />
    </>
  );
}

export function HeaderActions() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { count: cartCount } = useCart();
  const { productIds: wishlistIds } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="ml-2 hidden flex-1 items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2.5 text-left text-sm text-muted transition-colors hover:border-border-strong md:flex"
      >
        <Search className="h-4 w-4 shrink-0" />
        Search for footballs, cricket bats, rackets…
      </button>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          className="tap-target flex items-center justify-center md:hidden"
        >
          <Search className="h-5 w-5" />
        </button>

        <Link href="/wishlist" aria-label="Wishlist" className="tap-target relative flex items-center justify-center">
          <Heart className="h-5 w-5" />
          <CountBubble count={wishlistIds.length} />
        </Link>

        <Link
          href={isAuthenticated ? "/account" : "/login"}
          aria-label="Account"
          className="tap-target hidden items-center justify-center gap-2 rounded-full px-2 lg:flex"
        >
          <User className="h-5 w-5" />
        </Link>

        <Link href="/cart" aria-label="Cart" className="tap-target relative flex items-center justify-center">
          <ShoppingBag className="h-5 w-5" />
          <CountBubble count={cartCount} />
        </Link>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
