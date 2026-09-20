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
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AdminModalError } from "@/components/admin/AdminModal";

interface ConfirmDeleteButtonProps {
  itemLabel: string;
  onConfirm: () => Promise<{ ok: boolean; error?: string }>;
}

/** Shared destructive-action confirmation for admin delete buttons (products, categories, offers, banners, …). */
export function ConfirmDeleteButton({ itemLabel, onConfirm }: ConfirmDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label={`Delete ${itemLabel}`} className="text-signal hover:bg-signal-soft">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl border border-border bg-white shadow-[0_20px_60px_rgba(10,10,10,0.10)] ring-0">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-signal-soft text-signal">
            <AlertTriangle />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete {itemLabel}?</AlertDialogTitle>
          <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AdminModalError>{error}</AdminModalError>
        <AlertDialogFooter className="rounded-b-2xl bg-white">
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              startTransition(async () => {
                const result = await onConfirm();
                if (!result.ok) {
                  setError(result.error ?? "Something went wrong.");
                  return;
                }
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
