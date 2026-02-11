import { type Href, useRouter } from "expo-router";
import { ChevronRight, Star, Trophy } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useBadges, useStickers } from "@/lib/api/hooks/use-rewards";
import { colors } from "@/src/config/colors";

export function RewardsWidget() {
  const router = useRouter();
  const { data: stickers, isLoading: stickersLoading } = useStickers();
  const { data: badges, isLoading: badgesLoading } = useBadges();

  const isLoading = stickersLoading || badgesLoading;

  const earnedStickers = stickers?.filter((s) => s.earned).length ?? 0;
  const totalStickers = stickers?.length ?? 0;
  const earnedBadges = badges?.filter((b) => b.earned).length ?? 0;
  const totalBadges = badges?.length ?? 0;
  const hasAnyReward = earnedStickers > 0 || earnedBadges > 0;

  return (
    <Pressable
      onPress={() => router.push("/(protected)/recompenses" as Href)}
      className="mb-4 rounded-2xl bg-card p-4 active:opacity-90"
    >
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground">
          Récompenses
        </Text>
        <View className="flex-row items-center">
          <Text className="mr-1 text-sm text-primary">Voir plus</Text>
          <ChevronRight size={16} color={colors.primary} />
        </View>
      </View>

      {isLoading && (
        <View className="h-16 items-center justify-center">
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      {!isLoading && !hasAnyReward && (
        <View className="items-center rounded-xl bg-muted/50 py-6">
          <Star size={24} color="#B8A898" strokeWidth={1.5} />
          <Text className="mt-2 text-sm text-muted-foreground">
            Continue tes activités pour gagner des récompenses !
          </Text>
        </View>
      )}

      {!isLoading && hasAnyReward && (
        <View className="flex-row gap-4">
          <Pressable
            onPress={() => router.push("/(protected)/stickers" as Href)}
            className="flex-1 items-center rounded-xl bg-muted/30 py-3 active:opacity-80"
          >
            <Star size={20} color={colors.primary} strokeWidth={1.5} />
            <Text className="mt-1 text-sm font-semibold text-foreground">
              {earnedStickers}/{totalStickers}
            </Text>
            <Text className="text-xs text-muted-foreground">stickers</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(protected)/recompenses" as Href)}
            className="flex-1 items-center rounded-xl bg-muted/30 py-3 active:opacity-80"
          >
            <Trophy size={20} color={colors.primary} strokeWidth={1.5} />
            <Text className="mt-1 text-sm font-semibold text-foreground">
              {earnedBadges}/{totalBadges}
            </Text>
            <Text className="text-xs text-muted-foreground">badges</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}
