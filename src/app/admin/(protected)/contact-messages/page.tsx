import Link from "next/link";
import type { Metadata } from "next";
import { Eye } from "lucide-react";
import { listContactMessages } from "@/lib/services/contact-message-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ContactMessageListFilters } from "@/components/admin/contact-messages/ContactMessageListFilters";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Contact Messages" };
export const dynamic = "force-dynamic";

export default async function AdminContactMessagesPage({ searchParams }: PageProps<"/admin/contact-messages">) {
  const sp = await searchParams;
  const search = typeof sp.q === "string" ? sp.q : undefined;
  const page = typeof sp.page === "string" ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  const { messages, total, pageCount } = await listContactMessages({ search, page });

  return (
    <div>
      <AdminPageHeader
        title="Contact Messages"
        description={`${total} inquir${total === 1 ? "y" : "ies"} received.`}
      />

      <ContactMessageListFilters />

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="text-sm font-medium text-ink">{m.fullName}</TableCell>
                <TableCell className="text-sm text-ink-soft">{m.email}</TableCell>
                <TableCell className="text-sm text-ink-soft">{m.phone ?? "—"}</TableCell>
                <TableCell className="text-sm text-ink-soft">{formatDate(m.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="icon-sm">
                    <Link href={`/admin/contact-messages/${m.id}`} aria-label={`View message from ${m.fullName}`}>
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {messages.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted">
                  {search ? "No messages match your search." : "No messages yet."}
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
