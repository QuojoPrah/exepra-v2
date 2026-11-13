import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ rating, size = 14, className }: { rating: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-bronze", className)} role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          strokeWidth={1.5}
          fill={rating >= i - 0.25 ? "currentColor" : "none"}
          className={rating >= i - 0.25 ? "" : "text-sand"}
          aria-hidden
        />
      ))}
    </span>
  );
}
