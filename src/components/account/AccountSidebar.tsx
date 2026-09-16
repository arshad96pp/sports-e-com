"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LogOut, MapPin, Settings, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

const LINKS = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account#addresses", label: "Saved Addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/account#settings", label: "Account Settings", icon: Settings },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <aside className="w-full shrink-0 lg:w-64">
      <div className="rounded-xl border border-border p-4">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
            {user?.fullName?.[0]?.toUpperCase() ?? "U"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{user?.fullName}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
        </div>
        <nav className="mt-3 flex flex-col gap-0.5">
          {LINKS.map((link) => {
            const active = pathname === link.href.split("#")[0] && !link.href.includes("#");
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-ink text-white" : "text-ink-soft hover:bg-surface"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-signal transition-colors hover:bg-signal-soft"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </div>
    </aside>
  );
}
