import { useRouter } from "expo-router";
import { Mountain } from "lucide-react-native";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

import { Card, CardContent } from "@/components/ui/card";
import { useGallery } from "@/lib/api/hooks/use-gallery";
import { colors } from "@/src/config/colors";

function GalleryGrid({ children }: { children: React.ReactNode[] }) {
  const row1 = children.slice(0, 2);
  const row2 = children.slice(2, 4);
  return (
    <View className="gap-2">
      <View className="flex-row gap-2">{row1}</View>
      {row2.length > 0 && <View className="flex-row gap-2">{row2}</View>}
    </View>
  );
}

function GalleryEmpty() {
  const router = useRouter();
  return (
    <Card>
      <CardContent className="p-6">
        <Text className="text-lg font-semibold text-foreground">Galerie</Text>
        <Text className="mb-3 text-sm text-muted-foreground">
          Tes plus belles photos, c'est ici !
        </Text>
        <GalleryGrid>
          {["a", "b", "c", "d"].map((key) => (
            <View
              key={key}
              className="flex-1 aspect-square items-center justify-center rounded-md bg-homecafe-beige"
            >
              <Mountain size={24} color={`${colors.mutedForeground}80`} />
            </View>
          ))}
        </GalleryGrid>
        <Pressable
          onPress={() => router.push("/(protected)/galerie")}
          className="mt-4 self-start rounded-full bg-homecafe-pink px-4 py-1.5 active:opacity-90"
        >
          <Text className="text-sm font-medium text-white">Voir plus</Text>
        </Pressable>
      </CardContent>
    </Card>
  );
}

export function JournalGallery() {
  const router = useRouter();
  const { data, isLoading } = useGallery(1, 4);

  const photos = data?.data ?? [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Text className="text-lg font-semibold text-foreground">Galerie</Text>
          <Text className="mb-3 text-sm text-muted-foreground">
            Tes plus belles photos, c'est ici !
          </Text>
          <View className="h-20 items-center justify-center">
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        </CardContent>
      </Card>
    );
  }

  if (photos.length === 0) return <GalleryEmpty />;

  return (
    <Card>
      <CardContent className="p-6">
        <Text className="text-lg font-semibold text-foreground">Galerie</Text>
        <Text className="mb-3 text-sm text-muted-foreground">
          Tes plus belles photos, c'est ici !
        </Text>
        <GalleryGrid>
          {photos.map((photo) => (
            <View
              key={photo.id}
              className="flex-1 aspect-square overflow-hidden rounded-md bg-muted"
            >
              <Image
                source={{ uri: photo.url }}
                className="h-full w-full"
                resizeMode="cover"
              />
            </View>
          ))}
        </GalleryGrid>
        <Pressable
          onPress={() => router.push("/(protected)/galerie")}
          className="mt-4 self-start rounded-full bg-homecafe-pink px-4 py-1.5 active:opacity-90"
        >
          <Text className="text-sm font-medium text-white">Voir plus</Text>
        </Pressable>
      </CardContent>
    </Card>
  );
}
