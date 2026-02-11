import { type Href, useRouter } from "expo-router";
import { Menu } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BadgeItem } from "@/components/badges/badge-item";
import type {
  MonthlyDataPoint,
  WeeklyDataPoint,
} from "@/components/moodboard/mood-chart";

let MoodLineChart:
  | typeof import("@/components/moodboard/mood-chart").MoodLineChart
  | null = null;
let MoodBarChart:
  | typeof import("@/components/moodboard/mood-chart").MoodBarChart
  | null = null;

try {
  const charts = require("@/components/moodboard/mood-chart");
  MoodLineChart = charts.MoodLineChart;
  MoodBarChart = charts.MoodBarChart;
} catch {
  // Skia/Reanimated native modules not available (Expo Go)
}

import { type DayMood, MoodGrid } from "@/components/moodboard/mood-grid";
import {
  MOOD_COLORS,
  MOODS,
  MoodLegend,
  type MoodType,
} from "@/components/moodboard/mood-legend";
import { MoodSlider } from "@/components/moodboard/mood-slider";
import { StickerItem } from "@/components/stickers/sticker-item";
import { Button, Logo } from "@/components/ui";
import {
  useMoodTrends,
  useMoodWeek,
  useRecordMood,
  useTodayMood,
} from "@/lib/api/hooks/use-mood";
import { cn } from "@/src/libs/utils";
import type { MoodTrendsMonth, MoodWeekEntry } from "@/types/mood";

type DayOfWeekEN =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

const DAY_MAP: Record<DayOfWeekEN, DayMood["day"]> = {
  Monday: "L",
  Tuesday: "M",
  Wednesday: "Me",
  Thursday: "J",
  Friday: "V",
  Saturday: "S",
  Sunday: "D",
};

