import * as React from "react";
import {
  Animated,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  PanResponder,
  View,
  type ViewProps,
} from "react-native";

import { cn } from "@/src/libs/utils";

type SliderProps = ViewProps & {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  disabled?: boolean;
  className?: string;
  trackClassName?: string;
  thumbClassName?: string;
  activeTrackClassName?: string;
};

function Slider({
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  onSlidingComplete,
  disabled = false,
  className,
  trackClassName,
  thumbClassName,
  activeTrackClassName,
  ...props
}: SliderProps) {
  const [sliderWidth, setSliderWidth] = React.useState(0);
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const currentValue = React.useRef(value);

  const clampValue = React.useCallback(
    (val: number): number => {
      const clamped = Math.min(Math.max(val, min), max);
      if (step > 0) {
        return Math.round(clamped / step) * step;
      }
      return clamped;
    },
    [min, max, step],
  );

  const valueToPosition = React.useCallback(
    (val: number): number => {
      if (sliderWidth === 0 || max === min) return 0;
      return ((val - min) / (max - min)) * sliderWidth;
    },
    [sliderWidth, min, max],
  );

  const positionToValue = React.useCallback(
    (position: number): number => {
      if (sliderWidth === 0) return min;
      const ratio = position / sliderWidth;
      return clampValue(min + ratio * (max - min));
    },
    [sliderWidth, min, max, clampValue],
  );

  React.useEffect(() => {
    const position = valueToPosition(value);
    animatedValue.setValue(position);
    currentValue.current = value;
  }, [value, valueToPosition, animatedValue]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width);
  };

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (event: GestureResponderEvent) => {
          const { locationX } = event.nativeEvent;
          const newValue = positionToValue(locationX);
          currentValue.current = newValue;
          animatedValue.setValue(valueToPosition(newValue));
          onValueChange?.(newValue);
        },
        onPanResponderMove: (event: GestureResponderEvent) => {
          const { locationX } = event.nativeEvent;
          const clampedX = Math.min(Math.max(locationX, 0), sliderWidth);
          const newValue = positionToValue(clampedX);
          currentValue.current = newValue;
          animatedValue.setValue(valueToPosition(newValue));
          onValueChange?.(newValue);
        },
        onPanResponderRelease: () => {
          onSlidingComplete?.(currentValue.current);
        },
      }),
    [
      disabled,
      sliderWidth,
      positionToValue,
      valueToPosition,
      animatedValue,
      onValueChange,
      onSlidingComplete,
    ],
  );

  const thumbSize = 24;
  const thumbOffset = thumbSize / 2;

  return (
    <View
      className={cn("h-10 justify-center", className)}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
      {...props}
    >
      <View
        className={cn(
          "h-2 rounded-full bg-muted",
          disabled && "opacity-50",
          trackClassName,
        )}
      >
        <Animated.View
          className={cn("h-full rounded-full bg-primary", activeTrackClassName)}
          style={{
            width: animatedValue,
          }}
        />
      </View>
      <Animated.View
        className={cn(
          "absolute h-6 w-6 rounded-full border-2 border-primary bg-white shadow-sm",
          disabled && "opacity-50",
          thumbClassName,
        )}
        style={{
          transform: [
            {
              translateX: Animated.subtract(animatedValue, thumbOffset),
            },
          ],
        }}
      />
    </View>
  );
}

export { Slider, type SliderProps };
