import { FlatList, View, type ViewProps } from "react-native";

import { cn } from "@/src/libs/utils";

import {
  type BadgeColor,
  BadgeItem,
  type BadgeType,
  type StatusDot,
} from "./badge-item";

interface BadgeData {
  id: string;
  color: BadgeColor;
  type: BadgeType;
  statusDots?: [StatusDot, StatusDot, StatusDot];
}

interface BadgeGridProps extends ViewProps {
  badges: BadgeData[];
  badgeSize?: number;
  className?: string;
}

function BadgeGrid({
  badges,
  badgeSize = 100,
  className,
  ...props
}: BadgeGridProps) {
  return (
    <View className={cn("flex-1", className)} {...props}>
      <FlatList
        data={badges}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{
          justifyContent: "space-around",
          marginBottom: 16,
        }}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <BadgeItem
            color={item.color}
            type={item.type}
            statusDots={item.statusDots}
            size={badgeSize}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

export { BadgeGrid, type BadgeGridProps, type BadgeData };
