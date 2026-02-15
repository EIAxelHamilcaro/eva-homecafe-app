import { useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

import { WidgetEmptyState } from "@/components/dashboard/widget-empty-state";
import { useGallery } from "@/lib/api/hooks/use-gallery";
import { colors } from "@/src/config/colors";

export function GalleryWidget() {
  const router = useRouter();
  const { data, isLoading } = useGallery(1, 4);

  const photos = data?.photos ?? [];
  const isEmpty = !isLoading && photos.length === 0;

  if (isEmpty) return <WidgetEmptyState type="gallery" />;

  return (
    <View className="rounded-2xl bg-card p-4">
      <Text className="text-lg font-semibold text-foreground">Galerie</Text>
      <Text className="mb-3 text-sm text-muted-foreground">
        Tes plus belles photos, c'est ici !
      </Text>

      {isLoading && (
        <View className="h-20 items-center justify-center">
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      {!isLoading && photos.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {photos.map((photo) => (
            <View
              key={photo.id}
              className="aspect-square overflow-hidden rounded-md bg-muted"
              style={{ width: "48%" }}
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

      <Pressable
        onPress={() => router.push("/(protected)/galerie")}
        className="mt-4 self-start rounded-full bg-primary px-4 py-1.5 active:opacity-90"
      >
        <Text className="text-sm font-medium text-primary-foreground">
          Voir plus
        </Text>
      </Pressable>
    </View>
  );
}
