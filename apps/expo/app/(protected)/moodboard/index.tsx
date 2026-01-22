import { type Href, useRouter } from "expo-router";
import { Menu } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  type DayMood,
  MoodGrid,
} from "../../../components/moodboard/mood-grid";
import {
  MoodLegend,
  type MoodType,
} from "../../../components/moodboard/mood-legend";
import { MoodSlider } from "../../../components/moodboard/mood-slider";
import { StickerItem } from "../../../components/stickers/sticker-item";
import { Logo } from "../../../components/ui";

const MOCK_WEEK_MOODS: DayMood[] = [
  { day: "L", mood: "bonheur" },
  { day: "M", mood: "excitation" },
  { day: "Me", mood: "productivite" },
  { day: "J", mood: "bonheur" },
  { day: "V", mood: null },
  { day: "S", mood: null },
  { day: "D", mood: null },
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
      </ScrollView>
    </SafeAreaView>
  );
}
