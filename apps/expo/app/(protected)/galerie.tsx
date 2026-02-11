import { router } from "expo-router";
import { Image as ImageIcon, Plus, X } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useDeletePhoto,
  useInfiniteGallery,
} from "@/lib/api/hooks/use-gallery";
import { useGalleryImagePicker } from "@/lib/hooks/use-gallery-image-picker";
import type { PhotoDto } from "@/types/gallery";

function GallerySkeleton() {
  return (
    <View className="flex-row flex-wrap gap-3 px-6 pt-16">
      {["s1", "s2", "s3", "s4", "s5", "s6"].map((id) => (
        <View
          key={id}
          className="aspect-square rounded-2xl"
          style={{
            width: "47%",
            backgroundColor: "#F5E6D3",
          }}
        />
      ))}
    </View>
  );
}

function EmptyGallery({ onUpload }: { onUpload: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-muted">
        <ImageIcon size={36} color="#B8A898" strokeWidth={1.5} />
      </View>
      <Text className="mb-2 text-center text-lg font-semibold text-foreground">
        Ta galerie est vide
      </Text>
      <Text className="mb-6 text-center text-sm text-muted-foreground">
        Ajoute tes premieres photos pour commencer ta collection visuelle
      </Text>
      <Pressable
        onPress={onUpload}
        className="flex-row items-center gap-2 rounded-full bg-primary px-6 py-3 active:opacity-80"
      >
        <Plus size={18} color="#FFFFFF" strokeWidth={2} />
        <Text className="font-semibold text-white">Ajouter une photo</Text>
      </Pressable>
    </View>
  );
}

function PhotoItem({
  photo,
  onDelete,
}: {
  photo: PhotoDto;
  onDelete: (photo: PhotoDto) => void;
}) {
  return (
    <Pressable
      onLongPress={() => onDelete(photo)}
      delayLongPress={500}
      className="flex-1 aspect-square overflow-hidden rounded-2xl"
    >
      <Image
        source={{ uri: photo.url }}
        className="h-full w-full"
        resizeMode="cover"
      />
    </Pressable>
  );
}

export default function GalerieModal() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteGallery();
  const deletePhoto = useDeletePhoto();
  const { pickAndUpload, isUploading, progress } = useGalleryImagePicker();
  const [refreshing, setRefreshing] = useState(false);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/(tabs)");
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleDelete = useCallback(
    (photo: PhotoDto) => {
      Alert.alert(
        "Supprimer la photo",
        "Cette action est irréversible. Veux-tu continuer ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              try {
                await deletePhoto.mutateAsync(photo.id);
                Alert.alert("Succès", "Photo supprimée");
              } catch {
                Alert.alert("Erreur", "Impossible de supprimer la photo");
              }
            },
          },
        ],
      );
    },
    [deletePhoto],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const photos = data?.pages.flatMap((page) => page.data) ?? [];
  const isEmpty = !isLoading && photos.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pb-2 pt-2">
          <Text className="text-xl font-bold text-foreground">Galerie</Text>
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink bg-background active:bg-muted"
            accessibilityRole="button"
            accessibilityLabel="Fermer"
          >
            <X size={20} color="#3D2E2E" strokeWidth={2} />
          </Pressable>
        </View>

        {/* Upload progress */}
        {isUploading && (
          <View className="mx-6 mb-2 rounded-xl bg-primary/10 px-4 py-3">
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#F691C3" />
              <Text className="text-sm text-foreground">
                Upload en cours... {progress}%
              </Text>
            </View>
            <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <View
                className="h-full rounded-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>
        )}

        {/* Loading */}
        {isLoading && <GallerySkeleton />}

        {/* Error */}
        {isError && !isLoading && (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="mb-4 text-center text-muted-foreground">
              Impossible de charger la galerie
            </Text>
            <Pressable
              onPress={() => refetch()}
              className="rounded-full bg-primary px-6 py-3 active:opacity-80"
            >
              <Text className="font-semibold text-white">Réessayer</Text>
            </Pressable>
          </View>
        )}

        {/* Empty state */}
        {isEmpty && !isError && <EmptyGallery onUpload={pickAndUpload} />}

        {/* Photo grid */}
        {!isLoading && !isError && photos.length > 0 && (
          <FlatList
            data={photos}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item }) => (
              <PhotoItem photo={item} onDelete={handleDelete} />
            )}
            className="flex-1 px-6"
            contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
            columnWrapperStyle={{ gap: 12 }}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="items-center py-4">
                  <ActivityIndicator size="small" color="#F691C3" />
                </View>
              ) : null
            }
          />
        )}

        {/* Upload FAB */}
        {!isEmpty && (
          <View className="absolute bottom-8 right-6">
            <Pressable
              onPress={pickAndUpload}
              disabled={isUploading}
              className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:opacity-80"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
              accessibilityRole="button"
              accessibilityLabel="Ajouter une photo"
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Plus size={24} color="#FFFFFF" strokeWidth={2} />
              )}
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
