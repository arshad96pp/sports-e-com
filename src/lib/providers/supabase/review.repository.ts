import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { AddReviewInput, AdminReviewDTO, ReviewDTO, ReviewRepository } from "@/lib/core/ports/review.repository";

const REVIEW_SELECT = "id, author_name, rating, created_at, title, comment, is_verified, is_approved";

function toDTO(r: {
  id: string;
  author_name: string;
  rating: number;
  created_at: string;
  title: string;
  comment: string;
  is_verified: boolean;
  is_approved: boolean;
}): ReviewDTO {
  return {
    id: r.id,
    author: r.author_name,
    rating: r.rating,
    date: r.created_at,
    title: r.title,
    comment: r.comment,
    verified: r.is_verified,
    approved: r.is_approved,
  };
}

export function createSupabaseReviewRepository(): ReviewRepository {
  return {
    async getReviewsForProduct(productId: string): Promise<ReviewDTO[]> {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("reviews")
        .select(REVIEW_SELECT)
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []).map(toDTO);
    },

    /** Session-scoped (not the public client) — `user_id` is only meaningful under the caller's own session. */
    async getUserReviewForProduct(productId: string, userId: string): Promise<ReviewDTO | null> {
      const supabase = await createClient();
      const { data } = await supabase
        .from("reviews")
        .select(REVIEW_SELECT)
        .eq("product_id", productId)
        .eq("user_id", userId)
        .maybeSingle();
      return data ? toDTO(data) : null;
    },

    /** RLS (`reviews_insert_own`) requires `user_id = auth.uid()`, so this must run under the caller's own session. */
    async addReview(input: AddReviewInput): Promise<ReviewDTO> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          product_id: input.productId,
          user_id: input.userId,
          author_name: input.authorName,
          rating: input.rating,
          title: input.title,
          comment: input.comment,
          is_verified: input.verified,
        })
        .select(REVIEW_SELECT)
        .single();
      if (error || !data) throw new Error(error?.message ?? "Could not submit your review.");
      return toDTO(data);
    },

    async getAllReviews(): Promise<AdminReviewDTO[]> {
      const supabase = await createClient();
      const { data } = await supabase
        .from("reviews")
        .select(
          "id, author_name, rating, created_at, title, comment, is_verified, is_approved, product_id, product:products(name)"
        )
        .order("created_at", { ascending: false });

      return (
        (data ?? []) as unknown as Array<
          Parameters<typeof toDTO>[0] & { product_id: string; product: { name: string } | null }
        >
      ).map((r) => ({
        ...toDTO(r),
        productId: r.product_id,
        productName: r.product?.name ?? "Unknown product",
      }));
    },

    async setReviewApproval(reviewId: string, isApproved: boolean): Promise<void> {
      const supabase = await createClient();
      await supabase.from("reviews").update({ is_approved: isApproved }).eq("id", reviewId);
    },

    async deleteReview(reviewId: string): Promise<void> {
      const supabase = await createClient();
      await supabase.from("reviews").delete().eq("id", reviewId);
    },

    async deleteOwnReview(reviewId: string, userId: string): Promise<void> {
      const supabase = await createClient();
      const { data, error: fetchError } = await supabase
        .from("reviews")
        .select("id, user_id")
        .eq("id", reviewId)
        .maybeSingle();

      if (fetchError) throw new Error("Could not delete your review.");
      if (!data) throw new Error("Review not found.");
      if (data.user_id !== userId) throw new Error("You can only delete your own review.");

      const { error } = await supabase.from("reviews").delete().eq("id", reviewId).eq("user_id", userId);
      if (error) throw new Error(error.message);
    },
  };
}
