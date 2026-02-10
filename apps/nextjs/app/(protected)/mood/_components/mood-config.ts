interface MoodCategoryConfig {
  value: string;
  label: string;
  color: string;
  description: string;
  emoji: string;
}

const MOOD_CATEGORIES: readonly MoodCategoryConfig[] = [
  {
    value: "calme",
    label: "Calme",
    color: "#8EC8F0",
    description: "Serene and peaceful",
    emoji: "\uD83D\uDE0C",
  },
  {
    value: "enervement",
    label: "\u00c9nervement",
    color: "#F28C82",
    description: "Irritated or frustrated",
    emoji: "\uD83D\uDE21",
  },
  {
    value: "excitation",
    label: "Excitation",
    color: "#FFD166",
    description: "Enthusiastic and energized",
    emoji: "\uD83E\uDD29",
  },
  {
    value: "anxiete",
    label: "Anxi\u00e9t\u00e9",
    color: "#B794C0",
    description: "Worried or uneasy",
    emoji: "\uD83D\uDE30",
  },
  {
    value: "tristesse",
    label: "Tristesse",
    color: "#7BA7BC",
    description: "Sad or melancholic",
    emoji: "\uD83D\uDE22",
  },
  {
    value: "bonheur",
    label: "Bonheur",
    color: "#81C784",
    description: "Happy and content",
    emoji: "\uD83D\uDE0A",
  },
  {
    value: "ennui",
    label: "Ennui",
    color: "#BDBDBD",
    description: "Bored or uninspired",
    emoji: "\uD83D\uDE10",
  },
  {
    value: "nervosite",
    label: "Nervosit\u00e9",
    color: "#FF8A65",
    description: "Nervous or on edge",
    emoji: "\uD83D\uDE2C",
  },
  {
    value: "productivite",
    label: "Productivit\u00e9",
    color: "#4DB6AC",
    description: "Focused and productive",
    emoji: "\uD83D\uDCAA",
  },
] as const;

export { MOOD_CATEGORIES };
export type { MoodCategoryConfig };

export function getMoodColor(category: string): string {
  return MOOD_CATEGORIES.find((m) => m.value === category)?.color ?? "#BDBDBD";
}

export function getMoodLabel(category: string): string {
  return MOOD_CATEGORIES.find((m) => m.value === category)?.label ?? category;
}

export function getMoodEmoji(category: string): string {
  return (
    MOOD_CATEGORIES.find((m) => m.value === category)?.emoji ?? "\uD83D\uDE10"
  );
}
