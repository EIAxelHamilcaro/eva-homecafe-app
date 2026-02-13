import { type Href, useRouter } from "expo-router";
import { Maximize2 } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { JournalBadges } from "@/components/journal/journal-badges";
import { JournalEntryCard } from "@/components/journal/journal-entry-card";
import { JournalGallery } from "@/components/journal/journal-gallery";
import { JournalHeader } from "@/components/journal/journal-header";
import { useJournalEntries } from "@/lib/api/hooks/use-journal";
import { colors } from "@/src/config/colors";

function getLocalDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface JournalEntry {
  id: string;
  groupDate: string;
  content: string;
  isPrivate: boolean;
  images: string[];
  createdAt: string;
}

function SkeletonCard() {
  return <View className="h-32 rounded-xl bg-muted" />;
}

export default function JournalScreen() {
  const router = useRouter();
  const today = getLocalDateString();
  const { data, isLoading, error } = useJournalEntries(1, 5);

  const entries: JournalEntry[] =
    data?.groups.flatMap((group) =>
      group.posts.map((post) => ({
        id: post.id,
        groupDate: group.date,
        content: post.content,
        isPrivate: post.isPrivate,
        images: post.images,
        createdAt: post.createdAt,
      })),
    ) ?? [];

  const handlePostPress = (postId: string) => {
    router.push(`/(protected)/(tabs)/journal/post/${postId}` as Href);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <JournalHeader today={today} />

        <View className="mt-4">
          <View className="mb-3 flex-row items-start justify-between">
            <View>
              <Text className="text-lg font-semibold text-foreground">
                Derniers posts
              </Text>
              <Text className="text-sm text-muted-foreground">
                Tes posts sont class{"\u00E9"}s de mani{"\u00E8"}re
                chronologique
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/(protected)/(tabs)/journal" as Href)}
              className="h-8 w-8 items-center justify-center rounded-full active:bg-muted"
              hitSlop={8}
            >
              <Maximize2 size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {isLoading && (
            <View className="gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          )}

          {error && (
            <View className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
              <Text className="text-center text-sm text-destructive">
                Impossible de charger les entr{"\u00E9"}es
              </Text>
            </View>
          )}

          {!isLoading && !error && entries.length === 0 && (
            <View
              className="rounded-xl p-8"
              style={{
                borderWidth: 12,
                borderColor: "rgba(4, 160, 86, 0.2)",
              }}
            >
              <Text className="text-center text-sm text-muted-foreground">
                Aucune entr{"\u00E9"}e pour le moment
              </Text>
            </View>
          )}

          {!isLoading &&
            !error &&
            entries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                id={entry.id}
                groupDate={entry.groupDate}
                content={entry.content}
                isPrivate={entry.isPrivate}
                images={entry.images}
                createdAt={entry.createdAt}
                onPress={() => handlePostPress(entry.id)}
              />
            ))}
        </View>

        <View className="mt-4 gap-4">
          <JournalGallery />
          <JournalBadges />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
