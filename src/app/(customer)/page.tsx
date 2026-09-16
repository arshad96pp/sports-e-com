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

// Own async component (instead of `Home` awaiting banners itself) so this
// fetch runs concurrently with CategorySection/FeaturedProducts/BestSellers/
// OffersSection's fetches below, rather than blocking them from starting.
async function HeroSection() {
  const banners = await getActiveHeroBanners();
  return <Hero banners={banners} />;
}

export default function Home() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />

      <JsonLd data={websiteJsonLd()} />

      <HeroSection />

      <CategorySection />

      <FeaturedProducts />

      <BestSellers />

      <OffersSection />

      <WhyChooseUs />
    </>
  );
}
