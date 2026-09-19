"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { AccountGuard } from "@/components/account/AccountGuard";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StateSelect } from "@/components/common/StateSelect";
import { createAddressAction, deleteAddressAction, listMyAddressesAction } from "@/lib/actions/address-actions";
import type { AddressDTO } from "@/lib/services/address-service";
import type { Address } from "@/lib/types";

const EMPTY_ADDRESS: Address = { fullName: "", phone: "", line1: "", city: "", state: "", pincode: "" };

function AccountContent() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Address>(EMPTY_ADDRESS);
  const [addresses, setAddresses] = useState<AddressDTO[]>([]);

  useEffect(() => {
    let cancelled = false;
    listMyAddressesAction().then((addresses) => {
      if (cancelled) return;
      setAddresses(addresses);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    void createAddressAction(draft).then((result) => {
      if (result.ok && result.data) {
        setAddresses((prev) => [...prev, result.data!]);
      }
    });
    setDraft(EMPTY_ADDRESS);
    setShowForm(false);
  }

  function handleRemoveAddress(addressId: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    void deleteAddressAction(addressId);
  }

  return (
    <div className="container-app py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Account" }]} />
      <h1 className="mt-3 mb-6 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
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
                    onClick={() => handleRemoveAddress(addr.id)}
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
