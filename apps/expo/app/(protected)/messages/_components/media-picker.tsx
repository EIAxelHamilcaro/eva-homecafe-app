import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/constants/chat";

export interface SelectedMedia {
  uri: string;
  type: string;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
}

export interface MediaPickerOptions {
  maxSelection?: number;
  allowsEditing?: boolean;
}

export async function pickMediaFromLibrary(
  options: MediaPickerOptions = {},
): Promise<SelectedMedia[]> {
  const { maxSelection = 10, allowsEditing = false } = options;

  const permissionResult =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    Alert.alert(
      "Permission requise",
      "Veuillez autoriser l'accès à la galerie pour sélectionner des images.",
    );
    return [];
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing,
    allowsMultipleSelection: maxSelection > 1,
    selectionLimit: maxSelection,
    quality: 0.8,
  });

  if (result.canceled || !result.assets) {
    return [];
  }

  const validMedia: SelectedMedia[] = [];

  for (const asset of result.assets) {
    const mimeType = asset.mimeType ?? "image/jpeg";

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        mimeType as (typeof ALLOWED_IMAGE_TYPES)[number],
      )
    ) {
      Alert.alert(
        "Type non supporté",
        `Le fichier ${asset.fileName ?? "image"} n'est pas un format d'image supporté.`,
      );
      continue;
    }

    if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE) {
      Alert.alert(
        "Fichier trop volumineux",
        `Le fichier ${asset.fileName ?? "image"} dépasse la taille maximale de 50 Mo.`,
      );
      continue;
    }

    validMedia.push({
      uri: asset.uri,
      type: mimeType,
      fileName: asset.fileName ?? `image_${Date.now()}.jpg`,
      fileSize: asset.fileSize ?? 0,
      width: asset.width,
      height: asset.height,
    });
  }

  return validMedia;
}

export async function takePhoto(): Promise<SelectedMedia | null> {
  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

  if (!permissionResult.granted) {
    Alert.alert(
      "Permission requise",
      "Veuillez autoriser l'accès à la caméra pour prendre une photo.",
    );
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: 0.8,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  if (!asset) {
    return null;
  }

  const mimeType = asset.mimeType ?? "image/jpeg";

  if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE) {
    Alert.alert(
      "Fichier trop volumineux",
      "La photo dépasse la taille maximale de 50 Mo.",
    );
    return null;
  }

  return {
    uri: asset.uri,
    type: mimeType,
    fileName: asset.fileName ?? `photo_${Date.now()}.jpg`,
    fileSize: asset.fileSize ?? 0,
    width: asset.width,
    height: asset.height,
  };
}
