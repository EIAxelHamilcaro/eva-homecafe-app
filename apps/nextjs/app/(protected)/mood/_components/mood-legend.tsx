"use client";

import { MOOD_CATEGORIES } from "./mood-config";

export function MoodLegend() {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Mood Legend
      </h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {MOOD_CATEGORIES.map((mood) => (
          <div
            key={mood.value}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <div
              className="h-4 w-4 shrink-0 rounded-full"
              style={{ backgroundColor: mood.color }}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium">{mood.label}</p>
              <p className="text-xs text-muted-foreground truncate">
                {mood.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
