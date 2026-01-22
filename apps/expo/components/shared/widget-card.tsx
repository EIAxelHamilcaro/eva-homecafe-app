import type { ReactNode } from "react";
import { Text, TouchableOpacity, View, type ViewProps } from "react-native";

import { cn } from "../../src/libs/utils";

type WidgetCardProps = ViewProps & {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  contentClassName?: string;
  showVoirPlus?: boolean;
  voirPlusLabel?: string;
  onVoirPlusPress?: () => void;
};

function WidgetCard({
  title,
  subtitle,
  children,
  className,
  titleClassName,
  subtitleClassName,
  contentClassName,
  showVoirPlus = true,
  voirPlusLabel = "Voir plus",
  onVoirPlusPress,
  ...props
}: WidgetCardProps) {
  return (
    <View
      className={cn(
        "bg-card rounded-xl border border-border p-4 shadow-sm",
        className,
      )}
      {...props}
    >
      <View className="pb-2">
        <Text
          className={cn(
            "text-card-foreground text-lg font-semibold",
            titleClassName,
          )}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            className={cn(
              "text-muted-foreground text-sm mt-0.5",
              subtitleClassName,
            )}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {children && (
        <View className={cn("py-2", contentClassName)}>{children}</View>
      )}

      {showVoirPlus && onVoirPlusPress && (
        <TouchableOpacity
          onPress={onVoirPlusPress}
          className="bg-primary rounded-full px-4 py-2 self-start mt-2"
          activeOpacity={0.8}
        >
          <Text className="text-primary-foreground text-sm font-medium">
            {voirPlusLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export { WidgetCard, type WidgetCardProps };
