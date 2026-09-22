"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "cn";
import { Loader2, MapPin, Plus, X } from "lucide-react";
import { useToast } from "@/lib/context/ToastContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import { useProductsByIds } from "@/lib/hooks/useProductsByIds";
import { AccountGuard } from "@/components/account/AccountGuard";
import { AccountSidebar, type AccountTab } from "@/components/account/AccountSidebar";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StateSelect } from "@/components/common/StateSelect";
import { createAddressAction, deleteAddressAction, setDefaultAddressAction } from "@/lib/actions/address-actions";
import { updateProfileAction } from "@/lib/actions/profile-actions";
import type { AddressDTO } from "@/lib/services/address-service";
import type { Address, UserProfile } from "@/lib/types";

const EMPTY_ADDRESS: Address = { fullName: "", phone: "", line1: "", city: "", state: "", pincode: "" };

const CARD_CLASS = "rounded-[16px] border border-gray-100 bg-white p-6 shadow-sm sm:p-8";
const FIELD_LABEL_CLASS = "mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-700";
const UNDERLINE_FIELD_CLASS =
  "h-12 rounded-none border-0 border-b border-gray-200 bg-transparent px-0 text-sm font-medium text-ink focus-visible:border-ink focus-visible:ring-0 disabled:bg-transparent disabled:opacity-100";
const ACTION_BUTTON_CLASS = "rounded-[12px] px-8 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em]";

interface AccountPageClientProps {
  initialProfile: UserProfile | null;
  initialAddresses: AddressDTO[];
}

/** "John Doe Smith" -> { firstName: "John", lastName: "Doe Smith" } — the data
 * model only stores a single `fullName` (see UserProfile), so first/last are
 * a display-only split of it, rejoined back into one string on save. */
function splitName(fullName: string | undefined) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

function CardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-gray-100 pb-4">
      <h2 className="font-display text-lg font-bold uppercase tracking-widest text-ink">{title}</h2>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

