import { router } from "expo-router";
import { X } from "lucide-react-native";
import { Pressable, SafeAreaView, ScrollView, View } from "react-native";

import {
  StickerItem,
  type StickerType,
} from "@/components/stickers/sticker-item";

const allStickers: StickerType[] = [
  "bubble_tea",
  "envelope_heart",
  "coffee_cup",
  "notebook",
  "heart_face",
  "cloud_happy",
  "cloud_sad",
  "sparkles",
  "tape_green",
  "tape_yellow",
  "tape_blue",
];

export default function StickersModal() {
  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/(tabs)");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {/* Close button */}
        <View className="absolute right-4 top-4 z-10">
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink bg-background active:bg-muted"
            accessibilityRole="button"
            accessibilityLabel="Fermer"
          >
            <X size={20} color="#3D2E2E" strokeWidth={2} />
          </Pressable>
        </View>

        {/* Sticker list */}
        <ScrollView
          className="flex-1 pt-16"
          contentContainerStyle={{ paddingBottom: 32, alignItems: "center" }}
          showsVerticalScrollIndicator={false}
        >
          {allStickers.map((stickerType) => (
            <View key={stickerType} className="mb-6">
              <StickerItem type={stickerType} size={100} />
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
