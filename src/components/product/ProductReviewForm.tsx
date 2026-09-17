"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";
import { addReviewAction, getReviewEligibilityAction, type ReviewEligibility } from "@/lib/actions/review-actions";
import type { ReviewDTO } from "@/lib/services/review-service";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProductReviewFormProps {
  productId: string;
  onReviewAdded: (review: ReviewDTO) => void;
}

export function ProductReviewForm({ productId, onReviewAdded }: ProductReviewFormProps) {
  const { isAuthenticated, hydrated } = useAuth();
  const { showToast } = useToast();
  const [eligibility, setEligibility] = useState<ReviewEligibility | "loading">("loading");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    let cancelled = false;
    getReviewEligibilityAction(productId).then((result) => {
      if (!cancelled) setEligibility(result);
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, isAuthenticated, productId]);

  if (!hydrated) return null;

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-border p-4 text-sm text-ink-soft">
        <Link href="/login" className="font-semibold text-ink underline underline-offset-2">
          Log in
        </Link>{" "}
        to write a review.
      </div>
    );
  }

  if (eligibility === "loading") return null;

  if (eligibility === "already_reviewed") {
    return (
      <div className="rounded-xl border border-border p-4 text-sm text-ink-soft">
        You&apos;ve already reviewed this product.
      </div>
    );
  }

  if (eligibility === "not_purchased") {
    return (
      <div className="rounded-xl border border-border p-4 text-sm text-ink-soft">
        You can write a review after purchasing this product.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Choose a rating");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await addReviewAction({ productId, rating, title, comment });
    setSubmitting(false);
    if (!result.ok || !result.review) {
      setError(result.error ?? "Could not submit your review.");
      return;
    }
    onReviewAdded(result.review);
    setEligibility("already_reviewed");
    setRating(0);
    setTitle("");
    setComment("");
    showToast("Review submitted", "success");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-ink">Write a Review</p>

      <div>
        <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Your Rating</Label>
        <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHoverRating(n)}
              onClick={() => setRating(n)}
              className="p-0.5"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  n <= (hoverRating || rating) ? "fill-signal text-signal" : "text-border-strong"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="review-title" className="mb-1.5 text-xs font-semibold text-ink-soft">
          Title (optional)
        </Label>
        <Input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your experience"
          maxLength={120}
        />
      </div>

      <div>
        <Label htmlFor="review-comment" className="mb-1.5 text-xs font-semibold text-ink-soft">
          Review
        </Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product"
          maxLength={2000}
          rows={3}
          required
        />
      </div>

      {error && <p className="text-xs font-medium text-signal">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="tap-target self-start rounded-full bg-ink px-6 text-sm font-bold text-white disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
