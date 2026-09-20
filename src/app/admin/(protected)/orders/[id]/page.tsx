import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrderById } from "@/lib/services/admin-order-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderStatusSelect } from "@/components/admin/orders/OrderStatusSelect";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Order Detail" };
export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/orders" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Orders
      </Link>
      <AdminPageHeader
        title={order.orderNumber}
        description={`Placed ${new Date(order.createdAt).toLocaleString("en-IN")}`}
        actions={<OrderStatusSelect orderId={order.id} status={order.status} />}
      />

      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="font-display text-base font-bold text-ink">Delivery Address</h2>
          <p className="mt-3 text-sm font-medium text-ink">{order.addressFullName}</p>
          <p className="mt-1 text-sm text-ink-soft">{order.addressPhone}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {order.addressLine1}, {order.addressCity}, {order.addressState} - {order.addressPincode}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="font-display text-base font-bold text-ink">Items</h2>
          <div className="mt-3 flex flex-col divide-y divide-border">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{item.productName}</p>
                  <p className="text-xs text-muted">
                    SKU {item.productSku}
                    {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
                      .filter(Boolean)
                      .map((s) => ` · ${s}`)
                      .join("")}
                    {" · "}Qty {item.quantity}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-ink">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between text-ink-soft">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-success">
              <span>Discount</span>
              <span>&minus; {formatPrice(order.discount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-ink">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
