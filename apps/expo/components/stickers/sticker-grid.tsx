import { FlatList, RefreshControl, View, type ViewProps } from "react-native";

import {
  DEFAULT_STICKER_VISUAL,
  STICKER_VISUAL_MAP,
} from "@/lib/constants/reward-visuals";
import { cn } from "@/src/libs/utils";
import type { RewardCollectionItemDto } from "@/types/reward";

import { StickerItem } from "./sticker-item";

interface StickerGridProps extends ViewProps {
  rewards: RewardCollectionItemDto[];
  stickerSize?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  className?: string;
}

function StickerGrid({
  rewards,
  stickerSize = 80,
  refreshing,
  onRefresh,
  className,
  ...props
}: StickerGridProps) {
  return (
    <View className={cn("flex-1", className)} {...props}>
      <FlatList
        data={rewards}
        numColumns={3}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{
          justifyContent: "space-around",
          marginBottom: 20,
        }}
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing ?? false}
              onRefresh={onRefresh}
            />
          ) : undefined
        }
        renderItem={({ item }) => {
          const visual = STICKER_VISUAL_MAP[item.key] ?? DEFAULT_STICKER_VISUAL;
          return (
            <StickerItem
              type={visual}
              size={stickerSize}
              earned={item.earned}
              label={item.name}
              subtitle={
                item.earned && item.earnedAt
                  ? new Date(item.earnedAt).toLocaleDateString("fr-FR")
                  : item.description
              }
            />
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

export { StickerGrid, type StickerGridProps };
