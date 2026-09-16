import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { CategorySection } from "@/components/home/CategorySection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BestSellers } from "@/components/home/BestSellers";
import { OffersSection } from "@/components/home/OffersSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";
import { getActiveHeroBanners } from "@/lib/services/hero-banner-service";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const banners = await getActiveHeroBanners();

  return (
    <>
      <JsonLd data={organizationJsonLd()} />

      <JsonLd data={websiteJsonLd()} />

      <Hero banners={banners} />

      <CategorySection />

      <FeaturedProducts />

      <BestSellers />

      <OffersSection />
      
      <WhyChooseUs />
    </>
  );
}
