import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  type ImageSourcePropType,
  Pressable,
  Text,
  View,
} from "react-native";

import { Card, CardContent } from "@/components/ui/card";
import { useBadges, useStickers } from "@/lib/api/hooks/use-rewards";
import {
  DEFAULT_EMOJI_BADGE,
  EMOJI_BADGES,
} from "@/lib/constants/reward-visuals";
import { colors } from "@/src/config/colors";
import type { RewardCollectionItemDto } from "@/types/reward";

const STREAK_BADGE_IMAGES: Record<string, ImageSourcePropType> = {
  "journal-streak-7": require("@/assets/badges/7j.png"),
  "journal-streak-14": require("@/assets/badges/14j.png"),
  "journal-streak-30": require("@/assets/badges/1month.png"),
};

const FALLBACK_STREAKS: { key: string; source: ImageSourcePropType }[] = [
  { key: "7j", source: require("@/assets/badges/7j.png") },
  { key: "14j", source: require("@/assets/badges/14j.png") },
  { key: "1month", source: require("@/assets/badges/1month.png") },
];

function BadgePreview({ badge }: { badge: RewardCollectionItemDto }) {
  const streakImage = STREAK_BADGE_IMAGES[badge.key];
  const emojiBadge = EMOJI_BADGES[badge.key] ?? DEFAULT_EMOJI_BADGE;

  return (
    <View className="items-center gap-1.5">
      {streakImage ? (
        <Image
          source={streakImage}
          style={{ width: 72, height: 72 }}
          resizeMode="contain"
        />
      ) : (
        <View
          className="h-[72px] w-[72px] items-center justify-center rounded-2xl"
          style={{ backgroundColor: emojiBadge.bg }}
        >
          <Text className="text-2xl">{emojiBadge.emoji}</Text>
        </View>
      )}
      <Text
        className="max-w-20 text-center text-[10px] font-medium leading-tight text-foreground"
        numberOfLines={2}
      >
        {badge.name}
      </Text>
    </View>
  );
}

export function JournalBadges() {
  const router = useRouter();
  const { data: badges, isLoading: loadingBadges } = useBadges();
  const { data: stickers, isLoading: loadingStickers } = useStickers();

  const isLoading = loadingBadges || loadingStickers;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Text className="text-lg font-semibold text-foreground">
            R{"\u00E9"}compenses
          </Text>
          <View className="h-28 items-center justify-center">
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        </CardContent>
      </Card>
    );
  }

  const allRewards = [...(stickers ?? []), ...(badges ?? [])];
  const earnedCount = allRewards.filter((r) => r.earned).length;
  const totalCount = allRewards.length;
  const earnedBadges = allRewards.filter((r) => r.earned).slice(0, 3);

  return (
    <Card>
      <CardContent className="p-6">
        <Text className="text-lg font-semibold text-foreground">
          R{"\u00E9"}compenses
        </Text>
        <Text className="text-xs text-muted-foreground">
          {earnedCount}/{totalCount}
        </Text>
        <View className="mt-4 flex-row items-center justify-center gap-3">
          {earnedBadges.length > 0 ? (
            earnedBadges.map((badge) => (
              <BadgePreview key={badge.id} badge={badge} />
            ))
          ) : (
            <View className="flex-row gap-3">
              {FALLBACK_STREAKS.map((item) => (
                <Image
                  key={item.key}
                  source={item.source}
                  style={{ width: 72, height: 72, opacity: 0.3 }}
                  resizeMode="contain"
                />
              ))}
            </View>
          )}
        </View>
        <Pressable
          onPress={() => router.push("/(protected)/recompenses")}
          className="mt-4 self-start rounded-full bg-primary px-6 py-1.5 active:opacity-90"
        >
          <Text className="text-sm font-medium text-primary-foreground">
            Voir tout
          </Text>
        </Pressable>
      </CardContent>
    </Card>
  );
}
