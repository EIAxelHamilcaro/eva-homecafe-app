import { router } from "expo-router";
import { Check, X } from "lucide-react-native";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useBadges, useStickers } from "@/lib/api/hooks/use-rewards";
import {
  BADGE_CATEGORIES,
  DEFAULT_EMOJI_BADGE,
  EMOJI_BADGES,
} from "@/lib/constants/reward-visuals";
import { colors } from "@/src/config/colors";
import type { RewardCollectionItemDto } from "@/types/reward";

const STREAK_BADGE_IMAGES: Record<string, ReturnType<typeof require>> = {
  "journal-streak-7": require("@/assets/badges/7j.png"),
  "journal-streak-14": require("@/assets/badges/14j.png"),
  "journal-streak-30": require("@/assets/badges/1month.png"),
};

function RewardIcon({ reward }: { reward: RewardCollectionItemDto }) {
  const streakImage = STREAK_BADGE_IMAGES[reward.key];
  const emojiBadge = EMOJI_BADGES[reward.key] ?? DEFAULT_EMOJI_BADGE;

  return (
    <View className="w-20 items-center gap-1.5">
      <View style={{ opacity: reward.earned ? 1 : 0.3 }}>
        {streakImage ? (
          <View>
            <Image
              source={streakImage}
              style={{ width: 64, height: 64 }}
              resizeMode="contain"
            />
            {reward.earned && (
              <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-green-500">
                <Check size={12} color="white" strokeWidth={3} />
              </View>
            )}
          </View>
        ) : (
          <View>
            <View
              className="h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: emojiBadge.bg }}
            >
              <Text className="text-2xl">{emojiBadge.emoji}</Text>
            </View>
            {reward.earned && (
              <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-green-500">
                <Check size={12} color="white" strokeWidth={3} />
              </View>
            )}
          </View>
        )}
      </View>
      <Text
        className={`text-center text-[10px] leading-tight ${reward.earned ? "font-medium text-foreground" : "text-muted-foreground"}`}
        numberOfLines={2}
      >
        {reward.name}
      </Text>
    </View>
  );
}

export default function RecompensesModal() {
  const { data: badges, isLoading: loadingBadges } = useBadges();
  const { data: stickers, isLoading: loadingStickers } = useStickers();

  const isLoading = loadingBadges || loadingStickers;
  const allRewards = [...(stickers ?? []), ...(badges ?? [])];
  const earnedCount = allRewards.filter((r) => r.earned).length;
  const totalCount = allRewards.length;

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/(tabs)");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
        <View className="flex-row items-center gap-2">
          <Text className="text-xl font-bold text-foreground">
            R{"\u00E9"}compenses
          </Text>
          {!isLoading && (
            <Text className="text-sm text-muted-foreground">
              {earnedCount}/{totalCount}
            </Text>
          )}
        </View>
        <Pressable
          onPress={handleClose}
          className="h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink bg-background active:bg-muted"
          accessibilityRole="button"
          accessibilityLabel="Fermer"
        >
          <X size={20} color={colors.foreground} strokeWidth={2} />
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {BADGE_CATEGORIES.map((category) => {
            const categoryRewards = category.keys
              .map((key) => allRewards.find((r) => r.key === key))
              .filter(Boolean) as RewardCollectionItemDto[];
            if (categoryRewards.length === 0) return null;
            return (
              <View key={category.label} className="mb-6">
                <Text className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {category.label}
                </Text>
                <View className="flex-row flex-wrap gap-4">
                  {categoryRewards.map((reward) => (
                    <RewardIcon key={reward.id} reward={reward} />
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
