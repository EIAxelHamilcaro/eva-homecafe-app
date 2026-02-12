import { router } from "expo-router";
import { ImageIcon, Lock, X } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  type FormattingOption,
  PostEditor,
} from "@/components/journal/post-editor";
import { Avatar, Button } from "@/components/ui";
import { useCreatePost } from "@/lib/api/hooks/use-posts";
import { usePostImages } from "@/lib/hooks/use-image-picker";
import { useToast } from "@/lib/toast/toast-context";
import { useAuth } from "@/src/providers/auth-provider";

export default function JournalCreateModal() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const createPost = useCreatePost();
  const { images, pickImages, removeImage, isUploading, canAddMore } =
    usePostImages();

  const [postContent, setPostContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [activeFormatting, setActiveFormatting] = useState<FormattingOption[]>(
    [],
  );

  const isSubmitting = createPost.isPending || isUploading;

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/(tabs)/journal");
    }
  };

  const handlePublish = () => {
    if (!postContent.trim()) return;

    createPost.mutate(
      {
        content: postContent,
        isPrivate,
        images: images.length > 0 ? images : undefined,
      },
      {
        onSuccess: () => {
          showToast("Post publié !", "success");
          handleClose();
        },
        onError: (error) => {
          showToast(error.message ?? "Erreur lors de la publication", "error");
        },
      },
    );
  };

  const handleFormatPress = (format: FormattingOption) => {
    setActiveFormatting((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format],
    );
  };

  const handleMentionPress = () => {};

  const togglePrivacy = () => {
    setIsPrivate((prev) => !prev);
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4">
        <View className="absolute right-4 top-4 z-10">
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink bg-background active:bg-muted"
            accessibilityRole="button"
            accessibilityLabel="Fermer"
          >
            <X size={20} color="#3D2E2E" strokeWidth={2} />
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between pt-12 pb-4">
          <View className="flex-row items-center gap-3">
            <Avatar
              size="xl"
              src={undefined}
              alt={user?.name ?? "Utilisateur"}
              className="border-4 border-primary"
            />
            <View>
              <Text className="text-lg font-bold text-foreground">
                {user?.name ?? "Utilisateur"}
              </Text>
              <Text className="text-sm text-muted-foreground capitalize">
                {formattedDate}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={togglePrivacy}
            className="h-12 w-12 items-center justify-center rounded-xl"
            style={{
              backgroundColor: isPrivate ? "#3B82F6" : "#E5E7EB",
            }}
            accessibilityRole="button"
            accessibilityLabel={isPrivate ? "Post privé" : "Post public"}
          >
            <Lock
              size={24}
              color={isPrivate ? "#FFFFFF" : "#6B7280"}
              strokeWidth={2}
            />
          </Pressable>
        </View>

        <PostEditor
          value={postContent}
          onChangeText={setPostContent}
          activeFormatting={activeFormatting}
          onFormatPress={handleFormatPress}
          onImagePress={pickImages}
          onMentionPress={handleMentionPress}
          minHeight={200}
          editable={!isSubmitting}
          className="flex-1"
        />

        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="py-3"
          >
            {images.map((uri, index) => (
              <View key={uri} className="relative mr-2">
                <Image
                  source={{ uri }}
                  className="w-20 h-20 rounded-lg"
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => removeImage(index)}
                  className="absolute -top-1 -right-1 bg-destructive rounded-full w-5 h-5 items-center justify-center"
                >
                  <X size={12} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
            {canAddMore && (
              <Pressable
                onPress={pickImages}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground items-center justify-center"
              >
                <ImageIcon size={24} color="#9CA3AF" />
              </Pressable>
            )}
          </ScrollView>
        )}

        {isUploading && (
          <View className="flex-row items-center gap-2 py-2">
            <ActivityIndicator size="small" color="#F691C3" />
            <Text className="text-muted-foreground text-sm">
              Upload en cours...
            </Text>
          </View>
        )}

        <View className="items-end py-4">
          <Button
            onPress={handlePublish}
            disabled={!postContent.trim() || isSubmitting}
            className="px-8"
          >
            {createPost.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Publier
              </Text>
            )}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
