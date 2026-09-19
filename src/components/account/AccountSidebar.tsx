"use client";

import { useRouter } from "next/navigation";
import { Heart, LogOut, MapPin, User } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import type { UserProfile } from "@/lib/types";

export type AccountTab = "profile" | "addresses" | "wishlist";

const TABS: { key: AccountTab; label: string; icon: typeof User }[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "wishlist", label: "Wishlist", icon: Heart },
];

interface AccountSidebarProps {
  /** `profile` comes from the account page's server-side fetch, not `useAuth()` —
   * it's available on first paint, whereas the client auth context's copy only
   * resolves after hydration (it's driven off the global session listener,
   * shared with Header/etc.). Using it here avoids the sidebar's name/email
   * flashing in a beat after the rest of the page has already rendered. */
  profile: UserProfile | null;
  activeTab: AccountTab;
  onTabChange: (tab: AccountTab) => void;
}

export function AccountSidebar({ profile, activeTab, onTabChange }: AccountSidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <aside className="w-full shrink-0 lg:w-64">
      <div className="rounded-[16px] bg-ink p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-base font-bold text-white">
            {profile?.fullName?.[0]?.toUpperCase() ?? "U"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{profile?.fullName || "My Account"}</p>
            <p className="truncate text-[10px] text-white/50">{profile?.email}</p>
          </div>
        </div>
      </div>

      <nav className="mt-4 overflow-hidden rounded-[16px] border border-gray-100 bg-white">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              aria-current={active ? "page" : undefined}
              className={`flex w-full items-center gap-4 border-b border-gray-100 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] transition-all ${
                active ? "bg-black text-white shadow-md" : "text-gray-500 hover:bg-surface"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? "bg-white/10" : "bg-surface"}`}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
              </span>
              <span className="flex-1">{tab.label}</span>
              {active && <span className="h-2 w-2 shrink-0 rounded-full bg-white" />}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="flex w-full items-center gap-4 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-signal transition-colors hover:bg-signal-soft"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-signal-soft">
            <LogOut className="h-4 w-4 shrink-0" />
          </span>
          Sign Out
        </button>
      </nav>
    </aside>
  );
}
