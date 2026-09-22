import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getContactMessageById } from "@/lib/services/contact-message-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata: Metadata = { title: "Message Detail" };
export const dynamic = "force-dynamic";

export default async function AdminContactMessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const message = await getContactMessageById(id);
  if (!message) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/contact-messages"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Contact Messages
      </Link>
      <AdminPageHeader
        title={`Message from ${message.fullName}`}
        description={`Received ${new Date(message.createdAt).toLocaleString("en-IN")}`}
      />

      <div className="rounded-xl border border-border bg-white p-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Full Name</dt>
            <dd className="mt-1 text-sm font-medium text-ink">{message.fullName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Email</dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              <a href={`mailto:${message.email}`} className="hover:underline">
                {message.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Phone</dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              {message.phone ? (
                <a href={`tel:${message.phone}`} className="hover:underline">
                  {message.phone}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-5 border-t border-border pt-5">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Inquiry Details</dt>
          <dd className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{message.message}</dd>
        </div>
      </div>
    </div>
  );
}
