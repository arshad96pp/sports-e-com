import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { STORE, SITE_URL } from "@/lib/config";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${STORE.name} — ${STORE.tagline}`,
    template: `%s | ${STORE.name}`,
  },
  description:
    "Premium football, cricket, tennis and multi-sport accessories. Shop match-ready gear built for every game.",
  openGraph: {
    type: "website",
    siteName: STORE.name,
    title: `${STORE.name} — ${STORE.tagline}`,
    description:
      "Premium football, cricket, tennis and multi-sport accessories. Shop match-ready gear built for every game.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${STORE.name} — ${STORE.tagline}`,
    description:
      "Premium football, cricket, tennis and multi-sport accessories. Shop match-ready gear built for every game.",
  },
  alternates: {
    canonical: "/",
  },
};

/**
 * Bare app shell: fonts, global metadata and global CSS only. No customer
 * Header/Footer and no customer context providers (cart, wishlist, auth,
 * etc.) live here — those belong to `(customer)/layout.tsx` so `/admin/**`
 * never inherits customer storefront chrome or state. See that file for why.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={cn(inter.variable, "font-sans")}>
      <body className="flex min-h-screen flex-col antialiased">{children}</body>
    </html>
  );
}