const WEEK_ORDER: DayOfWeekEN[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function mapWeekToGrid(entries: MoodWeekEntry[]): DayMood[] {
  return WEEK_ORDER.map((day) => {
    const entry = entries.find((e) => e.dayOfWeek === day);
    return {
      day: DAY_MAP[day],
      mood: entry?.category ?? null,
    };
  });
}

function mapWeekToChart(entries: MoodWeekEntry[]): WeeklyDataPoint[] {
  return entries.map((e, i) => ({
    day: i + 1,
    value: e.intensity * 10,
    mood: e.category,
  }));
}

function mapTrendsToChart(months: MoodTrendsMonth[]): MonthlyDataPoint[] {
  return months.map((m, i) => ({
    month: i + 1,
    value: m.averageIntensity * 10,
    mood: m.dominantCategory,
  }));
}

export default function MoodboardScreen() {
  const router = useRouter();
  const [moodValue, setMoodValue] = useState(5);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const todayMood = useTodayMood();
  const moodWeek = useMoodWeek();
  const moodTrends = useMoodTrends();
  const recordMood = useRecordMood();

  useEffect(() => {
    if (todayMood.data) {
      setSelectedMood(todayMood.data.category);
      setMoodValue(todayMood.data.intensity);
    }
  }, [todayMood.data]);

  const weekMoods = useMemo<DayMood[]>(() => {
    if (!moodWeek.data?.entries)
      return WEEK_ORDER.map((d) => ({ day: DAY_MAP[d], mood: null }));
    return mapWeekToGrid(moodWeek.data.entries);
  }, [moodWeek.data]);

  const weeklyChartData = useMemo<WeeklyDataPoint[]>(() => {
    if (!moodWeek.data?.entries?.length) return [];
    return mapWeekToChart(moodWeek.data.entries);
  }, [moodWeek.data]);

  const monthlyChartData = useMemo<MonthlyDataPoint[]>(() => {
    if (!moodTrends.data?.months?.length) return [];
    return mapTrendsToChart(moodTrends.data.months);
  }, [moodTrends.data]);

  const todayRefetch = todayMood.refetch;
  const weekRefetch = moodWeek.refetch;
  const trendsRefetch = moodTrends.refetch;

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([todayRefetch(), weekRefetch(), trendsRefetch()]);
    setIsRefreshing(false);
  }, [todayRefetch, weekRefetch, trendsRefetch]);

  const currentDate = new Date();
  const monthNames = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];

  const handleStickersPress = () => {
    router.push("/(protected)/stickers" as Href);
  };

  const handleViewFullGraph = () => {
    router.push("/(protected)/moodboard/tracker" as Href);
  };

  const handleMoodSliderValidate = () => {
    if (!selectedMood) return;
    recordMood.mutate(
      { category: selectedMood, intensity: moodValue },
      {
        onSuccess: (data) => {
          Alert.alert(
            data.isUpdate ? "Humeur modifiée" : "Humeur enregistrée",
            `${MOODS.find((m) => m.key === selectedMood)?.label} — intensité ${moodValue}/10`,
          );
        },
      },
    );
  };

  const handleMenuPress = () => {
    router.push("/(protected)/settings" as Href);
  };

  const handleRewardsPress = () => {
    router.push("/(protected)/recompenses" as Href);
  };

  const handleInviteFriends = () => {
    console.log("Invite friends pressed");
  };

  const isLoading = todayMood.isLoading || moodWeek.isLoading;
  const hasError = todayMood.isError || moodWeek.isError;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with Logo and Menu */}
        <View className="flex-row items-center justify-between py-4">
          <Logo width={80} />
          <Pressable
            onPress={handleMenuPress}
            className="active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Menu"
          >
            <Menu size={28} color="#3D2E2E" />
          </Pressable>
        </View>

        {/* Date with Stickers button */}
        <View className="mb-6 flex-row items-center gap-3">
          <View className="bg-primary rounded-xl px-4 py-3">
            <Text className="text-center text-sm text-white">
              {monthNames[currentDate.getMonth()]}
            </Text>
            <Text className="text-center text-3xl font-bold text-white">
              {currentDate.getDate()}
            </Text>
          </View>

          <View className="flex-1 flex-row items-center gap-2">
            <StickerItem type="bubble_tea" size={40} />
            <StickerItem type="coffee_cup" size={35} />
          </View>

          <Pressable
            onPress={handleStickersPress}
            className="rounded-xl border border-primary bg-white px-4 py-2 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Stickers"
          >
            <Text className="text-primary text-sm font-medium">Stickers</Text>
          </Pressable>
        </View>

        {/* Mood Legend Card */}
        <MoodLegend className="mb-4" />

        {/* Mood Grid Card */}
        {isLoading ? (
          <View className="bg-card mb-4 items-center justify-center rounded-xl border border-border p-8">
            <ActivityIndicator size="small" />
          </View>
        ) : hasError ? (
          <Pressable
            onPress={() => {
              todayMood.refetch();
              moodWeek.refetch();
            }}
            className="bg-card mb-4 items-center rounded-xl border border-border p-6"
          >
            <Text className="text-muted-foreground text-sm">
              Erreur de chargement. Appuie pour réessayer.
            </Text>
          </Pressable>
        ) : (
          <MoodGrid
            moods={weekMoods}
            onViewFullGraph={handleViewFullGraph}
            showActions={true}
            className="mb-4"
          />
        )}

        {/* Mood Category Picker */}
        <View className="bg-card mb-4 rounded-xl border border-border p-4 shadow-sm">
          <Text className="text-foreground mb-2 text-lg font-semibold">
            Choisis ton humeur
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {MOODS.map((mood) => (
              <Pressable
                key={mood.key}
                onPress={() => setSelectedMood(mood.key)}
                className={cn(
                  "flex-row items-center gap-1.5 rounded-full border px-3 py-1.5",
                  selectedMood === mood.key
                    ? "border-primary bg-primary/10"
                    : "border-border",
                )}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedMood === mood.key }}
                accessibilityLabel={mood.label}
              >
                <View
                  className={cn("h-3 w-3 rounded-full", MOOD_COLORS[mood.key])}
                />
                <Text
                  className={cn(
                    "text-xs",
                    selectedMood === mood.key
                      ? "text-primary font-medium"
                      : "text-foreground",
                  )}
                >
                  {mood.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Mood Slider Card */}
        <MoodSlider
          value={moodValue}
          onValueChange={setMoodValue}
          onValidate={handleMoodSliderValidate}
          min={1}
          max={10}
          step={1}
          disabled={!selectedMood || recordMood.isPending}
          validateLabel={todayMood.data ? "Modifier" : "Valider"}
          className="mb-4"
        />

        {recordMood.isError && (
          <View className="mb-4 rounded-lg bg-red-50 p-3">
            <Text className="text-sm text-red-600">
              Erreur lors de l'enregistrement. Réessaye.
            </Text>
          </View>
        )}

        {/* Suivi Weekly Line Chart */}
        {MoodLineChart && weeklyChartData.length > 0 && (
          <MoodLineChart
            data={weeklyChartData}
            title="Suivi"
            subtitle="Humeurs de la semaine"
            className="mb-4"
          />
        )}

        {/* Suivi Monthly Bar Chart */}
        {MoodBarChart && monthlyChartData.length > 0 && (
          <MoodBarChart
            data={monthlyChartData}
            title="Suivi"
            subtitle="Tendances sur 6 mois"
            className="mb-4"
          />
        )}

        {/* Badges Card */}
        <Pressable
          onPress={handleRewardsPress}
          className="bg-card mb-4 rounded-xl border border-border p-4 shadow-sm active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Voir les badges"
        >
          <View className="mb-3">
            <Text className="text-foreground text-lg font-semibold">
              Badges
            </Text>
            <Text className="text-muted-foreground text-sm">
              Tous les badges que tu as obtenu en tenant un journal régulier
            </Text>
          </View>

          <View className="flex-row justify-around">
            <BadgeItem
              color="orange"
              type="7_JOURS"
              statusDots={["green", "orange", "pink"]}
              size={80}
            />
            <BadgeItem
              color="blue"
              type="14_JOURS"
              statusDots={["green", "green", "gray"]}
              size={80}
            />
            <BadgeItem
              color="yellow"
              type="1_MOIS"
              statusDots={["pink", "gray", "gray"]}
              size={80}
            />
          </View>
        </Pressable>

        {/* Invite Friends Button */}
        <Button
          onPress={handleInviteFriends}
          variant="outline"
          className="border-primary mb-4"
        >
          <Text className="text-primary font-medium">Inviter des ami•es</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
