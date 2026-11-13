"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitReview, type ReviewState } from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";

export function ReviewForm({ productId, defaultName }: { productId: string; defaultName: string }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(submitReview, { status: "idle", message: "" });
  const [rating, setRating] = useState(5);

  if (state.status === "success") {
    return <p className="rounded-xl bg-white p-5 text-sm text-success" role="status">{state.message}</p>;
  }
  return (
    <form action={action} className="space-y-4 rounded-[var(--radius-card)] border border-line bg-white p-6">
      <h3 className="text-lg font-semibold">Write a review</h3>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <fieldset>
        <legend className="label">Your rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} star${i > 1 ? "s" : ""}`} aria-pressed={rating === i} className="text-bronze">
              <Star className="h-7 w-7" fill={i <= rating ? "currentColor" : "none"} strokeWidth={1.4} />
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="review-title">Title (optional)</label>
        <input id="review-title" name="title" className="field" maxLength={120} />
      </div>
      <div>
        <label className="label" htmlFor="review-body">Your review</label>
        <textarea id="review-body" name="body" className="field" rows={4} required minLength={10} maxLength={2000} />
      </div>
      <div>
        <label className="label" htmlFor="review-name">Display name</label>
        <input id="review-name" name="displayName" className="field" defaultValue={defaultName} required maxLength={60} />
        <p className="mt-1 text-xs text-muted">Shown publicly next to your review.</p>
      </div>
      {state.status === "error" && <p className="text-sm text-danger" role="alert">{state.message}</p>}
      <Button type="submit" loading={pending}>Submit review</Button>
    </form>
  );
}
