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

export function ConversationSkeleton() {
  return (
    <ShimmerEffect>
      <View className="flex-row items-center px-4 py-3">
        <View className="h-12 w-12 rounded-full bg-muted" />
        <View className="ml-3 flex-1">
          <View className="mb-2 h-4 w-32 rounded bg-muted" />
          <View className="h-3 w-48 rounded bg-muted" />
        </View>
        <View className="h-3 w-12 rounded bg-muted" />
      </View>
    </ShimmerEffect>
  );
}

export function ConversationListSkeleton() {
  return (
    <View>
      {Array.from({ length: 6 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list never reorders
        <View key={index}>
          <ConversationSkeleton />
          {index < 5 && <View className="mx-4 h-px bg-border" />}
        </View>
      ))}
    </View>
  );
}

export function MessageSkeleton({ isSent }: { isSent: boolean }) {
  return (
    <ShimmerEffect>
      <View className={`my-1 px-4 ${isSent ? "items-end" : "items-start"}`}>
        <View
          className={`rounded-2xl bg-muted px-4 py-2 ${
            isSent ? "rounded-br-sm" : "rounded-bl-sm"
          }`}
          style={{ width: Math.random() * 100 + 100 }}
        >
          <View className="mb-1 h-4 w-full rounded bg-muted-foreground/20" />
          <View className="h-4 w-3/4 rounded bg-muted-foreground/20" />
        </View>
        <View className="mt-1 h-2 w-10 rounded bg-muted" />
      </View>
    </ShimmerEffect>
  );
}

export function MessageListSkeleton() {
  const pattern = [true, true, false, true, false, false, true, false];
  return (
    <View className="flex-1 py-2">
      {pattern.map((isSent, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list never reorders
        <MessageSkeleton key={index} isSent={isSent} />
      ))}
    </View>
  );
}

export function RecipientSkeleton() {
  return (
    <ShimmerEffect>
      <View className="flex-row items-center px-4 py-3">
        <View className="h-12 w-12 rounded-full bg-muted" />
        <View className="ml-3 flex-1">
          <View className="h-4 w-40 rounded bg-muted" />
        </View>
        <View className="h-6 w-6 rounded bg-muted" />
      </View>
    </ShimmerEffect>
  );
}

export function RecipientListSkeleton() {
  return (
    <View>
      {Array.from({ length: 5 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list never reorders
        <View key={index}>
          <RecipientSkeleton />
          {index < 4 && <View className="mx-4 h-px bg-border" />}
        </View>
      ))}
    </View>
  );
}
