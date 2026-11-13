"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useUI } from "@/components/providers/store-providers";

export function Toaster() {
  const { toast } = useUI();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex justify-center px-4" aria-live="assertive">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="pointer-events-auto flex max-w-md items-center gap-3 rounded-full bg-ink px-5 py-3 text-sm text-white shadow-lift"
            role={toast.tone === "error" ? "alert" : "status"}
          >
            {toast.tone === "error" ? <AlertCircle className="h-4 w-4 shrink-0 text-[#f0a49c]" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-bronze" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
