"use client";

import { useTransition } from "react";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/RatingStars";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { setReviewApprovalAction, deleteReviewAction } from "@/lib/actions/admin/review-actions";
import { formatDate } from "@/lib/utils/format";
import { useToast } from "@/lib/context/ToastContext";
import type { ReviewDTO } from "@/lib/services/review-service";

export function ReviewModerationRow({ review, productName }: { review: ReviewDTO; productName: string }) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function setApproval(isApproved: boolean) {
    startTransition(async () => {
      const result = await setReviewApprovalAction(review.id, isApproved);
      if (!result.ok) {
        showToast(result.error ?? "Failed to update review", "error");
        return;
      }
      showToast(isApproved ? "Review approved" : "Review unapproved", "success");
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{review.author}</p>
          <p className="text-xs text-muted">
            {productName} · {formatDate(review.date)}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${review.approved ? "bg-success-soft text-success" : "bg-surface-strong text-muted"}`}>
          {review.approved ? "Approved" : "Pending"}
        </span>
      </div>
      <RatingStars rating={review.rating} showCount={false} size="sm" />
      <p className="text-sm font-semibold text-ink">{review.title}</p>
      <p className="text-sm text-ink-soft">{review.comment}</p>
      <div className="mt-1 flex items-center gap-2">
        {!review.approved ? (
          <Button size="sm" disabled={isPending} onClick={() => setApproval(true)} className="rounded-full">
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Approve
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => setApproval(false)} className="rounded-full">
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
            Unapprove
          </Button>
        )}
        <ConfirmDeleteButton itemLabel={`review by ${review.author}`} entityName="review" onConfirm={() => deleteReviewAction(review.id)} />
      </div>
    </div>
  );
}
