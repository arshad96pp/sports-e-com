"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import * as reviewService from "@/lib/services/review-service";
import * as orderService from "@/lib/services/order-service";
import type { ReviewDTO } from "@/lib/services/review-service";

const reviewInputSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1, "Choose a rating").max(5),
  title: z.string().trim().max(120).optional().default(""),
  comment: z.string().trim().min(1, "Write a few words about the product").max(2000),
});

export type ReviewEligibility = "guest" | "already_reviewed" | "not_purchased" | "eligible";

export interface AddReviewResult {
  ok: boolean;
  error?: string;
  review?: ReviewDTO;
}

/** Lets the review form decide what to show (login prompt, "already reviewed", the form itself) without exposing why to a guest. */
export async function getReviewEligibilityAction(productId: string): Promise<ReviewEligibility> {
  const user = await getCurrentUser();
  if (!user || user.role !== "customer") return "guest";

  const existing = await reviewService.getUserReviewForProduct(productId, user.id);
  if (existing) return "already_reviewed";

  const purchased = await orderService.hasPurchasedProduct(productId);
  if (!purchased) return "not_purchased";

  return "eligible";
}

export async function addReviewAction(input: {
  productId: string;
  rating: number;
  title: string;
  comment: string;
}): Promise<AddReviewResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "customer") {
    return { ok: false, error: "Please log in to write a review." };
  }

  const parsed = reviewInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid review." };
  }

  // Re-checked here (not just trusted from the eligibility call) since the
  // client's earlier read could be stale by the time the form submits.
  const existing = await reviewService.getUserReviewForProduct(parsed.data.productId, user.id);
  if (existing) {
    return { ok: false, error: "You've already reviewed this product." };
  }

  const purchased = await orderService.hasPurchasedProduct(parsed.data.productId);
  if (!purchased) {
    return { ok: false, error: "You can review a product only after purchasing it." };
  }

  try {
    const review = await reviewService.addReview({
      productId: parsed.data.productId,
      userId: user.id,
      authorName: user.fullName,
      rating: parsed.data.rating,
      title: parsed.data.title,
      comment: parsed.data.comment,
      verified: true,
    });
    revalidatePath("/product/[slug]", "page");
    return { ok: true, review };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not submit your review." };
  }
}
