export function MoodEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="text-4xl mb-3">
        <span role="img" aria-label="mood">
          &#127774;
        </span>
      </div>
      <h3 className="text-lg font-semibold">No mood entries yet</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        Start tracking how you feel! Record your first mood above to see your
        history, charts, and trends.
      </p>
    </div>
  );
}
