import { Pressable, Text, View, type ViewProps } from "react-native";

import { cn } from "@/src/libs/utils";

type LabelColor =
  | "pink"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "red";

type KanbanLabel = {
  id: string;
  color: LabelColor;
  text?: string;
};

type KanbanCardProps = ViewProps & {
  id: string;
  title: string;
  labels?: KanbanLabel[];
  progress?: number;
  onPress?: (id: string) => void;
  disabled?: boolean;
};

const LABEL_COLORS: Record<LabelColor, string> = {
  pink: "bg-homecafe-pink",
  orange: "bg-orange-400",
  yellow: "bg-yellow-400",
  green: "bg-green-400",
  blue: "bg-blue-400",
  purple: "bg-purple-400",
  red: "bg-red-400",
};

function KanbanCard({
  id,
  title,
  labels = [],
  progress,
  onPress,
  disabled = false,
  className,
  ...props
}: KanbanCardProps) {
  const handlePress = () => {
    if (!disabled && onPress) {
      onPress(id);
    }
  };

  const hasProgress = typeof progress === "number";
  const clampedProgress = hasProgress
    ? Math.min(100, Math.max(0, progress))
    : 0;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || !onPress}
      className={cn(
        "rounded-xl border border-homecafe-grey-light bg-white p-3",
        onPress && "active:opacity-80",
        disabled && "opacity-50",
        className,
      )}
      accessibilityRole="button"
      accessibilityLabel={title}
      {...props}
    >
      {/* Labels */}
      {labels.length > 0 && (
        <View className="mb-2 flex-row flex-wrap gap-1">
          {labels.map((label) => (
            <View
              key={label.id}
              className={cn(
                "h-2 rounded-full",
                LABEL_COLORS[label.color],
                label.text ? "px-2 py-0.5" : "w-8",
              )}
            >
              {label.text && (
                <Text className="text-xs text-white">{label.text}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Title */}
      <Text className="text-sm font-medium text-foreground">{title}</Text>

      {/* Progress Bar */}
      {hasProgress && (
        <View className="mt-2">
          <View className="h-1.5 overflow-hidden rounded-full bg-gray-200">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${clampedProgress}%` }}
            />
          </View>
          <Text className="mt-1 text-xs text-muted-foreground">
            {clampedProgress}%
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export { KanbanCard, type KanbanCardProps, type KanbanLabel, type LabelColor };
