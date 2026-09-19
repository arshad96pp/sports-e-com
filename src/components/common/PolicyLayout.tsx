import { Breadcrumbs } from "@/components/common/Breadcrumbs";

export function PolicyLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-app max-w-3xl py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
      <h1 className="mt-3 mb-6 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        {title}
      </h1>
      <div className="flex flex-col gap-4 text-sm leading-relaxed text-ink-soft [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-ink [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1">
        {children}
      </div>
    </div>
  );
}
