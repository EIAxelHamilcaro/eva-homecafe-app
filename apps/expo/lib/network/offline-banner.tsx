import { WifiOff } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/src/config/colors";
import { useNetwork } from "./network-context";

export function OfflineBanner() {
  const { isOnline, checkConnection } = useNetwork();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    if (!isOnline) {
      setVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (visible) {
      Animated.timing(slideAnim, {
        toValue: -60,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [isOnline, visible, slideAnim]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9998,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View
        style={{
          backgroundColor: colors.status.offline,
          paddingTop: insets.top,
        }}
      >
        <Pressable
          onPress={() => checkConnection()}
          className="flex-row items-center justify-center gap-2 px-4 py-2"
        >
          <WifiOff size={16} color={colors.white} />
          <Text className="text-sm font-medium text-white">
            Pas de connexion internet
          </Text>
          <Text className="text-xs text-white/70">Appuyez pour réessayer</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
