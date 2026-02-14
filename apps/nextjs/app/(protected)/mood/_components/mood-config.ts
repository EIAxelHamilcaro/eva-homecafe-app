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
    color: "#0062DD",
    description: "Serene and peaceful",
    emoji: "\uD83D\uDE0C",
  },
  {
    value: "enervement",
    label: "\u00c9nervement",
    color: "#F21622",
    description: "Irritated or frustrated",
    emoji: "\uD83D\uDE21",
  },
  {
    value: "excitation",
    label: "Excitation",
    color: "#F691C3",
    description: "Enthusiastic and energized",
    emoji: "\uD83E\uDD29",
  },
  {
    value: "anxiete",
    label: "Anxi\u00e9t\u00e9",
    color: "#DADADA",
    description: "Worried or uneasy",
    emoji: "\uD83D\uDE30",
  },
  {
    value: "tristesse",
    label: "Tristesse",
    color: "#000000",
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
    color: "#FDECCE",
    description: "Bored or uninspired",
    emoji: "\uD83D\uDE10",
  },
  {
    value: "nervosite",
    label: "Nervosit\u00e9",
    color: "#F46604",
    description: "Nervous or on edge",
    emoji: "\uD83D\uDE2C",
  },
  {
    value: "productivite",
    label: "Productivit\u00e9",
    color: "#FDCB08",
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