function ProfileTab({
  profile,
  onProfileUpdate,
}: {
  profile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
}) {
  const { showToast } = useToast();
  const { firstName: initialFirstName, lastName: initialLastName } = splitName(profile?.fullName);
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setError(null);

    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const result = await updateProfileAction({ fullName, phone });

    if (result.ok && result.data) {
      onProfileUpdate(result.data);
      showToast("Profile updated", "success");
    } else {
      setError(result.error ?? "Could not update profile. Please try again.");
    }
    setIsSaving(false);
  }

  return (
    <div className={CARD_CLASS}>
      <CardHeader title="Personal Information" subtitle="Update your personal details and contact info." />

      <form onSubmit={handleSave} className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2" noValidate>
        <div>
          <label className={FIELD_LABEL_CLASS}>First Name</label>
          <Input
            required
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isSaving}
            className={UNDERLINE_FIELD_CLASS}
          />
        </div>
        <div>
          <label className={FIELD_LABEL_CLASS}>Last Name</label>
          <Input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isSaving}
            className={UNDERLINE_FIELD_CLASS}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={FIELD_LABEL_CLASS}>Email Address</label>
          <Input value={profile?.email ?? ""} disabled className={cn(UNDERLINE_FIELD_CLASS, "text-gray-400")} />
        </div>
        <div className="sm:col-span-2">
          <label className={FIELD_LABEL_CLASS}>Phone Number</label>
          <Input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isSaving}
            className={UNDERLINE_FIELD_CLASS}
          />
        </div>

        {error && (
          <p role="alert" className="text-xs font-medium text-signal sm:col-span-2">
            {error}
          </p>
        )}

        <div className="sm:col-span-2">
          <Button type="submit" disabled={isSaving} aria-busy={isSaving} className={ACTION_BUTTON_CLASS}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function AddressesTab({ initialAddresses }: { initialAddresses: AddressDTO[] }) {
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Address>(EMPTY_ADDRESS);
  const [addresses, setAddresses] = useState<AddressDTO[]>(initialAddresses);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setError(null);

    const result = await createAddressAction(draft);

    if (result.ok && result.data) {
      setAddresses((prev) => [...prev, result.data!]);
      setDraft(EMPTY_ADDRESS);
      setShowForm(false);
      showToast("Address added", "success");
    } else {
      setError(result.error ?? "Could not save address. Please try again.");
    }
    setIsSaving(false);
  }

  function handleRemoveAddress(addressId: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    void deleteAddressAction(addressId);
  }

  function handleSetDefault(addressId: string) {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === addressId })));
    void setDefaultAddressAction(addressId);
  }

  return (
    <div className={CARD_CLASS}>
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-widest text-ink">My Addresses</h2>
          <p className="mt-1 text-xs text-gray-500">Manage the addresses you ship and bill to.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="flex shrink-0 items-center gap-1.5 rounded-[10px] bg-ink px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-ink-soft"
        >
          <Plus className="h-3.5 w-3.5" />
          Add New
        </button>
      </div>

      {addresses.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MapPin className="mb-3 h-8 w-8 text-gray-300" strokeWidth={1.5} />
          <p className="text-sm text-gray-500">No saved addresses yet.</p>
        </div>
      )}

      {addresses.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                "relative rounded-[14px] p-4",
                addr.isDefault ? "border-2 border-ink" : "border border-gray-100"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {addr.isDefault && (
                    <span className="rounded-full bg-ink px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                      Default
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAddress(addr.id)}
                  aria-label="Remove address"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-signal hover:text-signal"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="mt-3 text-sm font-bold text-ink">{addr.fullName}</p>
              <p className="mt-1 text-xs text-gray-500">{addr.line1}</p>
              <p className="text-xs text-gray-500">
                {addr.city}, {addr.state}
              </p>
              <p className="mt-1 text-xs text-gray-500">{addr.phone}</p>

              {!addr.isDefault && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(addr.id)}
                  className="mt-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-ink"
                >
                  Set As Default
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleAddAddress}
          className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-100 pt-6 sm:grid-cols-2"
          noValidate
        >
          <div>
            <label className={FIELD_LABEL_CLASS}>Full Name</label>
            <Input
              required
              value={draft.fullName}
              onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
              disabled={isSaving}
              className={UNDERLINE_FIELD_CLASS}
            />
          </div>
          <div>
            <label className={FIELD_LABEL_CLASS}>Phone</label>
            <Input
              required
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              disabled={isSaving}
              className={UNDERLINE_FIELD_CLASS}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={FIELD_LABEL_CLASS}>Address</label>
            <Input
              required
              value={draft.line1}
              onChange={(e) => setDraft((d) => ({ ...d, line1: e.target.value }))}
              disabled={isSaving}
              className={UNDERLINE_FIELD_CLASS}
            />
          </div>
          <div>
            <label className={FIELD_LABEL_CLASS}>City</label>
            <Input
              required
              value={draft.city}
              onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
              disabled={isSaving}
              className={UNDERLINE_FIELD_CLASS}
            />
          </div>
          <div>
            <label className={FIELD_LABEL_CLASS}>State</label>
            <StateSelect
              value={draft.state}
              onChange={(v) => setDraft((d) => ({ ...d, state: v }))}
              disabled={isSaving}
              className="w-full rounded-none border-0 border-b border-gray-200 bg-transparent px-0 focus-visible:border-ink focus-visible:ring-0"
            />
          </div>
          <div>
            <label className={FIELD_LABEL_CLASS}>Pincode</label>
            <Input
              required
              value={draft.pincode}
              onChange={(e) => setDraft((d) => ({ ...d, pincode: e.target.value }))}
              disabled={isSaving}
              className={UNDERLINE_FIELD_CLASS}
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-signal sm:col-span-2">
              {error}
            </p>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" disabled={isSaving} aria-busy={isSaving} className={ACTION_BUTTON_CLASS}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Address"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function WishlistTab() {
  const { productIds, isInitialized } = useWishlist();
  const { products: productMap, loading: productsLoading } = useProductsByIds(productIds);
  const products = productIds.map((id) => productMap[id]).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const ready = isInitialized && !productsLoading;

  return (
    <div className={CARD_CLASS}>
      <CardHeader title="Wishlist" subtitle="Items you've saved for later." />

      <div className="mt-6">
        {!ready ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-3/4 animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-gray-500">Your wishlist is empty.</p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center justify-center rounded-[12px] bg-ink px-8 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-ink-soft"
            >
              Return To Shop
            </Link>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}

function AccountContent({ initialProfile, initialAddresses }: AccountPageClientProps) {
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);

  return (
    <div className="flex-1 bg-surface">
      <div className="container-app py-10 sm:py-16">
        <div className="mt-4 mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Welcome Back</p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            My Account
          </h1>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <AccountSidebar profile={profile} activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="min-w-0 flex-1">
            {activeTab === "profile" && <ProfileTab profile={profile} onProfileUpdate={setProfile} />}
            {activeTab === "addresses" && <AddressesTab initialAddresses={initialAddresses} />}
            {activeTab === "wishlist" && <WishlistTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccountPageClient({ initialProfile, initialAddresses }: AccountPageClientProps) {
  return (
    <AccountGuard>
      <AccountContent initialProfile={initialProfile} initialAddresses={initialAddresses} />
    </AccountGuard>
  );
}
