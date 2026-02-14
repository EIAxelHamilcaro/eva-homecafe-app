import { type Href, useRouter } from "expo-router";
import { Globe, Mountain } from "lucide-react-native";
import { useState } from "react";
import { Dimensions, Image, Pressable, Text, View } from "react-native";
import { useFeedGallery } from "@/lib/api/hooks/use-feed-gallery";
import { useTogglePhotoPrivacy } from "@/lib/api/hooks/use-toggle-photo-privacy";
import { useTogglePostPrivacy } from "@/lib/api/hooks/use-toggle-post-privacy";
import { colors } from "@/src/config/colors";
import { useAuth } from "@/src/providers/auth-provider";

const COLUMN_GAP = 8;
const PADDING = 16;
const screenWidth = Dimensions.get("window").width;
const columnWidth = (screenWidth - PADDING * 2 - COLUMN_GAP) / 2;

function PlaceholderCell() {
  return (
    <View
      className="items-center justify-center rounded-md bg-homecafe-beige"
      style={{ width: columnWidth, height: columnWidth * 0.75 }}
    >
      <Mountain size={24} color={colors.mutedForeground} />
    </View>
  );
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
    <View className="rounded-lg border border-border/60 bg-card">
      {/* Header */}
      <View className="p-4 pb-2">
        <Text className="text-xl font-semibold text-foreground">Galerie</Text>
        <Text className="text-sm text-muted-foreground">
          Les photos publiques de toi et tes amis
        </Text>
      </View>

      {/* Content */}
      <View className="px-4 pb-4">
        {(isLoading || photos.length === 0) && (
          <View className="flex-row flex-wrap" style={{ gap: COLUMN_GAP }}>
            <PlaceholderCell />
            <PlaceholderCell />
            <PlaceholderCell />
            <PlaceholderCell />
          </View>
        )}

        {!isLoading && photos.length > 0 && (
          <View className="flex-row flex-wrap" style={{ gap: COLUMN_GAP }}>
            {photos.map((photo, index) => {
              const isOwn = photo.authorId === user?.id;
              const bounceKey = photo.postId ?? photo.photoId ?? "";
              const isBouncing = bouncingIds.has(bounceKey);

              return (
                <Pressable
                  key={`${photo.postId ?? photo.photoId ?? index}-${photo.url}`}
                  onPress={() => {
                    if (photo.postId) {
                      router.push(
                        `/(protected)/(tabs)/journal/post/${photo.postId}` as Href,
                      );
                    }
                  }}
                  style={{ width: columnWidth }}
                  className="relative overflow-hidden rounded-md bg-muted"
                >
                  <Image
                    source={{ uri: photo.url }}
                    style={{ width: columnWidth, height: columnWidth * 0.75 }}
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
                      className="absolute top-1.5 right-1.5 h-8 w-8 items-center justify-center rounded-full bg-emerald-500"
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
          </View>
        )}

        {/* "Voir plus" link */}
        {!isLoading && photos.length > 0 && (
          <Pressable
            onPress={() =>
              router.push("/(protected)/(tabs)/social/gallery" as Href)
            }
            className="mt-4 self-start rounded-full bg-homecafe-pink px-4 py-1.5"
          >
            <Text className="text-sm font-medium text-white">Voir plus</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
