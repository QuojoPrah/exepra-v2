import { cn } from "@/lib/utils";
import { discountPercent, formatPrice } from "@/lib/money";

export function Price({
  price,
  compareAt,
  className,
  size = "md",
  showDiscount = false,
}: {
  price: number;
  compareAt?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
  showDiscount?: boolean;
}) {
  const pct = discountPercent(price, compareAt);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span
        className={cn(
          "font-semibold tabular-nums",
          pct ? "text-danger" : "text-ink",
          size === "sm" && "text-sm",
          size === "md" && "text-[0.95rem]",
          size === "lg" && "text-2xl",
        )}
      >
        {pct ? <span className="sr-only">Sale price </span> : null}
        {formatPrice(price)}
      </span>
      {pct && compareAt ? (
        <>
          <span className={cn("text-muted line-through tabular-nums", size === "lg" ? "text-base" : "text-sm")}>
            <span className="sr-only">Original price </span>
            {formatPrice(compareAt)}
          </span>
          {showDiscount && (
            <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">−{pct}%</span>
          )}
        </>
      ) : null}
    </div>
  );
}
