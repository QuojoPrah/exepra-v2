"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Re-renders the confirmation page while waiting for the payment webhook. */
export function PaymentPoller({ intervalMs = 2500, maxAttempts = 24 }: { intervalMs?: number; maxAttempts?: number }) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  useEffect(() => {
    if (attempts >= maxAttempts) return;
    const t = window.setTimeout(() => {
      router.refresh();
      setAttempts((a) => a + 1);
    }, intervalMs);
    return () => window.clearTimeout(t);
  }, [attempts, intervalMs, maxAttempts, router]);
  if (attempts < maxAttempts) return null;
  return (
    <p className="mb-6 rounded-xl bg-bronze-tint p-4 text-center text-sm text-bronze-deep">
      This is taking longer than usual. You&apos;ll receive an email once your payment is confirmed — there&apos;s no need to pay again.
    </p>
  );
}
