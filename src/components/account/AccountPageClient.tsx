"use client";

import { useEffect, useState } from "react";
import { MapPin, Package, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { AccountGuard } from "@/components/account/AccountGuard";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StateSelect } from "@/components/common/StateSelect";
import { getMyOrdersAction } from "@/lib/actions/order-actions";
import type { OrderDTO } from "@/lib/services/order-service";
import { formatPrice } from "@/lib/utils/format";
import type { Address } from "@/lib/types";

const EMPTY_ADDRESS: Address = { fullName: "", phone: "", line1: "", city: "", state: "", pincode: "" };

const STATUS_STYLES: Record<OrderDTO["status"], string> = {
  placed: "bg-accent-soft text-ink",
  confirmed: "bg-surface-strong text-ink-soft",
  processing: "bg-surface-strong text-ink-soft",
  shipped: "bg-surface-strong text-ink-soft",
  delivered: "bg-success-soft text-success",
  cancelled: "bg-signal-soft text-signal",
};

function AccountContent() {
  const { user, addresses, addAddress, removeAddress } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Address>(EMPTY_ADDRESS);
  const [orders, setOrders] = useState<OrderDTO[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyOrdersAction().then((data) => {
      if (!cancelled) setOrders(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    addAddress(draft);
    setDraft(EMPTY_ADDRESS);
    setShowForm(false);
  }

  return (
    <div className="container-app py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Account" }]} />
      <h1 className="mt-3 mb-6 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        My Account
      </h1>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <AccountSidebar />

        <div className="min-w-0 flex-1 space-y-8">
          <section id="profile" className="rounded-xl border border-border p-5">
            <h2 className="font-display text-lg font-bold text-ink">Profile</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-muted">Full Name</p>
                <p className="mt-1 text-sm text-ink">{user?.fullName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted">Email</p>
                <p className="mt-1 text-sm text-ink">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted">Phone</p>
                <p className="mt-1 text-sm text-ink">{user?.phone}</p>
              </div>
            </div>
          </section>

          <section id="orders" className="rounded-xl border border-border p-5">
            <h2 className="font-display text-lg font-bold text-ink">My Orders</h2>

            {orders === null && <p className="mt-4 text-sm text-muted">Loading your orders…</p>}
            {orders !== null && orders.length === 0 && (
              <p className="mt-4 text-sm text-muted">You haven&apos;t placed any orders yet.</p>
            )}

            <div className="mt-4 flex flex-col gap-3">
              {orders?.map((order) => (
                <div key={order.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Package className="h-4 w-4 text-muted" />
                      <span className="text-sm font-semibold text-ink">{order.orderNumber}</span>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </p>
                  <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-ink-soft">
                        <span className="truncate">
                          {item.productName}
                          {item.size ? ` · ${item.size}` : ""} × {item.quantity}
                        </span>
                        <span className="shrink-0 font-medium text-ink">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-bold text-ink">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="addresses" className="rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Saved Addresses</h2>
              <button
                type="button"
                onClick={() => setShowForm((s) => !s)}
                className="flex items-center gap-1 text-sm font-semibold text-ink"
              >
                <Plus className="h-4 w-4" />
                Add New
              </button>
            </div>

            {addresses.length === 0 && !showForm && (
              <p className="mt-4 text-sm text-muted">No saved addresses yet.</p>
            )}

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {addresses.map((addr) => (
                <div key={addr.id} className="relative rounded-lg border border-border p-4">
                  <MapPin className="mb-2 h-4 w-4 text-muted" />
                  <p className="text-sm font-semibold text-ink">{addr.fullName}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="mt-1 text-xs text-muted">{addr.phone}</p>
                  <button
                    type="button"
                    onClick={() => removeAddress(addr.id)}
                    aria-label="Remove address"
                    className="absolute right-3 top-3 text-muted hover:text-signal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {showForm && (
              <form onSubmit={handleAddAddress} className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
                <Input
                  required
                  placeholder="Full Name"
                  value={draft.fullName}
                  onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
                  className="col-span-2 h-11 sm:col-span-1"
                />
                <Input
                  required
                  placeholder="Phone"
                  value={draft.phone}
                  onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                  className="col-span-2 h-11 sm:col-span-1"
                />
                <Input
                  required
                  placeholder="Address"
                  value={draft.line1}
                  onChange={(e) => setDraft((d) => ({ ...d, line1: e.target.value }))}
                  className="col-span-2 h-11"
                />
                <Input
                  required
                  placeholder="City"
                  value={draft.city}
                  onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                  className="h-11"
                />
                <StateSelect value={draft.state} onChange={(v) => setDraft((d) => ({ ...d, state: v }))} />
                <Input
                  required
                  placeholder="Pincode"
                  value={draft.pincode}
                  onChange={(e) => setDraft((d) => ({ ...d, pincode: e.target.value }))}
                  className="col-span-2 h-11 sm:col-span-1"
                />
                <Button type="submit" className="col-span-2 h-11 rounded-full text-sm font-semibold sm:col-span-1">
                  Save Address
                </Button>
              </form>
            )}
          </section>

          <section id="settings" className="rounded-xl border border-border p-5">
            <h2 className="font-display text-lg font-bold text-ink">Account Settings</h2>
            <p className="mt-2 text-sm text-muted">
              Contact support to change your registered email or phone number.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export function AccountPageClient() {
  return (
    <AccountGuard>
      <AccountContent />
    </AccountGuard>
  );
}
