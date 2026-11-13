import { cn, ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/utils";

const tone: Record<string, string> = {
  PENDING: "bg-bronze-tint text-bronze-deep",
  UNPAID: "bg-bronze-tint text-bronze-deep",
  PAID: "bg-success/10 text-success",
  PROCESSING: "bg-[#e7eef6] text-[#2f557a]",
  SHIPPED: "bg-[#e7eef6] text-[#2f557a]",
  DELIVERED: "bg-success/10 text-success",
  CANCELLED: "bg-danger/10 text-danger",
  FAILED: "bg-danger/10 text-danger",
  REFUNDED: "bg-sand text-ink-soft",
  PARTIALLY_REFUNDED: "bg-sand text-ink-soft",
};

export function StatusBadge({ status, kind = "order" }: { status: string; kind?: "order" | "payment" }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", tone[status] ?? "bg-cream text-ink")}>
      {(kind === "order" ? ORDER_STATUS_LABEL : PAYMENT_STATUS_LABEL)[status] ?? status}
    </span>
  );
}
