import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { AdminOffer, OfferDTO, OfferFormValues, OfferRepository } from "@/lib/core/ports/offer.repository";

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

async function syncOfferAssociations(offerId: string, values: OfferFormValues) {
  const supabase = await createClient();
  await supabase.from("offer_categories").delete().eq("offer_id", offerId);
  await supabase.from("offer_products").delete().eq("offer_id", offerId);

  if (values.categoryIds.length > 0) {
    await supabase
      .from("offer_categories")
      .insert(values.categoryIds.map((category_id) => ({ offer_id: offerId, category_id })));
  }
  if (values.productIds.length > 0) {
    await supabase
      .from("offer_products")
      .insert(values.productIds.map((product_id) => ({ offer_id: offerId, product_id })));
  }
}

export function createSupabaseOfferRepository(): OfferRepository {
  return {
    async getActiveOffers(): Promise<OfferDTO[]> {
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
    },

    async getAllOffers(): Promise<OfferDTO[]> {
      const supabase = await createClient();
      const { data } = await supabase.from("offers").select(OFFER_SELECT).order("created_at", { ascending: false });
      return ((data as unknown as OfferRow[]) ?? []).map(toDTO);
    },

    async listOffersForAdmin(): Promise<AdminOffer[]> {
      const supabase = await createClient();
      const { data } = await supabase
        .from("offers")
        .select(
          "id, title, description, discount_percent, start_date, end_date, is_active, offer_categories(category_id), offer_products(product_id)"
        )
        .order("created_at", { ascending: false });

      return (data ?? []).map((o) => ({
        id: o.id,
        title: o.title,
        description: o.description,
        discountPercent: o.discount_percent,
        startDate: o.start_date,
        endDate: o.end_date,
        isActive: o.is_active,
        categoryIds: (o.offer_categories ?? []).map((c) => c.category_id),
        productIds: (o.offer_products ?? []).map((p) => p.product_id),
      }));
    },

    async createOffer(values: OfferFormValues): Promise<{ id: string }> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("offers")
        .insert({
          title: values.title,
          description: values.description,
          discount_percent: values.discountPercent,
          start_date: values.startDate,
          end_date: values.endDate,
          is_active: values.isActive,
        })
        .select("id")
        .single();
      if (error || !data) throw new Error(error?.message ?? "Could not create offer.");
      await syncOfferAssociations(data.id, values);
      return { id: data.id };
    },

    async updateOffer(id: string, values: OfferFormValues): Promise<void> {
      const supabase = await createClient();
      const { error } = await supabase
        .from("offers")
        .update({
          title: values.title,
          description: values.description,
          discount_percent: values.discountPercent,
          start_date: values.startDate,
          end_date: values.endDate,
          is_active: values.isActive,
        })
        .eq("id", id);
      if (error) throw new Error(error.message);
      await syncOfferAssociations(id, values);
    },

    async deleteOffer(id: string): Promise<void> {
      const supabase = await createClient();
      const { error } = await supabase.from("offers").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
  };
}
