import Link from "next/link";
import { ActionForm, Card, PageHeader } from "@/components/admin/ui";
import { Empty } from "@/components/admin/table-tools";
import { Stars } from "@/components/ui/stars";
import { moderateReview } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import type { ReviewStatus } from "@/lib/generated/prisma/client";

export const metadata = { title: "Reviews" };

function Op({ id, op, label, variant = "outline" }: { id: string; op: string; label: string; variant?: "outline" | "ghost" | "danger" | "primary" }) {
  return (
    <ActionForm action={moderateReview} submitLabel={label} variant={variant} className="space-y-0" confirm={op === "delete" ? "Delete this review permanently?" : undefined}>
      <input type="hidden" name="id" value={id} /><input type="hidden" name="op" value={op} />
    </ActionForm>
  );
}

export default async function AdminReviews({ searchParams }: PageProps<"/admin/reviews">) {
  const sp = await searchParams;
  const status = (["PENDING", "APPROVED", "REJECTED"].includes(String(sp.status)) ? sp.status : "PENDING") as ReviewStatus;
  const reviews = await db.review.findMany({ where: { status }, orderBy: { createdAt: "desc" }, take: 100, include: { product: { select: { name: true, slug: true } }, user: { select: { email: true } } } });
  return (
    <div>
      <PageHeader title="Reviews" description="Only approved reviews from verified purchasers appear in the store. Featured reviews appear on the homepage." />
      <nav className="mb-5 flex gap-2" aria-label="Review status">
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <Link key={s} href={`/admin/reviews?status=${s}`} aria-current={s === status ? "page" : undefined} className={`rounded-full px-4 py-1.5 text-sm ${s === status ? "bg-ink text-white" : "border border-line bg-white"}`}>{s.charAt(0) + s.slice(1).toLowerCase()}</Link>
        ))}
      </nav>
      {reviews.length === 0 ? <Empty>No {status.toLowerCase()} reviews.</Empty> : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <Card key={r.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3"><Stars rating={r.rating} /><span className="text-sm font-medium">{r.displayName}</span><span className="text-xs text-muted">{r.user.email} · {formatDate(r.createdAt)}{r.isVerifiedPurchase ? " · verified purchase" : ""}</span></div>
                <Link href={`/product/${r.product.slug}`} target="_blank" className="text-xs text-bronze-deep hover:underline">{r.product.name}</Link>
              </div>
              {r.title && <p className="mt-3 font-medium">{r.title}</p>}
              <p className="mt-1 text-sm text-ink-soft">{r.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {r.status !== "APPROVED" && <Op id={r.id} op="approve" label="Approve" variant="primary" />}
                {r.status !== "REJECTED" && <Op id={r.id} op="reject" label="Reject" />}
                {r.status === "APPROVED" && (r.isFeatured ? <Op id={r.id} op="unfeature" label="Remove from homepage" /> : <Op id={r.id} op="feature" label="Feature on homepage" />)}
                <Op id={r.id} op="delete" label="Delete" variant="ghost" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
