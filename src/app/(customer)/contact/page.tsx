import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { STORE } from "@/lib/config";

export const metadata = {
  title: "Contact Us",
  description: `Get in touch with ${STORE.name} via email for order and product support.`,
  alternates: { canonical: "/contact" },
};

const DETAILS = [
  {
    icon: Mail,
    label: "Email",
    value: STORE.supportEmail,
    href: `mailto:${STORE.supportEmail}`,
  },
  {
    icon: Phone,
    label: "Phone",
    value: STORE.supportPhone,
    href: `tel:${STORE.supportPhone.replace(/\s/g, "")}`,
  },
  {
    icon: MapPin,
    label: "Store",
    value: STORE.address,
  },
] as const;

export default function ContactPage() {
  return (
    <div className="container-app py-10 sm:py-14 lg:py-20">
      <header>
        <Breadcrumb>
          <BreadcrumbList className="gap-8 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="hover:text-ink">
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-muted-foreground">Contact</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="mt-6 font-display text-4xl font-normal tracking-tight text-ink sm:text-5xl lg:text-6xl">
          Contact Us
        </h1>
        <p className="mt-3 text-base text-muted sm:text-lg">We&apos;re here to help</p>
      </header>

      <div className="mt-16 grid items-start gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-16">
        <aside className="lg:col-span-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink">Contact details</p>

          <ul className="mt-8 flex flex-col gap-8">
            {DETAILS.map((item) => (
              <li key={item.label} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface text-ink">
                  <item.icon className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">{item.label}</p>
                  {"href" in item && item.href ? (
                    <a href={item.href} className="mt-1 block text-sm leading-relaxed text-ink">
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm leading-relaxed text-ink">{item.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <Separator className="mt-10 max-w-48" />
        </aside>

        <div className="lg:col-span-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
