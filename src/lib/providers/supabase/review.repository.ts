import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { AdminReviewDTO, ReviewDTO, ReviewRepository } from "@/lib/core/ports/review.repository";

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
        .select("id, author_name, rating, created_at, title, comment, is_verified, is_approved")
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []).map(toDTO);
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
  };
}
