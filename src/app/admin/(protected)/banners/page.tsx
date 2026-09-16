import type { Metadata } from "next";
import { listBannersForAdmin } from "@/lib/services/admin-banner-service";
import { listCategoriesForAdmin } from "@/lib/services/admin-category-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BannerFormDialog } from "@/components/admin/banners/BannerFormDialog";
import { BannerImageUpload } from "@/components/admin/banners/BannerImageUpload";
import { DeleteBannerButton } from "@/components/admin/banners/DeleteBannerButton";

export const metadata: Metadata = { title: "Hero Banners" };
export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const [banners, categories] = await Promise.all([listBannersForAdmin(), listCategoriesForAdmin()]);
  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div>
      <AdminPageHeader
        title="Hero Banners"
        description="Drives the homepage Swiper — active banners appear in sort order."
        actions={<BannerFormDialog categories={categoryOptions} />}
      />

      <div className="flex flex-col gap-3">
        {banners.map((b) => (
          <div key={b.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-white p-4">
            <div className="flex gap-2">
              <BannerImageUpload bannerId={b.id} field="imageUrlDesktop" label="Desktop" currentUrl={b.imageUrlDesktop} />
              <BannerImageUpload bannerId={b.id} field="imageUrlMobile" label="Mobile" currentUrl={b.imageUrlMobile} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{b.title}</p>
              <p className="truncate text-xs text-muted">{b.eyebrow} · {b.ctaLabel} → {b.ctaHref}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${b.isActive ? "bg-success-soft text-success" : "bg-surface-strong text-muted"}`}>
                {b.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <BannerFormDialog
                categories={categoryOptions}
                banner={{
                  id: b.id,
                  eyebrow: b.eyebrow,
                  title: b.title,
                  subtitle: b.subtitle,
                  ctaLabel: b.ctaLabel,
                  ctaHref: b.ctaHref,
                  categoryId: b.categoryId,
                  sortOrder: b.sortOrder,
                  isActive: b.isActive,
                }}
              />
              <DeleteBannerButton bannerId={b.id} bannerTitle={b.title} />
            </div>
          </div>
        ))}
        {banners.length === 0 && <p className="rounded-xl border border-border bg-white p-6 text-center text-sm text-muted">No banners yet.</p>}
      </div>
    </div>
  );
}
