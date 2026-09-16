import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listCategoriesForAdmin } from "@/lib/services/admin-category-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BannerFormDialog } from "@/components/admin/banners/BannerFormDialog";
import { BannerImageUpload } from "@/components/admin/banners/BannerImageUpload";
import { DeleteBannerButton } from "@/components/admin/banners/DeleteBannerButton";

export const metadata: Metadata = { title: "Hero Banners" };
export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const supabase = await createClient();
  const [{ data: banners }, categories] = await Promise.all([
    supabase
      .from("hero_banners")
      .select("id, eyebrow, title, subtitle, cta_label, cta_href, category_id, sort_order, is_active, image_url_desktop, image_url_mobile")
      .order("sort_order", { ascending: true }),
    listCategoriesForAdmin(),
  ]);
  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div>
      <AdminPageHeader
        title="Hero Banners"
        description="Drives the homepage Swiper — active banners appear in sort order."
        actions={<BannerFormDialog categories={categoryOptions} />}
      />

      <div className="flex flex-col gap-3">
        {(banners ?? []).map((b) => (
          <div key={b.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-white p-4">
            <div className="flex gap-2">
              <BannerImageUpload bannerId={b.id} field="imageUrlDesktop" label="Desktop" currentUrl={b.image_url_desktop} />
              <BannerImageUpload bannerId={b.id} field="imageUrlMobile" label="Mobile" currentUrl={b.image_url_mobile} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{b.title}</p>
              <p className="truncate text-xs text-muted">{b.eyebrow} · {b.cta_label} → {b.cta_href}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${b.is_active ? "bg-success-soft text-success" : "bg-surface-strong text-muted"}`}>
                {b.is_active ? "Active" : "Inactive"}
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
                  ctaLabel: b.cta_label,
                  ctaHref: b.cta_href,
                  categoryId: b.category_id,
                  sortOrder: b.sort_order,
                  isActive: b.is_active,
                }}
              />
              <DeleteBannerButton bannerId={b.id} bannerTitle={b.title} />
            </div>
          </div>
        ))}
        {(banners ?? []).length === 0 && <p className="rounded-xl border border-border bg-white p-6 text-center text-sm text-muted">No banners yet.</p>}
      </div>
    </div>
  );
}
