import { Text, View, type ViewProps } from "react-native";

import { cn } from "@/src/libs/utils";

type MoodType =
  | "calme"
  | "enervement"
  | "excitation"
  | "anxiete"
  | "tristesse"
  | "bonheur"
  | "ennui"
  | "nervosite"
  | "productivite";

type MoodItem = {
  key: MoodType;
  label: string;
};

const MOODS: MoodItem[] = [
  { key: "calme", label: "Calme" },
  { key: "enervement", label: "Énervement" },
  { key: "excitation", label: "Excitation" },
  { key: "anxiete", label: "Anxieté" },
  { key: "tristesse", label: "Tristesse" },
  { key: "bonheur", label: "Bonheur" },
  { key: "ennui", label: "Ennui" },
  { key: "nervosite", label: "Nervosité" },
  { key: "productivite", label: "Productivité" },
];

const MOOD_COLORS: Record<MoodType, string> = {
  calme: "bg-mood-calme",
  enervement: "bg-mood-enervement",
  excitation: "bg-mood-excitation",
  anxiete: "bg-mood-anxiete",
  tristesse: "bg-mood-tristesse",
  bonheur: "bg-mood-bonheur",
  ennui: "bg-mood-ennui",
  nervosite: "bg-mood-nervosite",
  productivite: "bg-mood-productivite",
};

type MoodLegendItemProps = {
  mood: MoodItem;
  className?: string;
};

function MoodLegendItem({ mood, className }: MoodLegendItemProps) {
  return (
    <View className={cn("flex-row items-center gap-2", className)}>
      <View
        className={cn("h-3 w-3 rounded-full", MOOD_COLORS[mood.key])}
        accessibilityLabel={mood.label}
      />
      <Text className="text-foreground text-sm">{mood.label}</Text>
    </View>
  );
}

type MoodLegendProps = ViewProps & {
  title?: string;
  subtitle?: string;
  className?: string;
  showCard?: boolean;
};

function MoodLegend({
  title = "Légende",
  subtitle = "Palette d'humeurs",
  className,
  showCard = true,
  ...props
}: MoodLegendProps) {
  const content = (
    <>
      <View className="mb-3">
        <Text className="text-foreground text-lg font-semibold">{title}</Text>
        {subtitle && (
          <Text className="text-muted-foreground text-sm">{subtitle}</Text>
        )}
      </View>
      <View className="flex-row flex-wrap gap-x-6 gap-y-2">
        {MOODS.map((mood) => (
          <MoodLegendItem key={mood.key} mood={mood} />
        ))}
      </View>
    </>
  );

  if (!showCard) {
    return (
      <View className={cn("", className)} {...props}>
        {content}
      </View>
    );
  }

  return (
    <View
      className={cn(
        "bg-card rounded-xl border border-border p-4 shadow-sm",
        className,
      )}
      {...props}
    >
      {content}
    </View>
  );
}

export {
  MoodLegend,
  MoodLegendItem,
  MOODS,
  MOOD_COLORS,
  type MoodLegendProps,
  type MoodType,
  type MoodItem,
};
