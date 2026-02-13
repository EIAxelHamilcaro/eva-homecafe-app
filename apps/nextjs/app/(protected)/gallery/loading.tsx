export default function Loading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 h-8 w-32 animate-pulse rounded-lg bg-muted" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {[
          "gal-a",
          "gal-b",
          "gal-c",
          "gal-d",
          "gal-e",
          "gal-f",
          "gal-g",
          "gal-h",
        ].map((id) => (
          <div
            key={id}
            className="aspect-square animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    </div>
  );
}
