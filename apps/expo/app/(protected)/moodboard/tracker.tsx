import { router } from "expo-router";
import { X } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { MoodType } from "@/components/moodboard/mood-legend";
import { YearTrackerFull } from "@/components/moodboard/year-tracker";

type DayMood = {
  date: Date;
  mood?: MoodType;
};

function generateMockYearData(year: number): DayMood[] {
  const moods: MoodType[] = [
    "calme",
    "enervement",
    "excitation",
    "anxiete",
    "tristesse",
    "bonheur",
    "ennui",
    "nervosite",
    "productivite",
  ];

  const data: DayMood[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const current = new Date(startDate);
  while (current <= endDate) {
    const hasMood = Math.random() > 0.15;
    data.push({
      date: new Date(current),
      mood: hasMood
        ? moods[Math.floor(Math.random() * moods.length)]
        : undefined,
    });
    current.setDate(current.getDate() + 1);
  }

  return data;
}

const MOCK_YEAR_DATA = generateMockYearData(new Date().getFullYear());

export default function MoodboardTrackerScreen() {
  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/moodboard");
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {/* Close button */}
        <View className="absolute right-4 top-4 z-10">
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink bg-background active:bg-muted"
            accessibilityRole="button"
            accessibilityLabel="Fermer"
          >
            <X size={20} color="#3D2E2E" strokeWidth={2} />
          </Pressable>
        </View>

        {/* Year Tracker */}
        <View className="flex-1 px-4 pt-16">
          <YearTrackerFull
            data={MOCK_YEAR_DATA}
            year={currentYear}
            title="Mood Tracker"
            subtitle={`Année ${currentYear}`}
            cellSize={14}
            cellGap={3}
            showLegend
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
