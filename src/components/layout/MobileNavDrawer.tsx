"use client";

import Link from "next/link";
import { LogIn, User } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { STORE } from "@/lib/config";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { CategoryDTO } from "@/lib/services/category-service";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  categories: CategoryDTO[];
}

export function MobileNavDrawer({ open, onClose, categories }: MobileNavDrawerProps) {
  const { isAuthenticated, user } = useAuth();

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="left" className="flex w-[82%] max-w-sm flex-col gap-0 p-0 lg:hidden">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="text-left font-display text-xl font-bold tracking-tight text-ink">
            {STORE.name}
          </SheetTitle>
        </SheetHeader>

        <Link
          href={isAuthenticated ? "/account" : "/login"}
          onClick={onClose}
          className="flex items-center gap-3 border-b border-border px-5 py-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
            {isAuthenticated ? <User className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              {isAuthenticated ? user?.fullName : "Login / Register"}
            </p>
            {!isAuthenticated && <p className="text-xs text-muted">Access your cart & wishlist</p>}
          </div>
        </Link>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <Link
            href="/"
            onClick={onClose}
            className="block rounded-lg px-3 py-3.5 text-base font-semibold text-ink hover:bg-surface"
          >
            Home
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              onClick={onClose}
              className="block rounded-lg px-3 py-3.5 text-base font-semibold text-ink hover:bg-surface"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/wishlist"
            onClick={onClose}
            className="block rounded-lg px-3 py-3.5 text-base font-semibold text-ink hover:bg-surface"
          >
            Wishlist
          </Link>
          <Link
            href="/cart"
            onClick={onClose}
            className="block rounded-lg px-3 py-3.5 text-base font-semibold text-ink hover:bg-surface"
          >
            Cart
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
