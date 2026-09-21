/**
 * Store-wide configuration.
 *
 * STORE_WHATSAPP_NUMBER is the environment-level default (see
 * .env.local.example), used only when Admin Settings has no WhatsApp number
 * saved — see `getWhatsAppNumber` in settings-service.ts, the single place
 * that resolves the two. Use full international format with no leading "+"
 * or spaces, e.g. 919876543210.
 */
export const STORE_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

/**
 * Canonical site URL used for metadata (canonical links, Open Graph, sitemap.xml,
 * robots.txt). Set NEXT_PUBLIC_SITE_URL in production deployments.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.enzosports.in";

export const STORE = {
  name: "Enzo Sports",
  tagline: "Gear Up. Play Better.",
  supportEmail: "officialenzosports@gmail.com",
  supportPhone: "+91 7034474858",
  address: "Kerala Gramin Bank Opposite, Trippanachi, 673641, Kerala, India",
  social: {
    instagram: "https://www.instagram.com/enzo_sports.in?stkn=eDd2bjIzazlnbm8x",
  },
};

export const FREE_SHIPPING_THRESHOLD = 999;
