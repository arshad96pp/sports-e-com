"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useBuyNow } from "@/lib/context/BuyNowContext";
import { useAuth } from "@/lib/context/AuthContext";
import { useCart } from "@/lib/context/CartContext";
import { useToast } from "@/lib/context/ToastContext";
import { buildWhatsAppOrderLinkAction } from "@/lib/actions/order-actions";
import { createAddressAction, listMyAddressesAction } from "@/lib/actions/address-actions";
import type { AddressDTO } from "@/lib/services/address-service";
import { formatPrice } from "@/lib/utils/format";
import { WhatsAppIcon } from "@/components/icons/SportIcons";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { StateSelect } from "@/components/common/StateSelect";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import type { Address } from "@/lib/types";

const FIELD_INPUT_CLASS =
  "h-11 rounded-xl border-border bg-white px-3.5 text-sm text-ink placeholder:text-muted-soft focus-visible:border-ink focus-visible:ring-0";

const EMPTY_ADDRESS: Address = { fullName: "", phone: "", line1: "", city: "", state: "", pincode: "" };

export function BuyNowModal() {
  const { request, openBuyNow, closeBuyNow, pendingResume, setPendingResume } = useBuyNow();
  const { user, isAuthenticated, hydrated } = useAuth();
  const { clear: clearCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isMobile = useIsMobile();

  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [saveAddress, setSaveAddress] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Address, boolean>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const addressCacheRef = useRef<AddressDTO[] | null>(null);
  const resumeAddressRef = useRef<Address | null>(null);

  useEffect(() => {
    if (!request) return;
  
    setAddress({ ...EMPTY_ADDRESS, fullName: user?.fullName ?? "", phone: user?.phone ?? "" });
    setErrors({});
    setSubmitError(null);
    setSaveAddress(false);

    if (resumeAddressRef.current) {
      setAddress(resumeAddressRef.current);
      resumeAddressRef.current = null;
      return;
    }

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

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !pendingResume || request) return;
    resumeAddressRef.current = pendingResume.address;
    openBuyNow(pendingResume.lines, { clearCartAfter: pendingResume.clearCartAfter, requireAuth: true });
    setPendingResume(null);
  }, [hydrated, isAuthenticated, pendingResume, request, openBuyNow, setPendingResume]);

  const lines = request?.lines ?? [];
  const clearCartAfter = request?.clearCartAfter ?? false;
  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0);

  function field(key: keyof Address, label: string, placeholder: string, type = "text") {
    return (
      <div>
        <Label
          htmlFor={`buynow-${key}`}
          className="mb-1.5 text-[10.5px] font-semibold tracking-[0.08em] text-muted uppercase"
        >
          {label}
        </Label>
        <Input
          id={`buynow-${key}`}
          type={type}
          value={address[key]}
          onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
          placeholder={placeholder}
          aria-invalid={errors[key] ? true : undefined}
          className={FIELD_INPUT_CLASS}
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

    if (request?.requireAuth && hydrated && !isAuthenticated) {
      setPendingResume({ lines, address, clearCartAfter });
      closeBuyNow();
      router.push(`/login?callbackUrl=${encodeURIComponent("/cart")}`);
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
      if (clearCartAfter) void clearCart();

      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      showToast(
        `Order ${result.orderNumber} request created. Please send the message on WhatsApp to complete your order.`,
        "success"
      );
      closeBuyNow();
    });
  }

  const continueLabel = isPending
    ? "Preparing…"
    : request?.requireAuth && hydrated && !isAuthenticated
      ? "Login to Continue"
      : "Continue to WhatsApp";

  const body = (
    <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border-strong [&::-webkit-scrollbar-track]:bg-transparent">
      <div
        className={
          lines.length > 3
            ? "scrollbar-thin max-h-44 space-y-3 overflow-y-auto pr-1"
            : "space-y-3"
        }
      >
        {lines.map((line, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-surface">
              {line.imageUrl && (
                <Image src={line.imageUrl} alt={line.name} fill sizes="48px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{line.name}</p>
              <p className="mt-0.5 text-xs text-muted">
                Qty: {line.quantity}
                {line.size ? ` · Size: ${line.size}` : ""}
              </p>
            </div>
            <span className="shrink-0 text-sm font-medium text-ink">
              {formatPrice(line.price * line.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-sm font-semibold text-ink">
          Total <span className="font-normal text-muted">({totalQuantity} {totalQuantity === 1 ? "item" : "items"})</span>
        </span>
        <span className="text-lg font-semibold text-ink">{formatPrice(total)}</span>
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <h3 className="mb-4 text-[10.5px] font-semibold tracking-[0.12em] text-muted uppercase">
          Delivery Details
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field("fullName", "Full Name", "Your name")}
          {field("phone", "Phone Number", "+91 98765 43210", "tel")}
          <div className="sm:col-span-2">{field("line1", "Address", "House no., street, area")}</div>
          {field("city", "City", "City")}
          <div>
            <Label
              htmlFor="buynow-state"
              className="mb-1.5 text-[10.5px] font-semibold tracking-[0.08em] text-muted uppercase"
            >
              State
            </Label>
            <StateSelect
              id="buynow-state"
              value={address.state}
              onChange={(v) => setAddress((a) => ({ ...a, state: v }))}
              className={FIELD_INPUT_CLASS}
            />
          </div>
          <div className="sm:col-span-2">{field("pincode", "Pincode", "560001")}</div>
        </div>
        <label className="mt-4 flex items-center gap-2.5 text-xs text-muted">
          <Checkbox
            checked={saveAddress}
            onCheckedChange={(c) => setSaveAddress(c === true)}
            className="size-4 rounded-[5px] border-border-strong"
          />
          Save this address for next time
        </label>
      </div>

      {submitError && (
        <p className="mt-4 rounded-xl bg-signal-soft px-3.5 py-2.5 text-xs font-medium text-signal">
          {submitError}
        </p>
      )}

      <div className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-xs leading-relaxed text-muted">
        <WhatsAppIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
        <p>
          This sends an order request to the store owner via WhatsApp. It does not place or confirm your
          order.
        </p>
      </div>
    </div>
  );

  const footerButtons = (
    <>
      <Button
        variant="outline"
        onClick={closeBuyNow}
        disabled={isPending}
        className="h-12 flex-1 rounded-full border-border text-sm font-semibold text-ink hover:bg-surface"
      >
        Back to Cart
      </Button>
      <Button
        onClick={handleConfirm}
        disabled={isPending}
        className="h-12 flex-[1.4] gap-2 rounded-full bg-ink text-sm font-semibold text-white hover:bg-ink-soft"
      >
        <WhatsAppIcon className="h-4 w-4 text-success" />
        {continueLabel}
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={!!request} onOpenChange={(next) => !next && closeBuyNow()}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex max-h-[90vh] flex-col gap-0 rounded-t-3xl border-t border-border bg-white p-0 shadow-[0_-20px_60px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-4.5">
            <SheetTitle className="font-display text-lg font-semibold tracking-tight text-ink">
              Order Summary
            </SheetTitle>
            <SheetClose asChild>
              <button
                type="button"
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </SheetClose>
          </div>

          {body}

          <SheetFooter className="flex-row gap-3 border-t border-border bg-white p-4">
            {footerButtons}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={!!request} onOpenChange={(next) => !next && closeBuyNow()}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden rounded-3xl border border-border bg-white p-0 shadow-[0_20px_60px_rgba(0,0,0,0.12)] ring-0 sm:max-w-lg"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <DialogTitle className="font-display text-lg font-semibold tracking-tight text-ink">
            Order Summary
          </DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </DialogClose>
        </div>

        {body}

        <DialogFooter className="flex-row gap-3 border-t border-border bg-white p-5 sm:justify-stretch">
          {footerButtons}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
