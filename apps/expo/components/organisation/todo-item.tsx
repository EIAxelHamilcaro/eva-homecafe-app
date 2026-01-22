import { Check } from "lucide-react-native";
import { Pressable, Text, View, type ViewProps } from "react-native";

import { cn } from "@/src/libs/utils";

type TodoItemProps = ViewProps & {
  id: string;
  label: string;
  completed?: boolean;
  onToggle?: (id: string, completed: boolean) => void;
  onPress?: (id: string) => void;
  disabled?: boolean;
  checkboxSize?: number;
};

function TodoItem({
  id,
  label,
  completed = false,
  onToggle,
  onPress,
  disabled = false,
  checkboxSize = 20,
  className,
  ...props
}: TodoItemProps) {
  const handleToggle = () => {
    if (!disabled && onToggle) {
      onToggle(id, !completed);
    }
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress(id);
    }
  };

  return (
    <View className={cn("flex-row items-center gap-3", className)} {...props}>
      <Pressable
        onPress={handleToggle}
        disabled={disabled}
        className="active:opacity-60"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        accessibilityLabel={`${label} ${completed ? "completed" : "not completed"}`}
      >
        <View
          className={cn(
            "items-center justify-center rounded-full border-2",
            completed
              ? "border-primary bg-primary"
              : "border-homecafe-grey-light bg-white",
            disabled && "opacity-50",
          )}
          style={{ width: checkboxSize, height: checkboxSize }}
        >
          {completed && (
            <Check size={checkboxSize * 0.6} color="#FFFFFF" strokeWidth={3} />
          )}
        </View>
      </Pressable>
      <Pressable
        onPress={handlePress}
        disabled={disabled || !onPress}
        className={cn("flex-1", onPress && "active:opacity-60")}
      >
        <Text
          className={cn(
            "text-base text-foreground",
            completed && "text-muted-foreground line-through",
            disabled && "opacity-50",
          )}
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

export { TodoItem, type TodoItemProps };
