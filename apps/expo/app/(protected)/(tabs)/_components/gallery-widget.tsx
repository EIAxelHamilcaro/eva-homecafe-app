import { useRouter } from "expo-router";
import { ChevronRight, Image } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { MOCK_GALLERY_IMAGES } from "@/constants/dashboard-mock-data";
import { colors } from "@/src/config/colors";

export function GalleryWidget() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/(protected)/galerie")}
      className="mb-4 rounded-2xl bg-card p-4 active:opacity-90"
    >
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground">Galerie</Text>
        <View className="flex-row items-center">
          <Text className="mr-1 text-sm text-primary">Voir plus</Text>
          <ChevronRight size={16} color={colors.primary} />
        </View>
      </View>
      <View className="flex-row gap-2">
        {MOCK_GALLERY_IMAGES.map((image) => (
          <View
            key={image.id}
            className="flex-1 aspect-square items-center justify-center rounded-xl"
            style={{ backgroundColor: image.color }}
          >
            <Image size={20} color={colors.white} />
          </View>
        ))}
      </View>
    </Pressable>
  );
}
