export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-4">
      <div className="mb-4 flex items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          {["entry-a", "entry-b", "entry-c"].map((id) => (
            <div key={id} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-48 animate-pulse rounded-xl bg-muted" />
          <div className="h-48 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
