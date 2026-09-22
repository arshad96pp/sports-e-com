"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";
import {
  deleteOwnReviewAction,
  getReviewEligibilityAction,
  type ReviewEligibility,
} from "@/lib/actions/review-actions";
import type { ReviewDTO } from "@/lib/services/review-service";
import { formatDate } from "@/lib/utils/format";
import { RatingStars } from "@/components/ui/RatingStars";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductReviewForm } from "@/components/product/ProductReviewForm";

const ACTION_BUTTON_CLASS = "rounded-[12px] px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em]";

interface ProductReviewsProps {
  productId: string;
  reviews: ReviewDTO[];
}

export function ProductReviews({ productId, reviews }: ProductReviewsProps) {
  const { isAuthenticated, hydrated } = useAuth();
  const { showToast } = useToast();
  const [reviewList, setReviewList] = useState(reviews);
  const [eligibility, setEligibility] = useState<ReviewEligibility | "loading">("loading");
  const [ownReviewId, setOwnReviewId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setReviewList(reviews);
  }, [productId, reviews]);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      setEligibility("guest");
      setOwnReviewId(null);
      return;
    }
    let cancelled = false;
    setEligibility("loading");
    getReviewEligibilityAction(productId)
      .then((result) => {
        if (cancelled) return;
        setEligibility(result.eligibility);
        setOwnReviewId(result.ownReviewId);
      })
      .catch(() => {
        if (cancelled) return;
        setEligibility("guest");
        setOwnReviewId(null);
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, isAuthenticated, productId]);

  const canAddReview = eligibility === "eligible";
  const showEmptyPrompt = canAddReview && reviewList.length === 0;

  function handleDialogOpenChange(next: boolean) {
    if (submitting) return;
    setDialogOpen(next);
  }

  function handleReviewAdded(review: ReviewDTO) {
    setReviewList((prev) => [review, ...prev]);
    setEligibility("already_reviewed");
    setOwnReviewId(review.id);
    setDialogOpen(false);
    showToast("Review submitted successfully", "success");
  }

  async function handleDeleteReview() {
    if (!ownReviewId || deleting) return;
    setDeleting(true);
    try {
      const result = await deleteOwnReviewAction(ownReviewId);
      if (!result.ok) {
        showToast(result.error ?? "Could not delete your review.", "error");
        return;
      }
      setReviewList((prev) => prev.filter((review) => review.id !== ownReviewId));
      setOwnReviewId(null);
      setEligibility("eligible");
      setDeleteOpen(false);
      showToast("Review deleted successfully", "success");
    } catch {
      showToast("Could not delete your review.", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mt-14 max-w-3xl border-t border-border pt-10">
      <h2 className="font-display text-xl font-bold text-ink">Customer Reviews</h2>

      {showEmptyPrompt && (
        <p className="mt-2 text-sm text-ink-soft">Be the first to review this product.</p>
      )}

      {canAddReview && (
        <Button type="button" onClick={() => setDialogOpen(true)} className={`mt-5 ${ACTION_BUTTON_CLASS}`}>
          Add Review
        </Button>
      )}

      {reviewList.length > 0 && (
        <div className={`flex flex-col divide-y divide-border `}>
          {reviewList.map((review) => {
            const isOwn = ownReviewId === review.id;
            return (
              <div key={review.id} className="py-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-xs font-bold text-ink">
                    {review.author[0]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{review.author}</p>
                    {review.verified && <p className="text-[11px] text-success">Verified Purchase</p>}
                  </div>
                </div>
                <div className="mt-2.5">
                  <RatingStars rating={review.rating} showCount={false} />
                </div>
                {review.title ? <p className="mt-2 text-sm font-semibold text-ink">{review.title}</p> : null}
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{review.comment}</p>
                <p className="mt-2 text-xs text-muted-soft">{formatDate(review.date)}</p>
                {isOwn && (
                  <button
                    type="button"
                    aria-label="Delete your review"
                    onClick={() => setDeleteOpen(true)}
                    className="mt-3 cursor-pointer text-[11px] font-bold uppercase tracking-wider text-muted transition-colors hover:text-signal"
                  >
                    Delete
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          showCloseButton={!submitting}
          className="sm:max-w-md"
          onPointerDownOutside={(e) => {
            if (submitting) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (submitting) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-ink">Write a Review</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Share your experience with this product
            </DialogDescription>
          </DialogHeader>
          {dialogOpen && (
            <ProductReviewForm
              productId={productId}
              submitting={submitting}
              onSubmittingChange={setSubmitting}
              onSuccess={handleReviewAdded}
              onCancel={() => handleDialogOpenChange(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(next) => {
          if (deleting) return;
          setDeleteOpen(next);
        }}
      >
        <AlertDialogContent className="rounded-2xl border border-border bg-white shadow-[0_20px_60px_rgba(10,10,10,0.10)] ring-0">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete review?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="rounded-b-2xl bg-white">
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteReview();
              }}
              className="bg-signal text-white hover:bg-signal/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Review"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
