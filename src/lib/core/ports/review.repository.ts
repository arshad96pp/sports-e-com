export interface ReviewDTO {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  approved: boolean;
}

export interface AdminReviewDTO extends ReviewDTO {
  productId: string;
  productName: string;
}

export interface ReviewRepository {
  getReviewsForProduct(productId: string): Promise<ReviewDTO[]>;
  /** Admin moderation queue — every review regardless of approval state. */
  getAllReviews(): Promise<AdminReviewDTO[]>;
  setReviewApproval(reviewId: string, isApproved: boolean): Promise<void>;
  deleteReview(reviewId: string): Promise<void>;
}
