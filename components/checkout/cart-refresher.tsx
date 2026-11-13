"use client";

import { useEffect } from "react";
import { useCart } from "@/components/providers/store-providers";

export function CartRefresher() {
  const { refresh } = useCart();
  useEffect(() => {
    refresh();
  }, [refresh]);
  return null;
}
