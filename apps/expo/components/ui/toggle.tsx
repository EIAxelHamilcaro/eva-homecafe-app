import * as React from "react";
import { Animated, Pressable, Text } from "react-native";

import { cn } from "@/src/libs/utils";

const TOGGLE_WIDTH = 48;
const TOGGLE_HEIGHT = 28;
const THUMB_SIZE = 22;
const THUMB_MARGIN = 3;
const TRAVEL_DISTANCE = TOGGLE_WIDTH - THUMB_SIZE - THUMB_MARGIN * 2;

type ToggleProps = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  labelClassName?: string;
};

function Toggle({
  checked = false,
  onCheckedChange,
  disabled = false,
  label,
  className,
  labelClassName,
}: ToggleProps) {
  const animatedValue = React.useRef(
    new Animated.Value(checked ? 1 : 0),
  ).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: checked ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [checked, animatedValue]);

  const handlePress = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  const trackBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E5E7EB", "#F691C3"],
  });

  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRAVEL_DISTANCE],
  });

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={cn("flex-row items-center gap-3", className)}
    >
      <Animated.View
        style={{
          width: TOGGLE_WIDTH,
          height: TOGGLE_HEIGHT,
          borderRadius: TOGGLE_HEIGHT / 2,
          backgroundColor: trackBackgroundColor,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Animated.View
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            margin: THUMB_MARGIN,
            backgroundColor: "#FFFFFF",
            transform: [{ translateX: thumbTranslateX }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        />
      </Animated.View>
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

export { Toggle, type ToggleProps };
