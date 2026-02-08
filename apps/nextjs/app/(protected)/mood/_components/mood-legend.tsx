"use client";

const MOOD_LEGEND = [
  {
    value: "calme",
    label: "Calme",
    color: "#8EC8F0",
    description: "Serene and peaceful",
  },
  {
    value: "enervement",
    label: "\u00c9nervement",
    color: "#F28C82",
    description: "Irritated or frustrated",
  },
  {
    value: "excitation",
    label: "Excitation",
    color: "#FFD166",
    description: "Enthusiastic and energized",
  },
  {
    value: "anxiete",
    label: "Anxi\u00e9t\u00e9",
    color: "#B794C0",
    description: "Worried or uneasy",
  },
  {
    value: "tristesse",
    label: "Tristesse",
    color: "#7BA7BC",
    description: "Sad or melancholic",
  },
  {
    value: "bonheur",
    label: "Bonheur",
    color: "#81C784",
    description: "Happy and content",
  },
  {
    value: "ennui",
    label: "Ennui",
    color: "#BDBDBD",
    description: "Bored or uninspired",
  },
  {
    value: "nervosite",
    label: "Nervosit\u00e9",
    color: "#FF8A65",
    description: "Nervous or on edge",
  },
  {
    value: "productivite",
    label: "Productivit\u00e9",
    color: "#4DB6AC",
    description: "Focused and productive",
  },
] as const;

export { MOOD_LEGEND };

export function getMoodColor(category: string): string {
  return MOOD_LEGEND.find((m) => m.value === category)?.color ?? "#BDBDBD";
}

export function getMoodLabel(category: string): string {
  return MOOD_LEGEND.find((m) => m.value === category)?.label ?? category;
}

export function MoodLegend() {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Mood Legend
      </h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {MOOD_LEGEND.map((mood) => (
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
