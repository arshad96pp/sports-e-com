import "server-only";

/** Review repository — delegates to the Supabase-backed review service. */
export { getReviewsForProduct, type ReviewDTO } from "@/lib/services/review-service";
