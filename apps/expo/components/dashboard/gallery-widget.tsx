import { useRouter } from "expo-router";
import { ChevronRight, Plus } from "lucide-react-native";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

import { useGallery } from "@/lib/api/hooks/use-gallery";
import { colors } from "@/src/config/colors";

export function GalleryWidget() {
  const router = useRouter();
  const { data, isLoading } = useGallery(1, 4);

  const photos = data?.data ?? [];
  const isEmpty = !isLoading && photos.length === 0;

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

      {isLoading && (
        <View className="h-20 items-center justify-center">
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      {isEmpty && (
        <Pressable
          onPress={() => router.push("/(protected)/galerie")}
          className="flex-row items-center justify-center gap-2 rounded-xl bg-muted/50 py-6"
        >
          <Plus size={18} color="#B8A898" strokeWidth={2} />
          <Text className="text-sm text-muted-foreground">
            Ajoute ta première photo
          </Text>
        </Pressable>
      )}

      {!isLoading && photos.length > 0 && (
        <View className="flex-row gap-2">
          {photos.map((photo) => (
            <View
              key={photo.id}
              className="flex-1 aspect-square overflow-hidden rounded-xl"
            >
              <Image
                source={{ uri: photo.url }}
                className="h-full w-full"
                resizeMode="cover"
              />
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}
