import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

import { useMoodboardUpload } from "@/lib/api/hooks/use-moodboard-upload";

export function useMoodboardImagePicker(moodboardId: string) {
  const moodboardUpload = useMoodboardUpload(moodboardId);

  const pickAndUpload = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission requise",
        "Autorise l'accès aux photos pour continuer",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (result.canceled || result.assets.length === 0) return;

    const asset = result.assets[0];
    if (!asset) return;

    try {
      await moodboardUpload.mutateAsync(asset);
      Alert.alert("Succès", "Image ajoutée au moodboard");
    } catch {
      Alert.alert("Erreur", "Impossible d'ajouter l'image");
    }
  };

  return {
    pickAndUpload,
    isUploading: moodboardUpload.isPending,
    progress: moodboardUpload.progress,
    cancel: moodboardUpload.cancel,
  };
}
