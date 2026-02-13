import { useLocalSearchParams, useRouter } from "expo-router";
import { ImageIcon, Lock, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PostEditor } from "@/components/journal/post-editor";
import { Avatar, Button } from "@/components/ui";
import { usePost, useUpdatePost } from "@/lib/api/hooks/use-posts";
import { usePostImages } from "@/lib/hooks/use-image-picker";
import { useToast } from "@/lib/toast/toast-context";
import { useAuth } from "@/src/providers/auth-provider";

function isContentEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").trim().length === 0;
}

export default function EditPostScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: post, isLoading: isLoadingPost } = usePost(id ?? "");
  const updatePost = useUpdatePost();
  const {
    images,
    pickImages,
    removeImage,
    resetImages,
    isUploading,
    canAddMore,
  } = usePostImages();

  const [htmlContent, setHtmlContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (post && !initialized) {
      setHtmlContent(post.content);
      setIsPrivate(post.isPrivate);
      resetImages(post.images);
      setInitialized(true);
    }
  }, [post, initialized, resetImages]);

  const isSubmitting = updatePost.isPending || isUploading;

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/(tabs)/journal");
    }
  };

  const handleSave = () => {
    if (isContentEmpty(htmlContent) || !id) return;

    updatePost.mutate(
      {
        postId: id,
        content: htmlContent,
        isPrivate,
        images,
      },
      {
        onSuccess: () => {
          showToast("Post modifié !", "success");
          handleClose();
        },
        onError: (error) => {
          showToast(error.message ?? "Erreur lors de la modification", "error");
        },
      },
    );
  };

  const handleChangeHTML = useCallback((html: string) => {
    setHtmlContent(html);
  }, []);

  const togglePrivacy = () => {
    setIsPrivate((prev) => !prev);
  };

  if (isLoadingPost) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <View className="flex-row justify-end px-4 py-4">
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink bg-background active:bg-muted"
          >
            <X size={20} color="#3D2E2E" strokeWidth={2} />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F691C3" />
        </View>
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <View className="flex-row justify-end px-4 py-4">
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink bg-background active:bg-muted"
          >
            <X size={20} color="#3D2E2E" strokeWidth={2} />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-destructive text-center text-base">
            Post introuvable
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <ScrollView
        className="flex-1 px-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center py-4">
          <View className="flex-row items-center gap-3 flex-1">
            <Avatar
              size="lg"
              src={undefined}
              alt={user?.name ?? "Utilisateur"}
              className="border-2 border-primary"
            />
            <View>
              <Text className="text-base font-semibold text-foreground">
                {user?.name ?? "Utilisateur"}
              </Text>
              <Text className="text-sm text-muted-foreground">
                Modifier le post
              </Text>
            </View>
          </View>

          <Pressable
            onPress={togglePrivacy}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{
              backgroundColor: isPrivate ? "#3B82F6" : "#10B981",
            }}
            accessibilityRole="button"
            accessibilityLabel={isPrivate ? "Post privé" : "Post public"}
          >
            <Lock size={16} color="#FFFFFF" strokeWidth={2} />
          </Pressable>

          <Pressable
            onPress={handleClose}
            className="ml-3 h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink bg-background active:bg-muted"
            accessibilityRole="button"
            accessibilityLabel="Fermer"
          >
            <X size={20} color="#3D2E2E" strokeWidth={2} />
          </Pressable>
        </View>

        <PostEditor
          initialContent={initialized ? htmlContent : ""}
          onChangeHTML={handleChangeHTML}
          onImagePress={pickImages}
          minHeight={300}
          editable={!isSubmitting}
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
      </ScrollView>

      <View className="px-4 pt-3" style={{ paddingBottom: 12 }}>
        <Button
          onPress={handleSave}
          disabled={isContentEmpty(htmlContent) || isSubmitting}
          className="w-full"
        >
          {updatePost.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Enregistrer
            </Text>
          )}
        </Button>
      </View>
    </View>
  );
}
