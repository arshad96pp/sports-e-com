import type { Metadata } from "next";
import { listCustomers } from "@/lib/services/customer-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomerActiveToggle } from "@/components/admin/customers/CustomerActiveToggle";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  const sp = await searchParams;
  const search = typeof sp.q === "string" ? sp.q : undefined;
  const page = typeof sp.page === "string" ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  const { customers, total, pageCount } = await listCustomers({ search, page });

  return (
    <div>
      <AdminPageHeader title="Customers" description={`${total} registered customer${total === 1 ? "" : "s"}.`} />

      <div className="mb-4">
        <AdminSearchInput placeholder="Search by name, email or phone…" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <p className="text-sm font-medium text-ink">{c.fullName || "—"}</p>
                  <p className="text-xs text-muted">{c.email}</p>
                </TableCell>
                <TableCell className="text-sm text-ink-soft">{c.phone ?? "—"}</TableCell>
                <TableCell className="text-sm text-muted">{formatDate(c.createdAt)}</TableCell>
                <TableCell>
                  <CustomerActiveToggle userId={c.id} isActive={c.isActive} />
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted">
                  {search ? "No customers match your search." : "No customers yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AdminPagination page={page} pageCount={pageCount} total={total} pageSize={20} />
    </div>
  );
}
