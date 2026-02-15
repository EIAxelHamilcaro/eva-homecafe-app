import { type Href, useRouter } from "expo-router";
import { Globe, Mountain } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import { useFeedGallery } from "@/lib/api/hooks/use-feed-gallery";
import { useTogglePhotoPrivacy } from "@/lib/api/hooks/use-toggle-photo-privacy";
import { useTogglePostPrivacy } from "@/lib/api/hooks/use-toggle-post-privacy";
import { colors } from "@/src/config/colors";
import { useAuth } from "@/src/providers/auth-provider";

const GAP = 8;

function chunk<T>(arr: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    rows.push(arr.slice(i, i + size));
  }
  return rows;
}

export function SocialGallery() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading } = useFeedGallery(1, 10);
  const togglePostPrivacy = useTogglePostPrivacy();
  const togglePhotoPrivacy = useTogglePhotoPrivacy();
  const [bouncingIds, setBouncingIds] = useState<Set<string>>(new Set());
  const photos = data?.photos ?? [];

  function bounce(id: string) {
    setBouncingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setBouncingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 400);
  }

  function handleTogglePostPrivacy(postId: string) {
    bounce(postId);
    togglePostPrivacy.mutate({ postId, isPrivate: true });
  }

  function handleTogglePhotoPrivacy(photoId: string) {
    bounce(photoId);
    togglePhotoPrivacy.mutate({ photoId, isPrivate: true });
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Text className="text-lg font-semibold text-foreground">Galerie</Text>
        <Text className="mb-3 text-sm text-muted-foreground">
          Les photos publiques de toi et tes amis
        </Text>

        {(isLoading || photos.length === 0) && (
          <View style={{ gap: GAP }}>
            {[0, 1].map((row) => (
              <View key={row} className="flex-row" style={{ gap: GAP }}>
                <View
                  className="flex-1 items-center justify-center rounded-md bg-homecafe-beige"
                  style={{ aspectRatio: 4 / 3 }}
                >
                  <Mountain size={24} color={colors.mutedForeground} />
                </View>
                <View
                  className="flex-1 items-center justify-center rounded-md bg-homecafe-beige"
                  style={{ aspectRatio: 4 / 3 }}
                >
                  <Mountain size={24} color={colors.mutedForeground} />
                </View>
              </View>
            ))}
          </View>
        )}

        {!isLoading && photos.length > 0 && (
          <View style={{ gap: GAP }}>
            {chunk(photos, 2).map((row) => (
              <View
                key={row[0]?.postId ?? row[0]?.photoId ?? row[0]?.url}
                className="flex-row"
                style={{ gap: GAP }}
              >
                {row.map((photo) => {
                  const isOwn = photo.authorId === user?.id;
                  const bounceKey = photo.postId ?? photo.photoId ?? "";
                  const isBouncing = bouncingIds.has(bounceKey);

                  return (
                    <Pressable
                      key={`${photo.postId ?? photo.photoId}-${photo.url}`}
                      onPress={() => {
                        if (photo.postId) {
                          router.push(
                            `/(protected)/(tabs)/journal/post/${photo.postId}` as Href,
                          );
                        }
                      }}
                      className="relative flex-1 overflow-hidden rounded-md bg-muted"
                      style={{ aspectRatio: 4 / 3 }}
                    >
                      <Image
                        source={{ uri: photo.url }}
                        className="absolute inset-0"
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                      {isOwn && (
                        <Pressable
                          onPress={() => {
                            if (photo.postId) {
                              handleTogglePostPrivacy(photo.postId);
                            } else if (photo.photoId) {
                              handleTogglePhotoPrivacy(photo.photoId);
                            }
                          }}
                          className="absolute right-1.5 top-1.5 h-8 w-8 items-center justify-center rounded-full bg-emerald-500"
                          style={
                            isBouncing
                              ? { transform: [{ scale: 1.25 }] }
                              : undefined
                          }
                        >
                          <Globe size={16} color="#fff" />
                        </Pressable>
                      )}
                    </Pressable>
                  );
                })}
                {row.length === 1 && <View className="flex-1" />}
              </View>
            ))}
          </View>
        )}

        {!isLoading && photos.length > 0 && (
          <Pressable
            onPress={() =>
              router.push("/(protected)/(tabs)/social/gallery" as Href)
            }
            className="mt-4 self-start rounded-full bg-primary px-4 py-1.5 active:opacity-90"
          >
            <Text className="text-sm font-medium text-primary-foreground">
              Voir plus
            </Text>
          </Pressable>
        )}
      </CardContent>
    </Card>
  );
}
