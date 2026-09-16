export interface OfferDTO {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  categorySlugs: string[];
  productSlugs: string[];
}

export interface AdminOffer {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  categoryIds: string[];
  productIds: string[];
}

export interface OfferFormValues {
  title: string;
  description: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  categoryIds: string[];
  productIds: string[];
}

export interface OfferRepository {
  getActiveOffers(): Promise<OfferDTO[]>;
  getAllOffers(): Promise<OfferDTO[]>;

  listOffersForAdmin(): Promise<AdminOffer[]>;
  createOffer(values: OfferFormValues): Promise<{ id: string }>;
  updateOffer(id: string, values: OfferFormValues): Promise<void>;
  deleteOffer(id: string): Promise<void>;
}
