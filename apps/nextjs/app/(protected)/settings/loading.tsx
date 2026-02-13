export default function Loading() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 h-8 w-36 animate-pulse rounded-lg bg-muted" />
      <div className="space-y-4">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
