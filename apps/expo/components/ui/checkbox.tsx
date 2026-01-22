import { Check } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { cn } from "@/src/libs/utils";

type CheckboxProps = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  labelClassName?: string;
};

function Checkbox({
  checked = false,
  onCheckedChange,
  disabled = false,
  label,
  className,
  labelClassName,
}: CheckboxProps) {
  const handlePress = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={cn("flex-row items-center gap-3", className)}
    >
      <View
        className={cn(
          "h-5 w-5 items-center justify-center rounded border-2",
          checked
            ? "border-primary bg-primary"
            : "border-homecafe-grey-light bg-white",
          disabled && "opacity-50",
        )}
      >
        {checked && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
      </View>
      {label && (
        <Text
          className={cn(
            "text-base text-foreground",
            disabled && "opacity-50",
            labelClassName,
          )}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export { Checkbox, type CheckboxProps };
