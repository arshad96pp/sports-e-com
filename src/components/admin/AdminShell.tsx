"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  Star,
  Tag,
  GalleryHorizontal,
  ClipboardList,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { getAuthClientPort } from "@/lib/config/providers.client";
import { STORE } from "@/lib/config";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/subcategories", label: "Subcategories", icon: FolderTree },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/contact-messages", label: "Messages", icon: Mail },
  { href: "/admin/offers", label: "Offers", icon: Tag },
  { href: "/admin/banners", label: "Banners", icon: GalleryHorizontal },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  adminName,
  children,
}: {
  adminName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const loggingOutRef = useRef(false);

  async function handleLogout() {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;
    await getAuthClientPort().signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const navLinks = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-white text-ink" : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
          <span className="font-display text-lg font-bold tracking-tight text-white">{STORE.name}</span>
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-ink">ADMIN</span>
        </div>
        {navLinks}
        <div className="border-t border-white/10 p-3">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
            <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            View Storefront
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-ink">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
              <span className="font-display text-lg font-bold tracking-tight text-white">{STORE.name} Admin</span>
              <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            {navLinks}
            <div className="border-t border-white/10 p-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-white px-4 sm:px-6">
          <Button
            variant="outline"
            size="icon-sm"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1" />
          <span className="truncate text-sm font-medium text-ink-soft">{adminName}</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
