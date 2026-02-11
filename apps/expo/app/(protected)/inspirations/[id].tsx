import { type Href, router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, ImagePlus, Palette } from "lucide-react-native";
import { useCallback, useState } from "react";
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
  useAddPin,
  useDeletePin,
  useMoodboardDetail,
} from "@/lib/api/hooks/use-moodboards";
import { useMoodboardImagePicker } from "@/lib/hooks/use-moodboard-image-picker";
import type { MoodboardPinDto } from "@/types/moodboard";

const MOODBOARD_COLORS = [
  "#FF6B6B",
  "#FF8E72",
  "#FFA94D",
  "#FFD43B",
  "#A9E34B",
  "#69DB7C",
  "#38D9A9",
  "#3BC9DB",
  "#4DABF7",
  "#748FFC",
  "#9775FA",
  "#DA77F2",
  "#F06595",
  "#E8590C",
  "#868E96",
  "#212529",
];

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
const MAX_PINS = 50;

function DetailSkeleton() {
  return (
    <View className="flex-row flex-wrap gap-3 px-6 pt-4">
      {["s1", "s2", "s3", "s4", "s5", "s6"].map((id) => (
        <View
          key={id}
          className="aspect-square rounded-2xl bg-muted"
          style={{ width: "47%" }}
        />
      ))}
    </View>
  );
}

