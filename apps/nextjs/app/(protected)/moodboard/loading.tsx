export default function Loading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 h-8 w-36 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {["board-a", "board-b", "board-c", "board-d", "board-e", "board-f"].map(
          (id) => (
            <div key={id} className="h-48 animate-pulse rounded-xl bg-muted" />
          ),
        )}
      </div>
    </div>
  );
}
