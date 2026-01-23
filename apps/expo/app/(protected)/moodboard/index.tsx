import { type Href, useRouter } from "expo-router";
import { Menu } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BadgeItem } from "@/components/badges/badge-item";
import {
  type MonthlyDataPoint,
  MoodBarChart,
  MoodLineChart,
  type WeeklyDataPoint,
} from "@/components/moodboard/mood-chart";
import { type DayMood, MoodGrid } from "@/components/moodboard/mood-grid";
import { MoodLegend, type MoodType } from "@/components/moodboard/mood-legend";
import { MoodSlider } from "@/components/moodboard/mood-slider";
import { StickerItem } from "@/components/stickers/sticker-item";
import { Button, Logo } from "@/components/ui";

const MOCK_WEEK_MOODS: DayMood[] = [
  { day: "L", mood: "bonheur" },
  { day: "M", mood: "excitation" },
  { day: "Me", mood: "productivite" },
  { day: "J", mood: "bonheur" },
  { day: "V", mood: null },
  { day: "S", mood: null },
  { day: "D", mood: null },
];

const MOCK_WEEKLY_CHART_DATA: WeeklyDataPoint[] = [
  { day: 1, value: 30, mood: "enervement" },
  { day: 2, value: 45, mood: "anxiete" },
  { day: 3, value: 60, mood: "calme" },
  { day: 4, value: 55, mood: "productivite" },
  { day: 5, value: 70, mood: "bonheur" },
  { day: 6, value: 80, mood: "excitation" },
  { day: 7, value: 85, mood: "bonheur" },
];

const MOCK_MONTHLY_CHART_DATA: MonthlyDataPoint[] = [
  { month: 1, value: 40, mood: "enervement" },
  { month: 2, value: 55, mood: "calme" },
  { month: 3, value: 35, mood: "tristesse" },
  { month: 4, value: 65, mood: "productivite" },
  { month: 5, value: 45, mood: "ennui" },
  { month: 6, value: 90, mood: "bonheur" },
];

export default function MoodboardScreen() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<DayMood["day"] | null>(null);
  const [weekMoods, setWeekMoods] = useState<DayMood[]>(MOCK_WEEK_MOODS);
  const [moodValue, setMoodValue] = useState(50);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

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

  const handleDayPress = (day: DayMood["day"]) => {
    setSelectedDay(day);
  };

  const handleValidateGrid = () => {
    if (selectedDay && selectedMood) {
      setWeekMoods((prev) =>
        prev.map((m) =>
          m.day === selectedDay ? { ...m, mood: selectedMood } : m,
        ),
      );
      setSelectedDay(null);
      setSelectedMood(null);
    }
  };

  const handleViewFullGraph = () => {
    router.push("/(protected)/moodboard/tracker" as Href);
  };

  const handleMoodSliderValidate = () => {
    console.log("Mood value submitted:", moodValue);
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

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
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

        {/* Mood Grid Card - "Que ressens-tu aujourd'hui?" */}
        <MoodGrid
          moods={weekMoods}
          selectedDay={selectedDay}
          onDayPress={handleDayPress}
          onValidate={handleValidateGrid}
          onViewFullGraph={handleViewFullGraph}
          className="mb-4"
        />

        {/* Mood Slider Card */}
        <MoodSlider
          value={moodValue}
          onValueChange={setMoodValue}
          onValidate={handleMoodSliderValidate}
          className="mb-4"
        />

        {/* Suivi Weekly Line Chart */}
        <MoodLineChart
          data={MOCK_WEEKLY_CHART_DATA}
          title="Suivi"
          subtitle="Humeurs de la semaine (du 11 au 17 août)"
          trendText="En hausse de 5.2% cette semaine"
          className="mb-4"
        />

        {/* Suivi Monthly Bar Chart */}
        <MoodBarChart
          data={MOCK_MONTHLY_CHART_DATA}
          title="Suivi"
          subtitle="Moodboard janvier → juin 2025"
          trendText="En hausse de 5.2% ce mois-ci"
          className="mb-4"
        />

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
