import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

function ShimmerEffect({ children }: { children: React.ReactNode }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

export function NotificationSkeleton() {
  return (
    <ShimmerEffect>
      <View className="flex-row items-start px-4 py-3">
        <View className="h-10 w-10 rounded-full bg-muted" />
        <View className="ml-3 flex-1">
          <View className="mb-2 h-4 w-40 rounded bg-muted" />
          <View className="h-3 w-64 rounded bg-muted" />
        </View>
        <View className="h-3 w-12 rounded bg-muted" />
      </View>
    </ShimmerEffect>
  );
}

export function NotificationListSkeleton() {
  return (
    <View>
      {Array.from({ length: 6 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list never reorders
        <View key={index}>
          <NotificationSkeleton />
          {index < 5 && <View className="mx-4 h-px bg-border" />}
        </View>
      ))}
    </View>
  );
}
