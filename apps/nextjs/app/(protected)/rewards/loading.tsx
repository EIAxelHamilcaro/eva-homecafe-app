export default function Loading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 h-8 w-32 animate-pulse rounded-lg bg-muted" />
      <div className="mb-4 flex gap-2">
        {["rtab-a", "rtab-b"].map((id) => (
          <div
            key={id}
            className="h-9 w-24 animate-pulse rounded-md bg-muted"
          />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {[
          "reward-a",
          "reward-b",
          "reward-c",
          "reward-d",
          "reward-e",
          "reward-f",
        ].map((id) => (
          <div key={id} className="h-36 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
