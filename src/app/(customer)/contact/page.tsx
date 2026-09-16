import { Mail, MapPin, Phone } from "lucide-react";
import { PolicyLayout } from "@/components/common/PolicyLayout";
import { WhatsAppIcon } from "@/components/icons/SportIcons";
import { STORE, STORE_WHATSAPP_NUMBER } from "@/lib/config";
import { buildWhatsAppLink } from "@/lib/utils/whatsapp";

export const metadata = {
  title: "Contact Us",
  description: `Get in touch with ${STORE.name} via WhatsApp, phone or email for order and product support.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PolicyLayout title="Contact Us">
      <p>Have a question about an order or a product? We&apos;re here to help.</p>
      <div className="mt-2 flex flex-col gap-3 not-prose">
        <a
          href={buildWhatsAppLink("Hello, I have a question about STRYDE.", STORE_WHATSAPP_NUMBER)}
          target="_blank"
          rel="noopener noreferrer"
          className="tap-target flex items-center gap-3 rounded-xl border border-border px-4 text-sm font-medium text-ink transition-colors hover:bg-surface"
        >
          <WhatsAppIcon className="h-5 w-5 text-success" />
          Chat with us on WhatsApp
        </a>
        <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3.5 text-sm text-ink-soft">
          <Phone className="h-5 w-5 shrink-0 text-muted" />
          {STORE.supportPhone}
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3.5 text-sm text-ink-soft">
          <Mail className="h-5 w-5 shrink-0 text-muted" />
          {STORE.supportEmail}
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3.5 text-sm text-ink-soft">
          <MapPin className="h-5 w-5 shrink-0 text-muted" />
          {STORE.address}
        </div>
      </div>
    </PolicyLayout>
  );
}
