import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

import { useGalleryUpload } from "@/lib/api/hooks/use-gallery-upload";

export function useGalleryImagePicker() {
  const galleryUpload = useGalleryUpload();

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
      await galleryUpload.mutateAsync(asset);
      Alert.alert("Succès", "Photo ajoutée à la galerie");
    } catch {
      Alert.alert("Erreur", "Impossible d'ajouter la photo");
    }
  };

  return {
    pickAndUpload,
    isUploading: galleryUpload.isPending,
    progress: galleryUpload.progress,
  };
}
