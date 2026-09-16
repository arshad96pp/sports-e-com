"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/RatingStars";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { setReviewApprovalAction, deleteReviewAction } from "@/lib/actions/admin/review-actions";
import { formatDate } from "@/lib/utils/format";
import type { ReviewDTO } from "@/lib/services/review-service";

export function ReviewModerationRow({ review, productName }: { review: ReviewDTO; productName: string }) {
  const [isPending, startTransition] = useTransition();

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
          <Button
            size="sm"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await setReviewApprovalAction(review.id, true);
              })
            }
            className="rounded-full"
          >
            <Check className="h-3.5 w-3.5" />
            Approve
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await setReviewApprovalAction(review.id, false);
              })
            }
            className="rounded-full"
          >
            <X className="h-3.5 w-3.5" />
            Unapprove
          </Button>
        )}
        <ConfirmDeleteButton itemLabel={`review by ${review.author}`} onConfirm={() => deleteReviewAction(review.id)} />
      </div>
    </div>
  );
}
