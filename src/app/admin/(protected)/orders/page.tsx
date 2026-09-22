import Link from "next/link";
import type { Metadata } from "next";
import { Eye } from "lucide-react";
import { listOrders } from "@/lib/services/admin-order-service";
import type { AdminOrderSort } from "@/lib/core/ports/order.repository";
import type { OrderStatus } from "@/lib/services/order-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { OrderStatusSelect } from "@/components/admin/orders/OrderStatusSelect";
import { OrderListFilters } from "@/components/admin/orders/OrderListFilters";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

const VALID_STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "cancelled"];
const VALID_SORTS: AdminOrderSort[] = ["newest", "oldest", "total-high-low", "total-low-high"];

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const search = typeof sp.q === "string" ? sp.q : undefined;
  const status = typeof sp.status === "string" && (VALID_STATUSES as string[]).includes(sp.status) ? (sp.status as OrderStatus) : undefined;
  const sort = typeof sp.sort === "string" && (VALID_SORTS as string[]).includes(sp.sort) ? (sp.sort as AdminOrderSort) : undefined;
  const page = typeof sp.page === "string" ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  const { orders, total, pageCount } = await listOrders({ search, status, sort, page, pageSize: 15 });

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description={`${total} order${total === 1 ? "" : "s"} placed.`}
      />

      <OrderListFilters />

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="text-sm font-medium text-ink">{o.orderNumber}</TableCell>
                <TableCell className="text-sm text-ink-soft">{o.customerName}</TableCell>
                <TableCell className="text-sm text-ink-soft">{o.itemCount}</TableCell>
                <TableCell className="text-sm text-ink-soft">{formatPrice(o.total)}</TableCell>
                <TableCell className="text-sm text-ink-soft">
                  {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </TableCell>
                <TableCell>
                  <OrderStatusSelect orderId={o.id} status={o.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="icon-sm">
                    <Link href={`/admin/orders/${o.id}`} aria-label={`View ${o.orderNumber}`}>
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted">
                  {search || status ? "No orders match your search or filters." : "No orders yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AdminPagination page={page} pageCount={pageCount} total={total} pageSize={15} />
    </div>
  );
}
