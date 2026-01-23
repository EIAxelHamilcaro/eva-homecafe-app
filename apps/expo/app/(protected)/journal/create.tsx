import { router } from "expo-router";
import { Lock, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

import {
  type FormattingOption,
  PostEditor,
} from "@/components/journal/post-editor";
import { Avatar, Button } from "@/components/ui";

export default function JournalCreateModal() {
  const [postContent, setPostContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [activeFormatting, setActiveFormatting] = useState<FormattingOption[]>(
    [],
  );

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/journal");
    }
  };

  const handlePublish = () => {
    console.log("Publishing post:", {
      content: postContent,
      isPrivate,
      formatting: activeFormatting,
    });
    handleClose();
  };

  const handleFormatPress = (format: FormattingOption) => {
    setActiveFormatting((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format],
    );
  };

  const handleImagePress = () => {
    console.log("Image button pressed");
  };

  const handleMentionPress = () => {
    console.log("Mention button pressed");
  };

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
        {/* Close button */}
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

        {/* User info header */}
        <View className="flex-row items-center justify-between pt-12 pb-4">
          <View className="flex-row items-center gap-3">
            <Avatar
              size="xl"
              src="https://picsum.photos/seed/eva/200"
              alt="Eva Cadario"
              className="border-4 border-primary"
            />
            <View>
              <Text className="text-lg font-bold text-foreground">
                Eva Cadario
              </Text>
              <Text className="text-sm text-muted-foreground capitalize">
                {formattedDate}
              </Text>
            </View>
          </View>

          {/* Lock toggle button */}
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

        {/* Post editor */}
        <PostEditor
          value={postContent}
          onChangeText={setPostContent}
          activeFormatting={activeFormatting}
          onFormatPress={handleFormatPress}
          onImagePress={handleImagePress}
          onMentionPress={handleMentionPress}
          minHeight={300}
          className="flex-1"
        />

        {/* Publish button */}
        <View className="items-end py-4">
          <Button
            onPress={handlePublish}
            disabled={!postContent.trim()}
            className="px-8"
          >
            <Text className="text-white font-semibold text-base">Publier</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
