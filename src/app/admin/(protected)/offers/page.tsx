import type { Metadata } from "next";
import { listOffersForAdmin } from "@/lib/services/admin-offer-service";
import { listCategoriesForAdmin } from "@/lib/services/admin-category-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OfferFormDialog } from "@/components/admin/offers/OfferFormDialog";
import { DeleteOfferButton } from "@/components/admin/offers/DeleteOfferButton";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Offers" };
export const dynamic = "force-dynamic";

export default async function AdminOffersPage() {
  const [offers, categories] = await Promise.all([listOffersForAdmin(), listCategoriesForAdmin()]);
  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));
  const categoryNameById = new Map(categoryOptions.map((c) => [c.id, c.name]));

  return (
    <div>
      <AdminPageHeader title="Offers" description="Manage discounts and their date range." actions={<OfferFormDialog categories={categoryOptions} />} />

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Offer</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Applies To</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="text-sm font-medium text-ink">{o.title}</TableCell>
                <TableCell className="text-sm text-ink-soft">{o.discountPercent}%</TableCell>
                <TableCell className="text-sm text-muted">
                  {o.categoryIds.length === 0 ? "All categories" : o.categoryIds.map((id) => categoryNameById.get(id)).filter(Boolean).join(", ")}
                </TableCell>
                <TableCell className="text-xs text-muted">
                  {formatDate(o.startDate)} – {formatDate(o.endDate)}
                </TableCell>
                <TableCell className="text-sm">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${o.isActive ? "bg-success-soft text-success" : "bg-surface-strong text-muted"}`}>
                    {o.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <OfferFormDialog offer={o} categories={categoryOptions} />
                    <DeleteOfferButton offerId={o.id} offerTitle={o.title} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {offers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted">No offers yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
