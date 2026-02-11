import { Pressable, Text, View } from "react-native";

import { useMoodTrends, useMoodWeek } from "@/lib/api/hooks/use-mood";

const DAYS_ORDER = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];
const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];
const SKELETON_MONTHS = ["s-jan", "s-fev", "s-mar", "s-avr", "s-mai", "s-jun"];
const SKELETON_HEIGHTS = [20, 37, 54, 31, 48, 25];

export function SuiviWidgets() {
  const {
    data: trends,
    isLoading: isLoadingTrends,
    isError: isErrorTrends,
    refetch: refetchTrends,
  } = useMoodTrends();
  const {
    data: weekData,
    isLoading: isLoadingWeek,
    isError: isErrorWeek,
    refetch: refetchWeek,
  } = useMoodWeek();

  const monthlyData =
    trends?.months.map((m) => {
      const [year, monthNum] = m.month.split("-");
      return {
        month: new Date(Number(year), Number(monthNum) - 1).toLocaleDateString(
          "fr-FR",
          { month: "short" },
        ),
        value: Math.round(m.averageIntensity * 10),
      };
    }) ?? [];

  const maxMonthlyValue = Math.max(...monthlyData.map((d) => d.value), 1);

  const weeklyData = DAYS_ORDER.map((day, i) => {
    const entry = weekData?.entries.find((e) => e.dayOfWeek === day);
    return { day: DAY_LABELS[i], value: entry?.intensity ?? 0 };
  });

  const maxWeeklyValue = Math.max(...weeklyData.map((d) => d.value), 1);

  return (
    <View className="mb-4">
      <Text className="mb-3 text-lg font-semibold text-foreground">Suivi</Text>

      {/* Monthly bar chart */}
      <View className="mb-3 rounded-2xl bg-card p-4">
        <Text className="mb-3 text-sm font-medium text-muted-foreground">
          Mensuel
        </Text>
        {isLoadingTrends ? (
          <View className="h-24 flex-row items-end justify-between">
            {SKELETON_MONTHS.map((key, i) => (
              <View key={key} className="items-center">
                <View
                  className="w-6 rounded-t-md bg-muted"
                  style={{ height: SKELETON_HEIGHTS[i] }}
                />
                <View className="mt-1 h-3 w-4 rounded bg-muted" />
              </View>
            ))}
          </View>
        ) : isErrorTrends ? (
          <View className="h-24 items-center justify-center">
            <Text className="text-sm text-muted-foreground">
              Impossible de charger les données
            </Text>
            <Pressable onPress={() => refetchTrends()}>
              <Text className="mt-1 text-sm text-primary">Réessayer</Text>
            </Pressable>
          </View>
        ) : monthlyData.length === 0 ? (
          <View className="h-24 items-center justify-center">
            <Text className="text-sm text-muted-foreground">
              Pas encore de données
            </Text>
          </View>
        ) : (
          <View className="h-24 flex-row items-end justify-between">
            {monthlyData.map((item) => (
              <View key={item.month} className="items-center">
                <View
                  className="w-6 rounded-t-md bg-primary"
                  style={{ height: (item.value / maxMonthlyValue) * 80 }}
                />
                <Text className="mt-1 text-xs text-muted-foreground">
                  {item.month}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Weekly line graph (simplified as dots) */}
      <View className="rounded-2xl bg-card p-4">
        <Text className="mb-3 text-sm font-medium text-muted-foreground">
          Hebdomadaire
        </Text>
        {isLoadingWeek ? (
          <View className="h-16 flex-row items-end justify-between">
            {DAYS_ORDER.map((day) => (
              <View key={`skeleton-${day}`} className="items-center">
                <View className="h-3 w-3 rounded-full bg-muted" />
                <View className="mt-2 h-3 w-3 rounded bg-muted" />
              </View>
            ))}
          </View>
        ) : isErrorWeek ? (
          <View className="h-16 items-center justify-center">
            <Text className="text-sm text-muted-foreground">
              Impossible de charger les données
            </Text>
            <Pressable onPress={() => refetchWeek()}>
              <Text className="mt-1 text-sm text-primary">Réessayer</Text>
            </Pressable>
          </View>
        ) : weeklyData.every((d) => d.value === 0) ? (
          <View className="h-16 items-center justify-center">
            <Text className="text-sm text-muted-foreground">
              Pas encore de données
            </Text>
          </View>
        ) : (
          <View className="h-16 flex-row items-end justify-between">
            {weeklyData.map((item, index) => (
              <View key={DAYS_ORDER[index]} className="items-center">
                <View
                  className="h-3 w-3 rounded-full bg-primary"
                  style={{
                    marginBottom: (item.value / maxWeeklyValue) * 40,
                  }}
                />
                <Text className="mt-2 text-xs text-muted-foreground">
                  {item.day}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
