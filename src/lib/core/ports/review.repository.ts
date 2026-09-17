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

export interface AddReviewInput {
  productId: string;
  userId: string;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
}

export interface ReviewRepository {
  getReviewsForProduct(productId: string): Promise<ReviewDTO[]>;
  getUserReviewForProduct(productId: string, userId: string): Promise<ReviewDTO | null>;
  addReview(input: AddReviewInput): Promise<ReviewDTO>;
  getAllReviews(): Promise<AdminReviewDTO[]>;
  setReviewApproval(reviewId: string, isApproved: boolean): Promise<void>;
  deleteReview(reviewId: string): Promise<void>;
}
