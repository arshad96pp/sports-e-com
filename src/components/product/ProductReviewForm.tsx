"use client";

import { useRef, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { useToast } from "@/lib/context/ToastContext";
import { addReviewAction } from "@/lib/actions/review-actions";
import type { ReviewDTO } from "@/lib/services/review-service";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";

const FIELD_LABEL_CLASS = "mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-700";
const UNDERLINE_FIELD_CLASS =
  "h-12 rounded-none border-0 border-b border-gray-200 bg-transparent px-0 text-sm font-medium text-ink shadow-none focus-visible:border-ink focus-visible:ring-0 disabled:bg-transparent disabled:opacity-100";
const UNDERLINE_TEXTAREA_CLASS =
  "min-h-24 resize-none rounded-none border-0 border-b border-gray-200 bg-transparent px-0 text-sm font-medium text-ink shadow-none focus-visible:border-ink focus-visible:ring-0 disabled:bg-transparent disabled:opacity-100";
const ACTION_BUTTON_CLASS = "rounded-[12px] px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em]";

const SUBMIT_ERROR = "Could not submit your review.";

interface ProductReviewFormProps {
  productId: string;
  submitting: boolean;
  onSubmittingChange: (submitting: boolean) => void;
  onSuccess: (review: ReviewDTO) => void;
  onCancel: () => void;
}

export function ProductReviewForm({
  productId,
  submitting,
  onSubmittingChange,
  onSuccess,
  onCancel,
}: ProductReviewFormProps) {
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const starRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectRating(next: number) {
    setRating(next);
    if (error === "Choose a rating") setError(null);
  }

  function handleRatingKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, current: number) {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(5, (rating || current) + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(1, (rating || current) - 1);
    else if (e.key === "Home") next = 1;
    else if (e.key === "End") next = 5;
    if (next === null) return;
    e.preventDefault();
    selectRating(next);
    starRefs.current[next - 1]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (rating < 1) {
      setError("Choose a rating");
      return;
    }
    if (!comment.trim()) {
      setError("Write a few words about the product");
      return;
    }

    onSubmittingChange(true);
    setError(null);

    try {
      const result = await addReviewAction({ productId, rating, title, comment });
      if (!result.ok || !result.review) {
        showToast(result.error ?? SUBMIT_ERROR, "error");
        return;
      }
      onSuccess(result.review);
    } catch {
      showToast(SUBMIT_ERROR, "error");
    } finally {
      onSubmittingChange(false);
    }
  }

  const previewRating = hoverRating || rating;
  const ratingError = error === "Choose a rating";

  return (
    <form onSubmit={handleSubmit} noValidate className="contents">
      <div className="flex flex-col gap-5">
        <div>
          <Label id="review-rating-label" className={FIELD_LABEL_CLASS}>
            Your Rating
          </Label>
          <div
            role="radiogroup"
            aria-labelledby="review-rating-label"
            aria-required="true"
            aria-invalid={ratingError}
            aria-describedby={ratingError ? "review-field-error" : undefined}
            className="flex items-center"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((n) => {
              const active = n <= previewRating;
              return (
                <button
                  key={n}
                  ref={(el) => {
                    starRefs.current[n - 1] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  tabIndex={rating === n || (rating === 0 && n === 1) ? 0 : -1}
                  disabled={submitting}
                  onMouseEnter={() => setHoverRating(n)}
                  onFocus={() => setHoverRating(n)}
                  onBlur={() => setHoverRating(0)}
                  onClick={() => selectRating(n)}
                  onKeyDown={(e) => handleRatingKeyDown(e, n)}
                  className="cursor-pointer rounded-sm p-1 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 disabled:cursor-not-allowed"
                >
                  <Star
                    className={`h-5 w-5 transition-colors duration-150 ${
                      active ? "fill-ink text-ink" : "fill-none text-border-strong"
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
              );
            })}
            {previewRating > 0 && (
              <span className="ml-2 text-xs font-medium text-muted">{previewRating} of 5</span>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="review-title" className={FIELD_LABEL_CLASS}>
            Title (optional)
          </Label>
          <Input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your experience"
            maxLength={120}
            disabled={submitting}
            className={UNDERLINE_FIELD_CLASS}
          />
        </div>

        <div>
          <Label htmlFor="review-comment" className={FIELD_LABEL_CLASS}>
            Your Review
          </Label>
          <Textarea
            id="review-comment"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (error === "Write a few words about the product") setError(null);
            }}
            placeholder="Share your experience with this product"
            maxLength={2000}
            rows={4}
            required
            disabled={submitting}
            aria-invalid={error === "Write a few words about the product"}
            aria-describedby={error === "Write a few words about the product" ? "review-field-error" : undefined}
            className={UNDERLINE_TEXTAREA_CLASS}
          />
        </div>

        {error && (
          <p id="review-field-error" role="alert" className="text-xs font-medium text-signal">
            {error}
          </p>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={onCancel}
          className={ACTION_BUTTON_CLASS}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} aria-busy={submitting} className={ACTION_BUTTON_CLASS}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
