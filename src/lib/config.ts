/**
 * Store-wide configuration.
 *
 * STORE_WHATSAPP_NUMBER should be set via the NEXT_PUBLIC_WHATSAPP_NUMBER
 * environment variable (see .env.local.example) so it can be changed per
 * deployment without touching UI code. Use full international format with
 * no leading "+" or spaces, e.g. 919876543210.
 */
export const STORE_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999";

/**
 * Canonical site URL used for metadata (canonical links, Open Graph, sitemap.xml,
 * robots.txt). Set NEXT_PUBLIC_SITE_URL in production deployments.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.stryde.in";

export const STORE = {
  name: "STRYDE",
  tagline: "Gear Up. Play Better.",
  supportEmail: "support@stryde.in",
  supportPhone: "+91 98765 43210",
  address: "STRYDE Sports, MG Road, Bengaluru, Karnataka 560001",
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    youtube: "https://youtube.com",
  },
};

export const FREE_SHIPPING_THRESHOLD = 999;
