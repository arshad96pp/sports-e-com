import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getAllCategories } from "@/lib/repositories/category-repository";
import { STORE } from "@/lib/config";
import { FacebookIcon, InstagramIcon, XIcon, YoutubeIcon } from "@/components/icons/SocialIcons";

const SUPPORT_LINKS = [
  { label: "Contact Us", href: "/contact" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Return Policy", href: "/return-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

const SOCIAL_LINKS = [
  { icon: InstagramIcon, href: STORE.social.instagram, label: "Instagram" },
  { icon: FacebookIcon, href: STORE.social.facebook, label: "Facebook" },
  { icon: XIcon, href: STORE.social.twitter, label: "Twitter" },
  { icon: YoutubeIcon, href: STORE.social.youtube, label: "YouTube" },
];

export async function Footer() {
  const categories = await getAllCategories();

  return (
    <footer className="mt-16 border-t border-border bg-ink text-white">
      <div className="container-app grid grid-cols-2 gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="col-span-2 sm:col-span-2 md:col-span-1">
          <span className="font-display text-2xl font-extrabold tracking-tight">{STORE.name}</span>
          <p className="mt-3 max-w-xs text-sm text-white/60">
            Premium sports accessories for footballers, cricketers, tennis players and everyday athletes.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-accent hover:text-accent"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-white/50">Categories</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="text-sm text-white/75 transition-colors hover:text-accent">
                  {c.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-white/50">Customer Support</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {SUPPORT_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-white/75 transition-colors hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/about" className="text-sm text-white/75 transition-colors hover:text-accent">
                About Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-white/50">Get in Touch</h3>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-white/75">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {STORE.address}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-accent" />
              {STORE.supportPhone}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-accent" />
              {STORE.supportEmail}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-app flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {STORE.name}. All rights reserved.</p>
          <p>Built for athletes, by athletes.</p>
        </div>
      </div>
    </footer>
  );
}
