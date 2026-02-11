import { X } from "lucide-react-native";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { SelectedMedia } from "./media-picker";

interface MediaPreviewItemProps {
  media: SelectedMedia;
  onRemove: () => void;
  uploadProgress?: number;
  isUploading?: boolean;
}

function MediaPreviewItem({
  media,
  onRemove,
  uploadProgress,
  isUploading,
}: MediaPreviewItemProps) {
  return (
    <View className="relative mr-2">
      <Image
        source={{ uri: media.uri }}
        className="h-20 w-20 rounded-lg"
        resizeMode="cover"
      />
      {isUploading && (
        <View className="absolute inset-0 items-center justify-center rounded-lg bg-black/50">
          <ActivityIndicator size="small" color="#FFFFFF" />
          {typeof uploadProgress === "number" && (
            <Text className="mt-1 text-xs text-white">{uploadProgress}%</Text>
          )}
        </View>
      )}
      {!isUploading && (
        <Pressable
          onPress={onRemove}
          className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500"
        >
          <X size={12} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
}

interface MediaPreviewProps {
  media: SelectedMedia[];
  onRemove: (index: number) => void;
  uploadProgresses?: number[];
  isUploading?: boolean;
}

export function MediaPreview({
  media,
  onRemove,
  uploadProgresses = [],
  isUploading = false,
}: MediaPreviewProps) {
  if (media.length === 0) {
    return null;
  }

  return (
    <View className="border-t border-border bg-background px-3 py-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 4 }}
      >
        {media.map((item, index) => (
          <MediaPreviewItem
            key={`${item.uri}-${index}`}
            media={item}
            onRemove={() => onRemove(index)}
            uploadProgress={uploadProgresses[index]}
            isUploading={isUploading}
          />
        ))}
      </ScrollView>
      {media.length > 0 && (
        <Text className="mt-1 text-xs text-muted-foreground">
          {media.length} image{media.length > 1 ? "s" : ""} sélectionnée
          {media.length > 1 ? "s" : ""}
        </Text>
      )}
    </View>
  );
}
