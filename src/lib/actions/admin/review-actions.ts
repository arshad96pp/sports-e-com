"use server";

import { revalidatePath } from "next/cache";
import { getSuperAdminOrNull } from "@/lib/auth/admin-guard";
import * as reviewService from "@/lib/services/review-service";
import type { ActionResult } from "@/lib/actions/admin/product-actions";

export async function setReviewApprovalAction(reviewId: string, isApproved: boolean): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };
  await reviewService.setReviewApproval(reviewId, isApproved);
  revalidatePath("/admin/reviews");
  revalidatePath("/product/[slug]", "page");
  return { ok: true };
}

export async function deleteReviewAction(reviewId: string): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };
  await reviewService.deleteReview(reviewId);
  revalidatePath("/admin/reviews");
  revalidatePath("/product/[slug]", "page");
  return { ok: true };
}
