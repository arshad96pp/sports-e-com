import type { Metadata } from "next";
import { getAllReviews } from "@/lib/services/review-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReviewModerationRow } from "@/components/admin/reviews/ReviewModerationRow";

export const metadata: Metadata = { title: "Reviews" };
export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();
  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  return (
    <div>
      <AdminPageHeader title="Reviews" description={`${pending.length} pending moderation.`} />

      <div className="flex flex-col gap-6">
        {pending.length > 0 && (
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Pending ({pending.length})</h2>
            <div className="flex flex-col gap-3">
              {pending.map((r) => (
                <ReviewModerationRow key={r.id} review={r} productName={r.productName} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Approved ({approved.length})</h2>
          <div className="flex flex-col gap-3">
            {approved.map((r) => (
              <ReviewModerationRow key={r.id} review={r} productName={r.productName} />
            ))}
            {approved.length === 0 && <p className="text-sm text-muted">No approved reviews yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
