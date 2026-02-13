import { type Href, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

import { useMoodboards } from "@/lib/api/hooks/use-moodboards";
import { colors } from "@/src/config/colors";

function PinThumbnail({
  pin,
}: {
  pin: {
    type: "image" | "color";
    imageUrl: string | null;
    color: string | null;
  };
}) {
  if (pin.type === "image" && pin.imageUrl) {
    return (
      <Image
        source={{ uri: pin.imageUrl }}
        className="h-full w-full"
        resizeMode="cover"
      />
    );
  }
  return (
    <View
      className="h-full w-full"
      style={{ backgroundColor: pin.color ?? "#E5E5E5" }}
    />
  );
}

export function MoodboardWidget() {
  const router = useRouter();
  const { data, isLoading } = useMoodboards(1, 1);

  const moodboard = data?.moodboards?.[0];
  const isEmpty = !isLoading && !moodboard;

  return (
    <Pressable
      onPress={() => router.push("/(protected)/inspirations" as Href)}
      className="rounded-2xl bg-card p-4 active:opacity-90"
    >
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground">Moodboard</Text>
        <View className="rounded-full bg-homecafe-green px-4 py-1.5">
          <Text className="text-sm font-medium text-white">Voir plus</Text>
        </View>
      </View>

      {isLoading && (
        <View className="h-20 items-center justify-center">
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      {isEmpty && (
        <Pressable
          onPress={() => router.push("/(protected)/inspirations" as Href)}
          className="flex-row items-center justify-center gap-2 rounded-xl bg-muted/50 py-6"
        >
          <Plus size={18} color="#B8A898" strokeWidth={2} />
          <Text className="text-sm text-muted-foreground">
            Crée ton premier moodboard
          </Text>
        </Pressable>
      )}

      {!isLoading && moodboard && (
        <View>
          <Text
            className="mb-2 text-sm font-medium text-foreground"
            numberOfLines={1}
          >
            {moodboard.title}
          </Text>
          {moodboard.previewPins.length > 0 ? (
            <View className="flex-row gap-2">
              {moodboard.previewPins.slice(0, 4).map((pin) => (
                <View
                  key={pin.id}
                  className="flex-1 aspect-square overflow-hidden rounded-xl"
                >
                  <PinThumbnail pin={pin} />
                </View>
              ))}
              {moodboard.previewPins.length < 4 &&
                Array.from(
                  { length: 4 - moodboard.previewPins.length },
                  (_, i) => `widget-empty-${moodboard.id}-${i}`,
                ).map((key) => (
                  <View
                    key={key}
                    className="flex-1 aspect-square rounded-xl bg-muted"
                  />
                ))}
            </View>
          ) : (
            <View className="flex-row items-center justify-center gap-2 rounded-xl bg-muted/50 py-4">
              <Text className="text-xs text-muted-foreground">
                Aucun pin — ajoutes-en un
              </Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}
