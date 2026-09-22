"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AdminModalError } from "@/components/admin/AdminModal";
import { useToast } from "@/lib/context/ToastContext";

interface ConfirmDeleteButtonProps {
  itemLabel: string;
  /** Lowercase entity name (e.g. "product", "category") used to build the toast copy. */
  entityName: string;
  onConfirm: () => Promise<{ ok: boolean; error?: string }>;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Shared destructive-action confirmation for admin delete buttons (products, categories, offers, banners, …). */
export function ConfirmDeleteButton({ itemLabel, entityName, onConfirm }: ConfirmDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label={`Delete ${itemLabel}`} className="text-signal hover:bg-signal-soft">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="gap-5 rounded-2xl border border-border bg-white p-5 shadow-[0_20px_60px_rgba(10,10,10,0.10)] ring-0">
        <AlertDialogHeader className="place-items-start text-left">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-signal-soft text-signal">
              <AlertTriangle className="size-5" />
            </div>
            <div className="space-y-1 pt-0.5">
              <AlertDialogTitle>Delete {itemLabel}?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AdminModalError>{error}</AdminModalError>
        <AlertDialogFooter className="-mx-5 -mb-5 gap-2 rounded-b-2xl border-t border-border bg-white px-5 py-4">
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              startTransition(async () => {
                const result = await onConfirm();
                if (!result.ok) {
                  const message = result.error ?? `Failed to delete ${entityName}`;
                  setError(message);
                  showToast(message, "error");
                  return;
                }
                showToast(`${capitalize(entityName)} deleted successfully`, "success");
                setOpen(false);
              });
            }}
            className="bg-signal text-white hover:bg-signal/90"
          >
            {isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
