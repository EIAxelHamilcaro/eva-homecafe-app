import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

import { useMediaUpload } from "@/lib/api/hooks/use-media-upload";
import { useToast } from "@/lib/toast/toast-context";

const MAX_IMAGES = 10;

export function usePostImages(initialImages: string[] = []) {
  const { showToast } = useToast();
  const mediaUpload = useMediaUpload();
  const [images, setImages] = useState<string[]>(initialImages);

  const pickImages = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      showToast("Permission requise pour accéder aux photos", "warning");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - images.length,
      quality: 0.8,
    });

    if (result.canceled) return;

    for (const asset of result.assets) {
      try {
        const uploaded = await mediaUpload.mutateAsync({
          uri: asset.uri,
          type: asset.mimeType,
          fileName: asset.fileName ?? undefined,
        });
        if (uploaded?.url) {
          setImages((prev) => [...prev, uploaded.url]);
        }
      } catch {
        showToast("Erreur lors de l'upload d'une image", "error");
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const resetImages = (newImages: string[]) => {
    setImages(newImages);
  };

  return {
    images,
    pickImages,
    removeImage,
    resetImages,
    isUploading: mediaUpload.isPending,
    canAddMore: images.length < MAX_IMAGES,
  };
}
