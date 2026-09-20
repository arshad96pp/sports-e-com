"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "cn";
import { DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const MODAL_SIZES = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
} as const;

type AdminModalSize = keyof typeof MODAL_SIZES;

/** Shared visual shell for Admin Panel dialogs: consistent radius, shadow, and pinned header/footer chrome. */
function AdminModalContent({
  className,
  size = "lg",
  children,
  ...props
}: React.ComponentProps<typeof DialogContent> & { size?: AdminModalSize }) {
  return (
    <DialogContent
      showCloseButton={false}
      className={cn(
        "flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden rounded-2xl border border-border bg-white p-0 text-ink shadow-[0_20px_60px_rgba(10,10,10,0.10)] ring-0",
        MODAL_SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </DialogContent>
  );
}

function AdminModalHeader({
  title,
  description,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5", className)}>
      <div className="flex flex-col gap-1">
        <DialogTitle className="font-display text-lg font-semibold tracking-tight text-ink">{title}</DialogTitle>
        {description && <DialogDescription className="text-sm text-muted">{description}</DialogDescription>}
      </div>
      <DialogClose className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink">
        <X className="h-4 w-4" strokeWidth={1.75} />
        <span className="sr-only">Close</span>
      </DialogClose>
    </div>
  );
}

function AdminModalBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex-1 overflow-y-auto px-6 py-5", className)} {...props} />;
}

function AdminModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-white px-6 py-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

/** Consistent inline error chip shared by every admin modal form. Renders nothing when empty. */
function AdminModalError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="rounded-lg bg-signal-soft px-3 py-2 text-xs font-medium text-signal">{children}</p>;
}

function AdminFormField({
  label,
  className,
  children,
}: {
  label: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 text-xs font-semibold text-ink-soft">{label}</Label>
      {children}
    </div>
  );
}

export { AdminModalContent, AdminModalHeader, AdminModalBody, AdminModalFooter, AdminModalError, AdminFormField };
