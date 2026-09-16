import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

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

const OFFER_SELECT = `
  id, title, description, discount_percent, start_date, end_date, is_active,
  offer_categories ( category:categories ( slug ) ),
  offer_products ( product:products ( slug ) )
`;

interface OfferRow {
  id: string;
  title: string;
  description: string;
  discount_percent: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  offer_categories: { category: { slug: string } | null }[] | null;
  offer_products: { product: { slug: string } | null }[] | null;
}

function toDTO(o: OfferRow): OfferDTO {
  return {
    id: o.id,
    title: o.title,
    description: o.description,
    discountPercent: o.discount_percent,
    startDate: o.start_date,
    endDate: o.end_date,
    isActive: o.is_active,
    categorySlugs: (o.offer_categories ?? []).map((c) => c.category?.slug).filter((s): s is string => Boolean(s)),
    productSlugs: (o.offer_products ?? []).map((p) => p.product?.slug).filter((s): s is string => Boolean(s)),
  };
}

export async function getActiveOffers(): Promise<OfferDTO[]> {
  const supabase = createPublicClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("offers")
    .select(OFFER_SELECT)
    .eq("is_active", true)
    .lte("start_date", now)
    .gte("end_date", now)
    .order("discount_percent", { ascending: false });
  return ((data as unknown as OfferRow[]) ?? []).map(toDTO);
}

export async function getAllOffers(): Promise<OfferDTO[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("offers").select(OFFER_SELECT).order("created_at", { ascending: false });
  return ((data as unknown as OfferRow[]) ?? []).map(toDTO);
}
