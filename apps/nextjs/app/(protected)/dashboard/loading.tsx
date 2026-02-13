export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4 rounded-xl bg-homecafe-green/10 p-4">
          {["col1-a", "col1-b", "col1-c"].map((id) => (
            <div key={id} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-4 rounded-xl bg-homecafe-pink/10 p-4">
          {["col2-a", "col2-b"].map((id) => (
            <div key={id} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-4 rounded-xl bg-homecafe-orange/10 p-4">
          {["col3-a", "col3-b", "col3-c"].map((id) => (
            <div key={id} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
