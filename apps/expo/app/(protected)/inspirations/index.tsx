import { type Href, router } from "expo-router";
import { Palette, Plus, X } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useCreateMoodboard,
  useDeleteMoodboard,
  useInfiniteMoodboards,
} from "@/lib/api/hooks/use-moodboards";
import type { MoodboardListItemDto } from "@/types/moodboard";

function MoodboardSkeleton() {
  return (
    <View className="gap-3 px-6 pt-4">
      {["s1", "s2", "s3"].map((id) => (
        <View key={id} className="h-28 rounded-2xl bg-muted" />
      ))}
    </View>
  );
}

function EmptyMoodboards({ onCreate }: { onCreate: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Palette size={36} color="#B8A898" strokeWidth={1.5} />
      </View>
      <Text className="mb-2 text-center text-lg font-semibold text-foreground">
        Pas encore de moodboard
      </Text>
      <Text className="mb-6 text-center text-sm text-muted-foreground">
        Crée ton premier moodboard pour commencer à collectionner tes
        inspirations visuelles
      </Text>
      <Pressable
        onPress={onCreate}
        className="flex-row items-center gap-2 rounded-full bg-primary px-6 py-3 active:opacity-80"
      >
        <Plus size={18} color="#FFFFFF" strokeWidth={2} />
        <Text className="font-semibold text-white">Créer un moodboard</Text>
      </Pressable>
    </View>
  );
}

