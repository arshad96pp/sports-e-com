import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/Header";
import { OfferAnnouncement } from "@/components/layout/OfferAnnouncement";
import { Footer } from "@/components/layout/Footer";

/**
 * Storefront shell: customer Header/Footer + the cart/wishlist/auth context
 * providers that only customer-facing pages need. Deliberately not part of
 * the root layout — `/admin/**` renders directly under the root layout with
 * none of this, so admin pages never mount a customer cart/session, and the
 * customer header/nav never appears on an admin screen.
 */
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <OfferAnnouncement />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </Providers>
  );
}
