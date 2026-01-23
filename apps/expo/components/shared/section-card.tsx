import type { ReactNode } from "react";
import { Text, View, type ViewProps } from "react-native";

import { cn } from "@/src/libs/utils";

type SectionCardProps = ViewProps & {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  showLeftBorder?: boolean;
};

function SectionCard({
  title,
  subtitle,
  icon,
  children,
  className,
  titleClassName,
  subtitleClassName,
  headerClassName,
  contentClassName,
  showLeftBorder = false,
  ...props
}: SectionCardProps) {
  return (
    <View
      className={cn(
        "bg-card rounded-xl border border-border p-4 shadow-sm",
        showLeftBorder && "border-l-4 border-l-primary",
        className,
      )}
      {...props}
    >
      <View className={cn("flex-row items-start gap-2 pb-2", headerClassName)}>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className={cn(
                "text-card-foreground text-lg font-semibold",
                titleClassName,
              )}
            >
              {title}
            </Text>
            {icon && <View>{icon}</View>}
          </View>
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
      </View>
      {children && <View className={cn("", contentClassName)}>{children}</View>}
    </View>
  );
}

export { SectionCard, type SectionCardProps };
