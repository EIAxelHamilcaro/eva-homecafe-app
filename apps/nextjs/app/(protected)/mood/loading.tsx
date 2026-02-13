export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-6 h-8 w-36 animate-pulse rounded-lg bg-muted" />
      <div className="space-y-8">
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
        <div className="space-y-3">
          {["mood-a", "mood-b", "mood-c"].map((id) => (
            <div key={id} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
