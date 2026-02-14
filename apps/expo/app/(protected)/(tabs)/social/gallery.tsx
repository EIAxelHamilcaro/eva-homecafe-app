import { type Href, useRouter } from "expo-router";
import { ArrowLeft, Globe, Mountain, User } from "lucide-react-native";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFeedGallery } from "@/lib/api/hooks/use-feed-gallery";
import { useTogglePhotoPrivacy } from "@/lib/api/hooks/use-toggle-photo-privacy";
import { useTogglePostPrivacy } from "@/lib/api/hooks/use-toggle-post-privacy";
import { colors } from "@/src/config/colors";
import { useAuth } from "@/src/providers/auth-provider";

const COLUMN_GAP = 12;
const PADDING = 16;
const screenWidth = Dimensions.get("window").width;
const columnWidth = (screenWidth - PADDING * 2 - COLUMN_GAP) / 2;
const ROW_HEIGHT = 128;

const TALL_POSITIONS = new Set([0, 5]);
function isTall(index: number): boolean {
  return TALL_POSITIONS.has(index % 6);
}

export default function PublicGalleryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useFeedGallery(page, 20);
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
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: PADDING, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6 flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-muted"
          >
            <ArrowLeft size={20} color={colors.foreground} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-2xl font-semibold text-foreground">
              Galerie publique
            </Text>
            <Text className="text-sm text-muted-foreground">
              Toutes les photos publiques de toi et tes amis
            </Text>
          </View>
        </View>

        {/* Loading */}
        {isLoading && !data && (
          <View className="flex-row flex-wrap" style={{ gap: COLUMN_GAP }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View
                key={i}
                className="rounded-xl bg-muted opacity-50"
                style={{
                  width: columnWidth,
                  height: isTall(i - 1)
                    ? ROW_HEIGHT * 2 + COLUMN_GAP
                    : ROW_HEIGHT,
                }}
              />
            ))}
          </View>
        )}

        {/* Error */}
        {error && (
          <View className="rounded-xl border border-red-200 bg-red-50 p-6">
            <Text className="text-center text-sm text-red-700">
              {error.message}
            </Text>
          </View>
        )}

        {/* Empty */}
        {!isLoading && !error && photos.length === 0 && (
          <View className="items-center rounded-xl bg-homecafe-beige/30 p-12">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-homecafe-beige">
              <Mountain size={32} color={colors.mutedForeground} />
            </View>
            <Text className="font-medium text-foreground">
              Aucune photo publique pour le moment
            </Text>
            <Text className="mt-1 text-center text-sm text-muted-foreground">
              Les photos des posts publics de toi et tes amis apparaîtront ici
            </Text>
          </View>
        )}

        {/* Gallery Grid */}
        {!isLoading && photos.length > 0 && (
          <View className="flex-row flex-wrap" style={{ gap: COLUMN_GAP }}>
            {photos.map((photo, index) => {
              const isOwn = photo.authorId === user?.id;
              const bounceKey = photo.postId ?? photo.photoId ?? "";
              const isBouncing = bouncingIds.has(bounceKey);
              const tall = isTall(index);

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
                  style={{
                    width: columnWidth,
                    height: tall ? ROW_HEIGHT * 2 + COLUMN_GAP : ROW_HEIGHT,
                  }}
                  className="relative overflow-hidden rounded-xl bg-muted"
                >
                  <Image
                    source={{ uri: photo.url }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />

                  {/* Author overlay */}
                  <View className="absolute inset-x-0 bottom-0 flex-row items-center gap-1.5 bg-black/40 p-2">
                    {photo.authorAvatar ? (
                      <Image
                        source={{ uri: photo.authorAvatar }}
                        className="h-[18px] w-[18px] rounded-full"
                      />
                    ) : (
                      <View className="h-[18px] w-[18px] items-center justify-center rounded-full bg-white/30">
                        <User size={10} color="#fff" />
                      </View>
                    )}
                    <Text className="text-xs font-medium text-white">
                      {photo.authorName}
                    </Text>
                  </View>

                  {/* Privacy toggle */}
                  {isOwn && (
                    <Pressable
                      onPress={() => {
                        if (photo.postId) {
                          handleTogglePostPrivacy(photo.postId);
                        } else if (photo.photoId) {
                          handleTogglePhotoPrivacy(photo.photoId);
                        }
                      }}
                      className="absolute top-2 right-2 h-8 w-8 items-center justify-center rounded-full bg-emerald-500"
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

        {/* "Voir plus" button */}
        {data?.pagination.hasNextPage && (
          <Pressable
            onPress={() => setPage((p) => p + 1)}
            disabled={isLoading}
            className="mt-6 self-center rounded-lg border border-border px-4 py-2"
          >
            <Text className="text-sm text-foreground">Voir plus de photos</Text>
          </Pressable>
        )}

        {/* Prev/Next pagination */}
        {page > 1 && (
          <View className="mt-4 flex-row items-center justify-center gap-4">
            <Pressable
              onPress={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-border px-3 py-1.5"
              style={page <= 1 ? { opacity: 0.4 } : undefined}
            >
              <Text className="text-sm text-foreground">Précédent</Text>
            </Pressable>
            <Text className="text-sm text-muted-foreground">Page {page}</Text>
            <Pressable
              onPress={() => setPage((p) => p + 1)}
              disabled={!data?.pagination.hasNextPage}
              className="rounded-lg border border-border px-3 py-1.5"
              style={
                !data?.pagination.hasNextPage ? { opacity: 0.4 } : undefined
              }
            >
              <Text className="text-sm text-foreground">Suivant</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
