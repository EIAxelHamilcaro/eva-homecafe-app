export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-6 h-8 w-40 animate-pulse rounded-lg bg-muted" />
      <div className="mb-4 flex gap-2">
        {["tab-a", "tab-b", "tab-c"].map((id) => (
          <div
            key={id}
            className="h-9 w-24 animate-pulse rounded-md bg-muted"
          />
        ))}
      </div>
      <div className="mx-auto max-w-2xl space-y-3">
        {["todo-a", "todo-b", "todo-c", "todo-d", "todo-e"].map((id) => (
          <div key={id} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
