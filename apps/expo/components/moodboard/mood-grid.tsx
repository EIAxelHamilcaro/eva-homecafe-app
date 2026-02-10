import { Pressable, Text, View, type ViewProps } from "react-native";

import { cn } from "@/src/libs/utils";
import { MOOD_COLORS, type MoodType } from "./mood-legend";

type DayOfWeek = "L" | "M" | "Me" | "J" | "V" | "S" | "D";

type DayMood = {
  day: DayOfWeek;
  mood: MoodType | null;
};

const DAYS_OF_WEEK: DayOfWeek[] = ["L", "M", "Me", "J", "V", "S", "D"];

const DAY_LABELS: Record<DayOfWeek, string> = {
  L: "Lundi",
  M: "Mardi",
  Me: "Mercredi",
  J: "Jeudi",
  V: "Vendredi",
  S: "Samedi",
  D: "Dimanche",
};

type MoodGridCellProps = {
  day: DayOfWeek;
  mood: MoodType | null;
  onPress?: (day: DayOfWeek) => void;
  isSelected?: boolean;
};

function MoodGridCell({ day, mood, onPress, isSelected }: MoodGridCellProps) {
  const handlePress = () => {
    onPress?.(day);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="items-center"
      accessibilityLabel={`${DAY_LABELS[day]}${mood ? `, humeur: ${mood}` : ""}`}
      accessibilityRole="button"
    >
      <Text
        className={cn(
          "text-foreground mb-1 text-sm font-medium",
          isSelected && "text-primary font-bold",
        )}
      >
        {day}
      </Text>
      <View
        className={cn(
          "h-6 w-6 rounded",
          mood ? MOOD_COLORS[mood] : "bg-homecafe-grey-light",
          isSelected && "ring-2 ring-primary ring-offset-1",
        )}
      />
    </Pressable>
  );
}

type MoodGridProps = ViewProps & {
  moods?: DayMood[];
  selectedDay?: DayOfWeek | null;
  onDayPress?: (day: DayOfWeek) => void;
  onValidate?: () => void;
  onViewFullGraph?: () => void;
  title?: string;
  subtitle?: string;
  showCard?: boolean;
  showActions?: boolean;
  className?: string;
};

function MoodGrid({
  moods,
  selectedDay,
  onDayPress,
  onValidate,
  onViewFullGraph,
  title = "Que ressens-tu aujourd'hui ?",
  subtitle = "Colore la case du jour pour un suivi des émotions poussé !",
  showCard = true,
  showActions = true,
  className,
  ...props
}: MoodGridProps) {
  const defaultMoods: DayMood[] = DAYS_OF_WEEK.map((day) => ({
    day,
    mood: null,
  }));

  const gridMoods = moods ?? defaultMoods;

  const getMoodForDay = (day: DayOfWeek): MoodType | null => {
    return gridMoods.find((m) => m.day === day)?.mood ?? null;
  };

  const content = (
    <>
      <View className="mb-4">
        <Text className="text-foreground text-lg font-semibold">{title}</Text>
        {subtitle && (
          <Text className="text-muted-foreground text-sm">{subtitle}</Text>
        )}
      </View>

      <View className="mb-4 flex-row justify-between px-2">
        {DAYS_OF_WEEK.map((day) => (
          <MoodGridCell
            key={day}
            day={day}
            mood={getMoodForDay(day)}
            onPress={onDayPress}
            isSelected={selectedDay === day}
          />
        ))}
      </View>

      {showActions && (
        <View className="flex-row items-center justify-center gap-3">
          <Pressable
            onPress={onViewFullGraph}
            className="rounded-full border border-border px-4 py-2 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Voir le graphique entier"
          >
            <Text className="text-foreground text-sm">
              Voir le graphique entier
            </Text>
          </Pressable>
          {onValidate && (
            <Pressable
              onPress={onValidate}
              className="bg-primary rounded-full px-6 py-2 active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Valider"
            >
              <Text className="text-sm font-medium text-white">Valider</Text>
            </Pressable>
          )}
        </View>
      )}
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
  MoodGrid,
  MoodGridCell,
  DAYS_OF_WEEK,
  DAY_LABELS,
  type MoodGridProps,
  type MoodGridCellProps,
  type DayOfWeek,
  type DayMood,
};
