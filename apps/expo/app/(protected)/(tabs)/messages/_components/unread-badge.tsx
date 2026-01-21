import { Text, View } from "react-native";
import { cn } from "@/src/libs/utils";

interface UnreadBadgeProps {
  count: number;
  className?: string;
}

export function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > 99 ? "99+" : count.toString();

  return (
    <View
      className={cn(
        "min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5",
        className,
      )}
    >
      <Text className="text-xs font-semibold text-white">{displayCount}</Text>
    </View>
  );
}