function EmptyPins({
  onAddImage,
  onAddColor,
}: {
  onAddImage: () => void;
  onAddColor: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Palette size={36} color="#B8A898" strokeWidth={1.5} />
      </View>
      <Text className="mb-2 text-center text-lg font-semibold text-foreground">
        Aucun pin pour le moment
      </Text>
      <Text className="mb-6 text-center text-sm text-muted-foreground">
        Ajoute des images ou des couleurs pour composer ton moodboard
      </Text>
      <View className="flex-row gap-3">
        <Pressable
          onPress={onAddImage}
          className="flex-row items-center gap-2 rounded-full bg-primary px-5 py-3 active:opacity-80"
        >
          <ImagePlus size={16} color="#FFFFFF" strokeWidth={2} />
          <Text className="font-semibold text-white">Image</Text>
        </Pressable>
        <Pressable
          onPress={onAddColor}
          className="flex-row items-center gap-2 rounded-full border border-primary px-5 py-3 active:opacity-80"
        >
          <Palette size={16} color="#F691C3" strokeWidth={2} />
          <Text className="font-semibold text-primary">Couleur</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PinItem({
  pin,
  onDelete,
  isDeleting,
}: {
  pin: MoodboardPinDto;
  onDelete: (pin: MoodboardPinDto) => void;
  isDeleting: boolean;
}) {
  return (
    <Pressable
      onLongPress={() => onDelete(pin)}
      delayLongPress={500}
      disabled={isDeleting}
      className="flex-1 aspect-square overflow-hidden rounded-2xl"
      style={isDeleting ? { opacity: 0.5 } : undefined}
    >
      {pin.type === "image" && pin.imageUrl ? (
        <Image
          source={{ uri: pin.imageUrl }}
          className="h-full w-full"
          resizeMode="cover"
        />
      ) : (
        <View
          className="h-full w-full items-center justify-center"
          style={{ backgroundColor: pin.color ?? "#E5E5E5" }}
        >
          <Text className="text-xs font-medium text-white/80">{pin.color}</Text>
        </View>
      )}
      {isDeleting && (
        <View className="absolute inset-0 items-center justify-center bg-black/30">
          <ActivityIndicator size="small" color="#FFFFFF" />
        </View>
      )}
    </Pressable>
  );
}

export default function MoodboardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useMoodboardDetail(id ?? "");
  const addPin = useAddPin(id ?? "");
  const deletePin = useDeletePin(id ?? "");
  const { pickAndUpload, isUploading, progress } = useMoodboardImagePicker(
    id ?? "",
  );
  const [refreshing, setRefreshing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customHex, setCustomHex] = useState("");

  const pins = data?.pins ?? [];
  const isEmpty = !isLoading && pins.length === 0;
  const isAtPinLimit = pins.length >= MAX_PINS;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/inspirations" as Href);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleDeletePin = useCallback(
    (pin: MoodboardPinDto) => {
      Alert.alert(
        "Supprimer le pin",
        "Cette action est irréversible. Veux-tu continuer ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              try {
                await deletePin.mutateAsync(pin.id);
                Alert.alert("Succès", "Pin supprimé");
              } catch {
                Alert.alert("Erreur", "Impossible de supprimer le pin");
              }
            },
          },
        ],
      );
    },
    [deletePin],
  );

  const handleAddImage = () => {
    if (isAtPinLimit) {
      Alert.alert(
        "Limite atteinte",
        `Ce moodboard contient déjà ${MAX_PINS} pins (maximum). Supprime un pin pour en ajouter un nouveau.`,
      );
      return;
    }
    pickAndUpload();
  };

  const handleAddColor = (color: string) => {
    if (!HEX_COLOR_REGEX.test(color)) {
      Alert.alert("Erreur", "Couleur invalide. Utilise le format #RRGGBB");
      return;
    }
    if (isAtPinLimit) {
      Alert.alert(
        "Limite atteinte",
        `Ce moodboard contient déjà ${MAX_PINS} pins (maximum). Supprime un pin pour en ajouter un nouveau.`,
      );
      return;
    }
    setShowColorPicker(false);
    addPin.mutate(
      { type: "color", color },
      {
        onSuccess: () => Alert.alert("Succès", "Couleur ajoutée"),
        onError: () => Alert.alert("Erreur", "Impossible d'ajouter la couleur"),
      },
    );
  };

  const handleOpenColorPicker = () => {
    if (isAtPinLimit) {
      Alert.alert(
        "Limite atteinte",
        `Ce moodboard contient déjà ${MAX_PINS} pins (maximum). Supprime un pin pour en ajouter un nouveau.`,
      );
      return;
    }
    setCustomHex("");
    setShowColorPicker(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center gap-3 px-6 pb-2 pt-2">
          <Pressable
            onPress={handleBack}
            className="h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink bg-background active:bg-muted"
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <ArrowLeft size={20} color="#3D2E2E" strokeWidth={2} />
          </Pressable>
          <Text
            className="flex-1 text-xl font-bold text-foreground"
            numberOfLines={1}
          >
            {data?.title ?? "Moodboard"}
          </Text>
          {!isLoading && !isEmpty && (
            <Text className="text-xs text-muted-foreground">
              {pins.length}/{MAX_PINS} pins
            </Text>
          )}
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

        {isLoading && <DetailSkeleton />}

        {isError && !isLoading && (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="mb-4 text-center text-muted-foreground">
              Impossible de charger le moodboard
            </Text>
            <Pressable
              onPress={() => refetch()}
              className="rounded-full bg-primary px-6 py-3 active:opacity-80"
            >
              <Text className="font-semibold text-white">Réessayer</Text>
            </Pressable>
          </View>
        )}

        {isEmpty && !isError && (
          <EmptyPins
            onAddImage={handleAddImage}
            onAddColor={handleOpenColorPicker}
          />
        )}

        {!isLoading && !isError && pins.length > 0 && (
          <FlatList
            data={pins}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item }) => (
              <PinItem
                pin={item}
                onDelete={handleDeletePin}
                isDeleting={
                  deletePin.isPending && deletePin.variables === item.id
                }
              />
            )}
            className="flex-1 px-6"
            contentContainerStyle={{
              paddingBottom: 100,
              paddingTop: 8,
              gap: 12,
            }}
            columnWrapperStyle={{ gap: 12 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          />
        )}

        {/* FAB buttons */}
        {!isEmpty && (
          <View className="absolute bottom-8 right-6 gap-3">
            <Pressable
              onPress={handleOpenColorPicker}
              disabled={addPin.isPending || isAtPinLimit}
              className="h-12 w-12 items-center justify-center rounded-full border border-primary bg-card shadow-md active:opacity-80"
              style={[
                {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.15,
                  shadowRadius: 3,
                  elevation: 3,
                },
                isAtPinLimit ? { opacity: 0.4 } : undefined,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Ajouter une couleur"
            >
              <Palette size={20} color="#F691C3" strokeWidth={2} />
            </Pressable>
            <Pressable
              onPress={handleAddImage}
              disabled={isUploading || isAtPinLimit}
              className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:opacity-80"
              style={[
                {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                },
                isAtPinLimit ? { opacity: 0.4 } : undefined,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Ajouter une image"
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <ImagePlus size={24} color="#FFFFFF" strokeWidth={2} />
              )}
            </Pressable>
          </View>
        )}
      </View>

      {/* Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <Pressable
            onPress={() => setShowColorPicker(false)}
            className="flex-1 items-center justify-end bg-black/50"
          >
            <Pressable
              onPress={() => {}}
              className="w-full rounded-t-3xl bg-card px-6 pb-8 pt-6"
            >
              <Text className="mb-4 text-lg font-bold text-foreground">
                Choisir une couleur
              </Text>

              <View className="mb-6 flex-row flex-wrap gap-3">
                {MOODBOARD_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => handleAddColor(color)}
                    className="h-11 w-11 rounded-full border-2 border-transparent active:border-foreground"
                    style={{ backgroundColor: color }}
                    accessibilityRole="button"
                    accessibilityLabel={`Couleur ${color}`}
                  />
                ))}
              </View>

              <Text className="mb-2 text-sm font-medium text-muted-foreground">
                Ou entre un code hex
              </Text>
              <View className="flex-row gap-3">
                <TextInput
                  value={customHex}
                  onChangeText={setCustomHex}
                  placeholder="#FF5733"
                  maxLength={7}
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground"
                  placeholderTextColor="#B8A898"
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (customHex.trim()) handleAddColor(customHex.trim());
                  }}
                />
                {HEX_COLOR_REGEX.test(customHex.trim()) && (
                  <View
                    className="h-12 w-12 rounded-xl border border-border"
                    style={{ backgroundColor: customHex.trim() }}
                  />
                )}
                <Pressable
                  onPress={() => {
                    if (customHex.trim()) handleAddColor(customHex.trim());
                  }}
                  disabled={!customHex.trim() || addPin.isPending}
                  className="items-center justify-center rounded-xl bg-primary px-5 active:opacity-80 disabled:opacity-50"
                >
                  {addPin.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="font-semibold text-white">OK</Text>
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
