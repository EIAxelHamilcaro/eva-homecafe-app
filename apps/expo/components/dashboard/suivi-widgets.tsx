import { Pressable, Text, View } from "react-native";

import { useMoodTrends, useMoodWeek } from "@/lib/api/hooks/use-mood";
import { MonthlyMoodChart } from "./monthly-mood-chart";
import { WeeklyMoodChart } from "./weekly-mood-chart";

const DAYS_ORDER = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

const DAY_EN_TO_FR: Record<string, string> = {
  Monday: "lundi",
  Tuesday: "mardi",
  Wednesday: "mercredi",
  Thursday: "jeudi",
  Friday: "vendredi",
  Saturday: "samedi",
  Sunday: "dimanche",
};

const MONTH_LABELS: Record<string, string> = {
  "01": "janvier",
  "02": "février",
  "03": "mars",
  "04": "avril",
  "05": "mai",
  "06": "juin",
  "07": "juillet",
  "08": "août",
  "09": "septembre",
  "10": "octobre",
  "11": "novembre",
  "12": "décembre",
};

const SKELETON_MONTHS = ["s-jan", "s-fev", "s-mar", "s-avr", "s-mai", "s-jun"];
const SKELETON_HEIGHTS = [20, 37, 54, 31, 48, 25];

export function SuiviMonthlyWidget() {
  const {
    data: trends,
    isLoading: isLoadingTrends,
    isError: isErrorTrends,
    refetch: refetchTrends,
  } = useMoodTrends();

  const months = trends?.months ?? [];
  const monthlyTrend = trends?.monthlyTrend ?? "Pas assez de données";

  const chartData = months.map((m) => {
    const monthNum = m.month.split("-")[1] ?? "01";
    return {
      month: MONTH_LABELS[monthNum] ?? monthNum,
      average: m.averageIntensity,
    };
  });

  return (
    <View>
      <View className="rounded-2xl bg-card p-4">
        <Text className="text-lg font-semibold text-foreground">Suivi</Text>
        <Text className="mb-3 text-sm text-muted-foreground">
          Moodboard janvier → juin {new Date().getFullYear()}
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
        ) : chartData.length === 0 ? (
          <View className="h-24 items-center justify-center">
            <Text className="text-sm text-muted-foreground">
              Pas encore de données
            </Text>
          </View>
        ) : (
          <>
            <MonthlyMoodChart data={chartData} />
            <Text className="mt-2 text-xs text-muted-foreground">
              {monthlyTrend} ↗
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

export function SuiviWeeklyWidget() {
  const {
    data: weekData,
    isLoading: isLoadingWeek,
    isError: isErrorWeek,
    refetch: refetchWeek,
  } = useMoodWeek();

  const entries = weekData?.entries ?? [];
  const weeklyTrend = weekData?.weeklyTrend ?? "Pas assez de données";

  const normalizedEntries = entries.map((e) => ({
    ...e,
    dayFr: DAY_EN_TO_FR[e.dayOfWeek] ?? e.dayOfWeek.toLowerCase(),
  }));

  const chartData = DAYS_ORDER.map((day) => {
    const entry = normalizedEntries.find((e) => e.dayFr === day);
    return { day, average: entry?.intensity ?? 0 };
  }).filter((d) => d.average > 0);

  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekLabel = `du ${monday.getDate()} au ${sunday.getDate()} ${sunday.toLocaleDateString("fr-FR", { month: "long" })}`;

  return (
    <View>
      <View className="rounded-2xl bg-card p-4">
        <Text className="text-lg font-semibold text-foreground">Suivi</Text>
        <Text className="mb-3 text-sm text-muted-foreground">
          Humeurs de la semaine ({weekLabel})
        </Text>
        {isLoadingWeek ? (
          <View className="h-24 flex-row items-end justify-between">
            {DAYS_ORDER.map((day) => (
              <View key={`skeleton-${day}`} className="items-center">
                <View className="h-3 w-3 rounded-full bg-muted" />
                <View className="mt-2 h-3 w-3 rounded bg-muted" />
              </View>
            ))}
          </View>
        ) : isErrorWeek ? (
          <View className="h-24 items-center justify-center">
            <Text className="text-sm text-muted-foreground">
              Impossible de charger les données
            </Text>
            <Pressable onPress={() => refetchWeek()}>
              <Text className="mt-1 text-sm text-primary">Réessayer</Text>
            </Pressable>
          </View>
        ) : chartData.length === 0 ? (
          <View className="h-24 items-center justify-center">
            <Text className="text-sm text-muted-foreground">
              Pas encore de données cette semaine
            </Text>
          </View>
        ) : (
          <>
            <WeeklyMoodChart data={chartData} />
            <Text className="mt-2 text-xs text-muted-foreground">
              {weeklyTrend} ↗
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
