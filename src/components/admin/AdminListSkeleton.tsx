import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/** Same light shimmer treatment as the public-site skeletons (see ProductListingSkeleton, WishlistSkeleton). */
function Bone({ className }: { className?: string }) {
  return <Skeleton className={cn("skeleton-shimmer animate-none bg-[#F1F3F5]", className)} />;
}

function FiltersBarSkeleton({ selects = 0 }: { selects?: number }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Bone className="h-9 w-full max-w-xs rounded-lg" />
      {Array.from({ length: selects }).map((_, i) => (
        <Bone key={i} className="h-9 w-36 rounded-lg" />
      ))}
    </div>
  );
}

function PaginationSkeleton() {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <Bone className="h-3 w-32" />
      <div className="flex items-center gap-1.5">
        <Bone className="h-8 w-8 rounded-full" />
        <Bone className="h-8 w-8 rounded-full" />
        <Bone className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

function Shell({
  actionWidth,
  selects,
  head,
  rows,
}: {
  actionWidth?: string;
  selects: number;
  head: React.ReactNode;
  rows: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Bone className="h-7 w-40" />
          <Bone className="mt-2 h-4 w-56" />
        </div>
        {actionWidth && <Bone className={cn("h-9 rounded-full", actionWidth)} />}
      </div>

      <FiltersBarSkeleton selects={selects} />

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">{head}</TableRow>
          </TableHeader>
          <TableBody>{rows}</TableBody>
        </Table>
      </div>

      <PaginationSkeleton />
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <TableRow className="hover:bg-transparent">{children}</TableRow>;
}

/** Mirrors AdminProductsPage's table (thumbnail + name/SKU, category, price, stock, active toggle, actions). */
export function ProductListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <Shell
      actionWidth="w-36"
      selects={3}
      head={
        <>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </>
      }
      rows={Array.from({ length: rows }).map((_, i) => (
        <Row key={i}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Bone className="h-10 w-10 shrink-0 rounded-md" />
              <div className="min-w-0 space-y-1.5">
                <Bone className="h-3.5 w-32" />
                <Bone className="h-2.5 w-16" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Bone className="h-3.5 w-20" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-1.5">
              <Bone className="h-3.5 w-12" />
              <Bone className="h-3 w-9" />
            </div>
          </TableCell>
          <TableCell>
            <Bone className="h-3.5 w-6" />
          </TableCell>
          <TableCell>
            <Bone className="h-4.5 w-8 rounded-full" />
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-1">
              <Bone className="h-7 w-7 rounded-lg" />
              <Bone className="h-7 w-7 rounded-lg" />
            </div>
          </TableCell>
        </Row>
      ))}
    />
  );
}

/** Mirrors AdminOrdersPage's table (order #, customer, items, total, placed date, status select, actions). */
export function OrderListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <Shell
      selects={2}
      head={
        <>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Placed</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </>
      }
      rows={Array.from({ length: rows }).map((_, i) => (
        <Row key={i}>
          <TableCell>
            <Bone className="h-3.5 w-20" />
          </TableCell>
          <TableCell>
            <Bone className="h-3.5 w-24" />
          </TableCell>
          <TableCell>
            <Bone className="h-3.5 w-6" />
          </TableCell>
          <TableCell>
            <Bone className="h-3.5 w-16" />
          </TableCell>
          <TableCell>
            <Bone className="h-3.5 w-20" />
          </TableCell>
          <TableCell>
            <Bone className="h-9 w-32 rounded-md" />
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end">
              <Bone className="h-7 w-7 rounded-lg" />
            </div>
          </TableCell>
        </Row>
      ))}
    />
  );
}

/** Mirrors AdminCustomersPage's table (name/email, phone, joined date, active toggle). */
export function CustomerListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <Shell
      selects={0}
      head={
        <>
          <TableHead>Customer</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Active</TableHead>
        </>
      }
      rows={Array.from({ length: rows }).map((_, i) => (
        <Row key={i}>
          <TableCell>
            <div className="space-y-1.5">
              <Bone className="h-3.5 w-28" />
              <Bone className="h-2.5 w-36" />
            </div>
          </TableCell>
          <TableCell>
            <Bone className="h-3.5 w-24" />
          </TableCell>
          <TableCell>
            <Bone className="h-3.5 w-20" />
          </TableCell>
          <TableCell>
            <Bone className="h-4.5 w-8 rounded-full" />
          </TableCell>
        </Row>
      ))}
    />
  );
}
