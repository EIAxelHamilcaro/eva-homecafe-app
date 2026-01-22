import { Pressable, Text, View, type ViewProps } from "react-native";

import { cn } from "@/src/libs/utils";

type TimelineEventColor =
  | "pink"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple";

type TimelineEvent = {
  id: string;
  title: string;
  time: string;
  color?: TimelineEventColor;
};

type TimelineProps = ViewProps & {
  title?: string;
  events: TimelineEvent[];
  onEventPress?: (eventId: string) => void;
  showEditButton?: boolean;
  onEdit?: () => void;
  disabled?: boolean;
};

const EVENT_COLORS: Record<TimelineEventColor, { bg: string; border: string }> =
  {
    pink: { bg: "bg-homecafe-pink/20", border: "border-homecafe-pink" },
    orange: { bg: "bg-orange-100", border: "border-orange-400" },
    yellow: { bg: "bg-yellow-100", border: "border-yellow-400" },
    green: { bg: "bg-green-100", border: "border-green-400" },
    blue: { bg: "bg-blue-100", border: "border-blue-400" },
    purple: { bg: "bg-purple-100", border: "border-purple-400" },
  };

const DOT_COLORS: Record<TimelineEventColor, string> = {
  pink: "bg-homecafe-pink",
  orange: "bg-orange-400",
  yellow: "bg-yellow-400",
  green: "bg-green-400",
  blue: "bg-blue-400",
  purple: "bg-purple-400",
};

function Timeline({
  title,
  events,
  onEventPress,
  showEditButton = false,
  onEdit,
  disabled = false,
  className,
  ...props
}: TimelineProps) {
  const handleEventPress = (eventId: string) => {
    if (!disabled && onEventPress) {
      onEventPress(eventId);
    }
  };

  return (
    <View className={cn("gap-3", className)} {...props}>
      {/* Header */}
      {(title || showEditButton) && (
        <View className="flex-row items-center justify-between">
          {title && (
            <Text className="font-semibold text-base text-foreground">
              {title}
            </Text>
          )}
          {showEditButton && onEdit && (
            <Pressable
              onPress={onEdit}
              disabled={disabled}
              className="active:opacity-60"
              accessibilityRole="button"
              accessibilityLabel="Modifier"
            >
              <Text className="text-sm text-primary">Modifier</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Timeline Events */}
      <View className="gap-0">
        {events.map((event, index) => {
          const color = event.color || "pink";
          const colorStyles = EVENT_COLORS[color];
          const dotColor = DOT_COLORS[color];
          const isLast = index === events.length - 1;

          return (
            <View key={event.id} className="flex-row">
              {/* Time Column */}
              <View className="w-12 items-end pr-3">
                <Text className="text-xs text-muted-foreground">
                  {event.time}
                </Text>
              </View>

              {/* Timeline Line & Dot */}
              <View className="w-4 items-center">
                <View className={cn("h-2.5 w-2.5 rounded-full", dotColor)} />
                {!isLast && <View className="w-0.5 flex-1 bg-gray-200" />}
              </View>

              {/* Event Card */}
              <View className="flex-1 pb-3 pl-3">
                <Pressable
                  onPress={() => handleEventPress(event.id)}
                  disabled={disabled || !onEventPress}
                  className={cn(
                    "rounded-lg border-l-4 px-3 py-2",
                    colorStyles.bg,
                    colorStyles.border,
                    onEventPress && "active:opacity-80",
                  )}
                  accessibilityRole="button"
                  accessibilityLabel={event.title}
                >
                  <Text className="text-sm font-medium text-foreground">
                    {event.title}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export {
  Timeline,
  type TimelineProps,
  type TimelineEvent,
  type TimelineEventColor,
};
