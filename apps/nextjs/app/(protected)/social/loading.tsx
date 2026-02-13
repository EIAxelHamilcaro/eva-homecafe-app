export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-6 h-8 w-36 animate-pulse rounded-lg bg-muted" />
      <div className="space-y-4">
        {["social-a", "social-b", "social-c", "social-d"].map((id) => (
          <div
            key={id}
            className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
          >
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
