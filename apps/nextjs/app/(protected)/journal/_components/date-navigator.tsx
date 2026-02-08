"use client";

interface DateNavigatorProps {
  value: string | undefined;
  onChange: (date: string | undefined) => void;
}

export function DateNavigator({ value, onChange }: DateNavigatorProps) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <input
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="rounded-md border bg-background px-3 py-1.5 text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
        >
          Clear
        </button>
      )}
    </div>
  );
}
