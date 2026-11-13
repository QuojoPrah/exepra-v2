import Link from "next/link";

export function SearchBar({ placeholder, defaultValue, children }: { placeholder: string; defaultValue?: string; children?: React.ReactNode }) {
  return (
    <form method="get" className="mb-5 flex flex-wrap gap-2">
      <label className="min-w-0 flex-1">
        <span className="sr-only">Search</span>
        <input name="q" type="search" defaultValue={defaultValue} placeholder={placeholder} className="field h-10" />
      </label>
      {children}
      <button type="submit" className="h-10 rounded-full bg-ink px-5 text-sm font-medium text-white">Search</button>
    </form>
  );
}

export function Pager({ page, pageCount, href }: { page: number; pageCount: number; href: (p: number) => string }) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-5 flex items-center justify-end gap-2 text-sm">
      {page > 1 && <Link href={href(page - 1)} className="rounded-full border border-line bg-white px-4 py-1.5">Previous</Link>}
      <span className="text-muted">Page {page} of {pageCount}</span>
      {page < pageCount && <Link href={href(page + 1)} className="rounded-full border border-line bg-white px-4 py-1.5">Next</Link>}
    </nav>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">{children}</div>;
}
