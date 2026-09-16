import "server-only";
import { getReviewRepository } from "@/lib/config/providers";
import type { AdminReviewDTO, ReviewDTO } from "@/lib/core/ports/review.repository";

export type { ReviewDTO };

export async function getReviewsForProduct(productId: string): Promise<ReviewDTO[]> {
  return getReviewRepository().getReviewsForProduct(productId);
}

/** Admin moderation queue — every review regardless of approval state. */
export async function getAllReviews(): Promise<AdminReviewDTO[]> {
  return getReviewRepository().getAllReviews();
}

export async function setReviewApproval(reviewId: string, isApproved: boolean): Promise<void> {
  return getReviewRepository().setReviewApproval(reviewId, isApproved);
}

export async function deleteReview(reviewId: string): Promise<void> {
  return getReviewRepository().deleteReview(reviewId);
}
