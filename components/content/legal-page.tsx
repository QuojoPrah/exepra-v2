import { AlertTriangle } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

/** Highlighted placeholder for information only the business owner can supply. */
export function P({ children }: { children: React.ReactNode }) {
  return <mark className="placeholder-legal">[{children}]</mark>;
}

export function LegalPage({ title, subtitle, lang = "de", children, draft = true }: { title: string; subtitle?: string; lang?: string; children: React.ReactNode; draft?: boolean }) {
  return (
    <div className="container-page max-w-3xl py-10 sm:py-14" lang={lang}>
      <Breadcrumbs items={[{ label: title }]} />
      <h1 className="mt-4 text-4xl font-semibold">{title}</h1>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
      {draft && (
        <div className="mt-6 flex gap-3 rounded-xl border border-[#c9a24a] bg-[#fff8e6] p-4 text-sm text-[#5c4410]" role="note" lang="en">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p>
            <strong>Pending legal review.</strong> This text has been completed with the business details but has not yet been reviewed by a lawyer.
          </p>
        </div>
      )}
      <div className="prose-legal mt-10">{children}</div>
    </div>
  );
}
