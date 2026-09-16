"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useBuyNow } from "@/lib/context/BuyNowContext";
import { useAuth } from "@/lib/context/AuthContext";
import { useCart } from "@/lib/context/CartContext";
import { useToast } from "@/lib/context/ToastContext";
import { buildWhatsAppOrderLinkAction } from "@/lib/actions/order-actions";
import { createAddressAction, listMyAddressesAction } from "@/lib/actions/address-actions";
import type { AddressDTO } from "@/lib/services/address-service";
import { formatPrice } from "@/lib/utils/format";
import { WhatsAppIcon } from "@/components/icons/SportIcons";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { StateSelect } from "@/components/common/StateSelect";
import type { Address } from "@/lib/types";

const EMPTY_ADDRESS: Address = { fullName: "", phone: "", line1: "", city: "", state: "", pincode: "" };

export function BuyNowModal() {
  const { request, closeBuyNow } = useBuyNow();
  const { user } = useAuth();
  const { clear: clearCart } = useCart();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [saveAddress, setSaveAddress] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Address, boolean>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Saved addresses rarely change mid-session — cache across modal opens
  // (Buy Now can be triggered repeatedly from a PDP or the cart) instead of
  // refetching every time the dialog opens. Cleared back to null whenever a
  // save fails, so the next open falls back to a fresh fetch.
  const addressCacheRef = useRef<AddressDTO[] | null>(null);

  useEffect(() => {
    if (!request) return;
    // Reset the form each time a new buy-now request opens, then prefill
    // from the account's saved address once it's fetched.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAddress({ ...EMPTY_ADDRESS, fullName: user?.fullName ?? "", phone: user?.phone ?? "" });
    setErrors({});
    setSubmitError(null);
    setSaveAddress(false);

    if (addressCacheRef.current) {
      const preset = addressCacheRef.current[0];
      if (preset) setAddress(preset);
      return;
    }

    let cancelled = false;
    listMyAddressesAction().then((addresses) => {
      if (cancelled) return;
      addressCacheRef.current = addresses;
      const preset = addresses[0];
      if (preset) setAddress(preset);
    });
    return () => {
      cancelled = true;
    };
  }, [request, user]);

  const lines = request?.lines ?? [];
  const clearCartAfter = request?.clearCartAfter ?? false;
  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0);

  function field(key: keyof Address, label: string, placeholder: string, type = "text") {
    return (
      <div>
        <Label htmlFor={`buynow-${key}`} className="mb-1.5 text-xs font-semibold text-ink-soft">
          {label}
        </Label>
        <Input
          id={`buynow-${key}`}
          type={type}
          value={address[key]}
          onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
          placeholder={placeholder}
          aria-invalid={errors[key] ? true : undefined}
          className="h-10"
        />
      </div>
    );
  }

  function handleConfirm() {
    const requiredFields: (keyof Address)[] = ["fullName", "phone", "line1", "city", "state", "pincode"];
    const nextErrors: Partial<Record<keyof Address, boolean>> = {};
    requiredFields.forEach((f) => {
      if (!address[f].trim()) nextErrors[f] = true;
    });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setSubmitError(null);

    startTransition(async () => {
      const result = await buildWhatsAppOrderLinkAction(lines, address);

      if (!result.ok || !result.whatsappUrl) {
        setSubmitError(result.error ?? "Could not prepare your order. Please try again.");
        return;
      }

      if (saveAddress) {
        void createAddressAction(address).then((res) => {
          if (res.ok && res.data && addressCacheRef.current) {
            addressCacheRef.current = [...addressCacheRef.current, res.data];
          } else if (!res.ok) {
            addressCacheRef.current = null;
          }
        });
      }
      // Fire-and-forget: clearing the cart doesn't affect the WhatsApp
      // message that's about to open, so don't make the user wait on it.
      if (clearCartAfter) void clearCart();

      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      showToast("Your order details are ready in WhatsApp. Please send the message to the store to complete your request.", "success");
      closeBuyNow();
    });
  }

  return (
    <Dialog open={!!request} onOpenChange={(next) => !next && closeBuyNow()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="font-display text-lg font-bold text-ink">Order Summary</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="flex flex-col gap-2">
              {lines.map((line, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  {line.imageUrl && (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
                      <Image src={line.imageUrl} alt={line.name} fill sizes="48px" className="object-cover" />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{line.name}</p>
                      <p className="text-xs text-muted">
                        Qty: {line.quantity}
                        {line.size ? ` · Size: ${line.size}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold text-ink">{formatPrice(line.price * line.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-bold text-ink">
              <span>Total ({totalQuantity} {totalQuantity === 1 ? "item" : "items"})</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="mt-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Delivery Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">{field("fullName", "Full Name", "Your name")}</div>
              <div className="col-span-2">{field("phone", "Phone Number", "+91 98765 43210", "tel")}</div>
              <div className="col-span-2">{field("line1", "Address", "House no., street, area")}</div>
              {field("city", "City", "City")}
              <div>
                <Label htmlFor="buynow-state" className="mb-1.5 text-xs font-semibold text-ink-soft">
                  State
                </Label>
                <StateSelect id="buynow-state" value={address.state} onChange={(v) => setAddress((a) => ({ ...a, state: v }))} />
              </div>
              <div className="col-span-2">{field("pincode", "Pincode", "560001")}</div>
            </div>
            <label className="mt-3 flex items-center gap-2 text-xs text-muted">
              <Checkbox checked={saveAddress} onCheckedChange={(c) => setSaveAddress(c === true)} />
              Save this address for next time
            </label>
          </div>

          {submitError && (
            <p className="mt-4 rounded-lg bg-signal-soft px-3 py-2.5 text-xs font-medium text-signal">
              {submitError}
            </p>
          )}

          <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2.5 text-xs leading-relaxed text-ink-soft">
            This sends an order request to the store owner via WhatsApp — it does not place or confirm your
            order. Tap <strong>Continue to WhatsApp</strong> to send your details.
          </p>
        </div>

        <DialogFooter className="flex-row gap-3 border-t border-border p-4 sm:justify-stretch">
          <Button variant="outline" onClick={closeBuyNow} disabled={isPending} className="h-11 flex-1 rounded-full text-sm font-semibold">
            Back to Cart
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            className="h-11 flex-2 gap-2 rounded-full bg-success text-sm font-semibold text-white hover:bg-success/90"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {isPending ? "Preparing…" : "Continue to WhatsApp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