function PinPreview({
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

function MoodboardCard({
  moodboard,
  onPress,
  onDelete,
  isDeleting,
}: {
  moodboard: MoodboardListItemDto;
  onPress: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onDelete}
      delayLongPress={500}
      disabled={isDeleting}
      className="mb-3 overflow-hidden rounded-2xl bg-card active:opacity-90"
      style={isDeleting ? { opacity: 0.5 } : undefined}
    >
      <View className="flex-row">
        {moodboard.previewPins.length > 0 ? (
          <View
            className="flex-row flex-wrap"
            style={{ width: 100, height: 100 }}
          >
            {moodboard.previewPins.slice(0, 4).map((pin) => (
              <View
                key={pin.id}
                className="overflow-hidden"
                style={{ width: 50, height: 50 }}
              >
                <PinPreview pin={pin} />
              </View>
            ))}
            {moodboard.previewPins.length < 4 &&
              Array.from(
                { length: 4 - moodboard.previewPins.length },
                (_, i) => `empty-slot-${moodboard.id}-${i}`,
              ).map((key) => (
                <View
                  key={key}
                  className="bg-muted"
                  style={{ width: 50, height: 50 }}
                />
              ))}
          </View>
        ) : (
          <View
            className="items-center justify-center bg-muted"
            style={{ width: 100, height: 100 }}
          >
            <Palette size={28} color="#B8A898" strokeWidth={1.5} />
          </View>
        )}
        <View className="flex-1 justify-center px-4 py-3">
          <Text
            className="text-base font-semibold text-foreground"
            numberOfLines={1}
          >
            {moodboard.title}
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            {moodboard.pinCount} {moodboard.pinCount <= 1 ? "pin" : "pins"}
          </Text>
        </View>
        {isDeleting && (
          <View className="items-center justify-center pr-4">
            <ActivityIndicator size="small" color="#F691C3" />
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function InspirationsScreen() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMoodboards();
  const createMoodboard = useCreateMoodboard();
  const deleteMoodboard = useDeleteMoodboard();
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const moodboards = useMemo(
    () => data?.pages.flatMap((page) => page.moodboards) ?? [],
    [data],
  );
  const isEmpty = !isLoading && moodboards.length === 0;

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

  const handleCreate = () => {
    setNewTitle("");
    setShowCreateModal(true);
  };

  const handleConfirmCreate = async () => {
    if (!newTitle.trim()) return;
    if (newTitle.trim().length > 100) {
      Alert.alert("Erreur", "Le titre ne peut pas dépasser 100 caractères");
      return;
    }
    try {
      await createMoodboard.mutateAsync({ title: newTitle.trim() });
      setShowCreateModal(false);
      Alert.alert("Succès", "Moodboard créé");
    } catch {
      Alert.alert("Erreur", "Impossible de créer le moodboard");
    }
  };

  const handleDelete = useCallback(
    (moodboard: MoodboardListItemDto) => {
      Alert.alert(
        "Supprimer le moodboard",
        `Supprimer "${moodboard.title}" ? Cette action est irréversible.`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteMoodboard.mutateAsync(moodboard.id);
                Alert.alert("Succès", "Moodboard supprimé");
              } catch {
                Alert.alert("Erreur", "Impossible de supprimer le moodboard");
              }
            },
          },
        ],
      );
    },
    [deleteMoodboard],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 pb-2 pt-2">
          <Text className="text-xl font-bold text-foreground">Moodboards</Text>
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink bg-background active:bg-muted"
            accessibilityRole="button"
            accessibilityLabel="Fermer"
          >
            <X size={20} color="#3D2E2E" strokeWidth={2} />
          </Pressable>
        </View>

        {isLoading && <MoodboardSkeleton />}

        {isError && !isLoading && (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="mb-4 text-center text-muted-foreground">
              Impossible de charger les moodboards
            </Text>
            <Pressable
              onPress={() => refetch()}
              className="rounded-full bg-primary px-6 py-3 active:opacity-80"
            >
              <Text className="font-semibold text-white">Réessayer</Text>
            </Pressable>
          </View>
        )}

        {isEmpty && !isError && <EmptyMoodboards onCreate={handleCreate} />}

        {!isLoading && !isError && moodboards.length > 0 && (
          <FlatList
            data={moodboards}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MoodboardCard
                moodboard={item}
                onPress={() =>
                  router.push(`/(protected)/inspirations/${item.id}` as Href)
                }
                onDelete={() => handleDelete(item)}
                isDeleting={
                  deleteMoodboard.isPending &&
                  deleteMoodboard.variables === item.id
                }
              />
            )}
            className="flex-1 px-6"
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
            showsVerticalScrollIndicator={false}
            onEndReached={handleEndReached}
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

        {!isEmpty && (
          <View className="absolute bottom-8 right-6">
            <Pressable
              onPress={handleCreate}
              disabled={createMoodboard.isPending}
              className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:opacity-80"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
              accessibilityRole="button"
              accessibilityLabel="Créer un moodboard"
            >
              {createMoodboard.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Plus size={24} color="#FFFFFF" strokeWidth={2} />
              )}
            </Pressable>
          </View>
        )}
      </View>

      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <Pressable
            onPress={() => setShowCreateModal(false)}
            className="flex-1 items-center justify-center bg-black/50 px-8"
          >
            <Pressable
              onPress={() => {}}
              className="w-full rounded-2xl bg-card p-6"
            >
              <Text className="mb-2 text-lg font-bold text-foreground">
                Nouveau moodboard
              </Text>
              <Text className="mb-4 text-sm text-muted-foreground">
                Donne un titre à ton moodboard
              </Text>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Mon moodboard..."
                maxLength={100}
                autoFocus
                className="mb-4 rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground"
                placeholderTextColor="#B8A898"
                onSubmitEditing={handleConfirmCreate}
                returnKeyType="done"
              />
              <View className="flex-row justify-end gap-3">
                <Pressable
                  onPress={() => setShowCreateModal(false)}
                  className="rounded-full px-5 py-2.5 active:opacity-80"
                >
                  <Text className="font-medium text-muted-foreground">
                    Annuler
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleConfirmCreate}
                  disabled={!newTitle.trim() || createMoodboard.isPending}
                  className="rounded-full bg-primary px-5 py-2.5 active:opacity-80 disabled:opacity-50"
                >
                  {createMoodboard.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="font-semibold text-white">Créer</Text>
                  )}
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
