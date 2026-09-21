import { getStorefrontOffers } from "@/lib/services/offer-service";
import { toAnnouncementItems } from "@/lib/utils/offers";
import { OfferAnnouncementLink } from "@/components/layout/OfferAnnouncementLink";
import { OfferAnnouncementRotator } from "@/components/layout/OfferAnnouncementRotator";

export async function OfferAnnouncement() {
  const items = toAnnouncementItems(await getStorefrontOffers());
  if (items.length === 0) return null;

  return (
    <div className="bg-ink text-white" role="region" aria-label="Current offers">
      <div className="container-app flex h-10 min-w-0 items-center justify-center overflow-hidden">
        {items.length === 1 ? (
          <OfferAnnouncementLink item={items[0]} />
        ) : (
          <div className="min-w-0 w-full">
            <OfferAnnouncementRotator items={items} />
          </div>
        )}
      </div>
    </div>
  );
}
