"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock3, Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Price } from "@/components/ui/price";
import type { ProductSummary } from "@/lib/catalog";
import { FALLBACK_IMAGE } from "@/lib/site";

const RECENT_KEY = "exepra-recent-searches";

function readRecent(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function SearchOverlay({ open, onClose, categories }: { open: boolean; onClose: () => void; categories: { slug: string; name: string }[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [active, setActive] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);
  const listId = useId();
  // Recent searches live only in this browser; re-read each time the overlay opens.
  const recent = useMemo(() => (open && typeof window !== "undefined" ? readRecent() : []), [open]);

  const onQueryChange = (value: string) => {
    setQuery(value);
    setActive(-1);
    if (value.trim().length >= 2) setStatus("loading");
    else {
      setResults([]);
      setStatus("idle");
    }
  };

  // Debounced live suggestions
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const t = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setResults(data.products);
        setStatus("done");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setStatus("error");
      }
    }, 220);
    return () => window.clearTimeout(t);
  }, [query]);

  const remember = useCallback((term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...readRecent().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 5);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const submit = (term = query) => {
    const t = term.trim();
    if (!t) return;
    remember(t);
    onClose();
    router.push(`/search?q=${encodeURIComponent(t)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && results.length) {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0 && results[active]) {
      e.preventDefault();
      remember(query);
      onClose();
      router.push(`/product/${results[active].slug}`);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Search" side="top" hideTitle className="rounded-b-[var(--radius-card)]">
      <div className="container-page max-w-3xl pb-8">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="relative"
        >
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden />
          <input
            data-autofocus
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search for dresses, kidswear, accessories…"
            aria-label="Search products"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            enterKeyHint="search"
            className="h-14 w-full rounded-full border border-line bg-white pl-13 pr-14 text-base text-ink shadow-soft outline-none transition focus:border-bronze focus:ring-4 focus:ring-bronze/15"
          />
          {query && (
            <button type="button" onClick={() => onQueryChange("")} aria-label="Clear search" className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-cream hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <div className="mt-6" aria-live="polite">
          {query.trim().length < 2 ? (
            <div className="grid gap-8 sm:grid-cols-2">
              {recent.length > 0 && (
                <div>
                  <p className="eyebrow mb-3">Recent searches</p>
                  <ul>
                    {recent.map((r) => (
                      <li key={r}>
                        <button type="button" onClick={() => onQueryChange(r)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-ink-soft hover:bg-cream">
                          <Clock3 className="h-4 w-4 text-taupe" aria-hidden />
                          {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="eyebrow mb-3">Browse</p>
                <div className="flex flex-wrap gap-2">
                  {[...categories, { slug: "new-arrivals", name: "New Arrivals" }, { slug: "sale", name: "Sale" }].map((c) => (
                    <Link key={c.slug} href={`/${c.slug}`} onClick={onClose} className="rounded-full border border-line bg-white px-4 py-2 text-sm text-ink-soft hover:border-ink/30 hover:text-ink">
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : status === "loading" && results.length === 0 ? (
            <p className="flex items-center gap-2 px-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Searching…
            </p>
          ) : status === "error" ? (
            <p className="px-2 text-sm text-danger">Search is temporarily unavailable. Please try again.</p>
          ) : results.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-10 text-center">
              <p className="font-medium">No products found for “{query.trim()}”</p>
              <p className="mt-1 text-sm text-muted">Check the spelling or try a broader term like “dress” or “kids”.</p>
            </div>
          ) : (
            <>
              <ul id={listId} role="listbox" aria-label="Product suggestions" className="divide-y divide-line overflow-hidden rounded-2xl bg-white">
                {results.map((p, i) => (
                  <li key={p.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                    <Link
                      href={`/product/${p.slug}`}
                      onClick={() => {
                        remember(query);
                        onClose();
                      }}
                      className={`flex items-center gap-4 p-3 transition-colors hover:bg-cream ${i === active ? "bg-cream" : ""}`}
                    >
                      <div className="relative h-16 w-13 shrink-0 overflow-hidden rounded-lg bg-cream">
                        <Image src={p.image ?? FALLBACK_IMAGE} alt="" fill sizes="52px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        {p.category && <p className="text-xs text-muted">{p.category}</p>}
                      </div>
                      <Price price={p.price} compareAt={p.compareAtPrice} size="sm" className="justify-end" />
                    </Link>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => submit()} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-bronze-deep hover:underline">
                See all results for “{query.trim()}” <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
