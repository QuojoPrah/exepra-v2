export default function Loading() {
  return (
    <div className="container-page py-14" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 animate-pulse rounded-full bg-sand" />
      <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] animate-pulse rounded-[var(--radius-card)] bg-sand/70" />
            <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-sand/70" />
            <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-sand/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
