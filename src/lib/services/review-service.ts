import "server-only";
import { getReviewRepository } from "@/lib/config/providers";
import type { AddReviewInput, AdminReviewDTO, ReviewDTO } from "@/lib/core/ports/review.repository";

export type { AddReviewInput, ReviewDTO };

export async function getReviewsForProduct(productId: string): Promise<ReviewDTO[]> {
  return getReviewRepository().getReviewsForProduct(productId);
}

export async function getUserReviewForProduct(productId: string, userId: string): Promise<ReviewDTO | null> {
  return getReviewRepository().getUserReviewForProduct(productId, userId);
}

export async function addReview(input: AddReviewInput): Promise<ReviewDTO> {
  return getReviewRepository().addReview(input);
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
