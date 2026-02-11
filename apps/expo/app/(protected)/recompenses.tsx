import { router } from "expo-router";
import { X } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BadgeGrid } from "@/components/badges/badge-grid";
import { useBadges } from "@/lib/api/hooks/use-rewards";
import { colors } from "@/src/config/colors";

function BadgeSkeleton() {
  return (
    <View className="flex-1 px-4 pt-4">
      {[0, 1, 2].map((row) => (
        <View key={row} className="mb-6 flex-row justify-around">
          {[0, 1].map((col) => (
            <View key={col} className="items-center">
              <View className="h-[144] w-[120] rounded-2xl bg-muted" />
              <View className="mt-2 h-3 w-16 rounded-full bg-muted" />
              <View className="mt-1 h-2 w-12 rounded-full bg-muted/60" />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export default function RecompensesModal() {
  const { data, isLoading, error, refetch, isRefetching } = useBadges();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/(tabs)");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
          <Text className="text-xl font-bold text-foreground">
            Mes Récompenses
          </Text>
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink bg-background active:bg-muted"
            accessibilityRole="button"
            accessibilityLabel="Fermer"
          >
            <X size={20} color={colors.foreground} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Loading skeleton */}
        {isLoading && <BadgeSkeleton />}

        {/* Error state */}
        {!isLoading && error && (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="mb-4 text-center text-muted-foreground">
              Impossible de charger les récompenses
            </Text>
            <Pressable
              onPress={() => refetch()}
              className="rounded-xl bg-primary px-6 py-3 active:opacity-80"
            >
              <Text className="font-medium text-primary-foreground">
                Réessayer
              </Text>
            </Pressable>
          </View>
        )}

        {/* Badge grid with pull-to-refresh */}
        {!isLoading && !error && data && data.length > 0 && (
          <BadgeGrid
            rewards={data}
            badgeSize={120}
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            className="flex-1 px-4"
          />
        )}

        {/* Empty state */}
        {!isLoading && !error && data && data.length === 0 && (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-center text-muted-foreground">
              Aucune récompense disponible pour le moment
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
