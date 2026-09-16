import type { Metadata } from "next";
import { listCustomers } from "@/lib/services/customer-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomerActiveToggle } from "@/components/admin/customers/CustomerActiveToggle";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await listCustomers();

  return (
    <div>
      <AdminPageHeader title="Customers" description={`${customers.length} registered customer${customers.length === 1 ? "" : "s"}.`} />

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
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted">No customers yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
