import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SocialFeed } from "@/components/social/social-feed";
import { SocialGallery } from "@/components/social/social-gallery";
import { feedGalleryKeys, feedKeys } from "@/lib/api/hooks/query-keys";

export default function SocialScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: feedKeys.all }),
      queryClient.invalidateQueries({ queryKey: feedGalleryKeys.all }),
    ]);
    setRefreshing(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 px-4">
        <Text className="mb-4 text-2xl font-bold text-foreground">Social</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24, gap: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#F691C3"
              colors={["#F691C3"]}
            />
          }
        >
          <SocialFeed />
          <SocialGallery />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
