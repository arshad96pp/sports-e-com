import Link from "next/link";
import type { Metadata } from "next";
import { Eye } from "lucide-react";
import { listOrders } from "@/lib/services/admin-order-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderStatusSelect } from "@/components/admin/orders/OrderStatusSelect";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description={`${orders.length} order${orders.length === 1 ? "" : "s"} placed.`}
      />

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
                  No orders yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
