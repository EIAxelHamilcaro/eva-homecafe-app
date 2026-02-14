import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MoodSliderWidget } from "@/components/dashboard/mood-slider-widget";
import {
  SuiviMonthlyWidget,
  SuiviWeeklyWidget,
} from "@/components/dashboard/suivi-widgets";
import { JournalBadges } from "@/components/journal/journal-badges";
import { MoodLegend } from "@/components/moodboard/mood-legend";
import { MoodWeekCalendarInteractive } from "@/components/moodboard/mood-week-calendar-interactive";
import { MoodYearCalendarInteractive } from "@/components/moodboard/mood-year-calendar-interactive";
import {
  useEmotionYearCalendar,
  useRecordEmotion,
} from "@/lib/api/hooks/use-emotions";
import { colors } from "@/src/config/colors";
import type { MoodCategory } from "@/types/mood";

function getLocalToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function DateSticker() {
  const now = new Date();
  const month = now
    .toLocaleDateString("fr-FR", { month: "long" })
    .toUpperCase();
  const day = now.getDate();

  return (
    <View className="flex-row items-center overflow-hidden rounded-lg bg-homecafe-green">
      <View
        style={{
          width: 28,
          height: 64,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          className="text-[9px] font-semibold tracking-widest text-white"
          style={{
            transform: [{ rotate: "-90deg" }],
            width: 64,
            textAlign: "center",
          }}
          numberOfLines={1}
        >
          {month}
        </Text>
      </View>
      <Text className="flex-1 pr-2 text-right text-5xl font-bold leading-none text-white">
        {day}
      </Text>
    </View>
  );
}

export default function MoodboardScreen() {
  const year = new Date().getFullYear();
  const today = getLocalToday();
  const [showFullYear, setShowFullYear] = useState(false);

  const { data: emotionData, isLoading } = useEmotionYearCalendar(year);
  const recordEmotion = useRecordEmotion();

  const moodMap = useMemo(() => {
    const map = new Map<string, string>();
    if (emotionData?.entries) {
      for (const entry of emotionData.entries) {
        map.set(entry.date, entry.category);
      }
    }
    return map;
  }, [emotionData]);

  const handleSelectEmotion = useCallback(
    (date: string, category: MoodCategory) => {
      moodMap.set(date, category);
      recordEmotion.mutate({ category, emotionDate: date });
    },
    [moodMap, recordEmotion],
  );

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-background"
        edges={["top"]}
      >
        <ActivityIndicator size="large" color={colors.homecafe.yellow} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="gap-4 px-4 pt-4">
          {/* Date sticker then Legend (matches web sidebar: stacked vertically) */}
          <DateSticker />
          <MoodLegend showCard />

          {/* Title */}
          <View>
            <Text className="text-lg font-bold text-foreground">
              Que ressens-tu aujourd'hui ?
            </Text>
            <Text className="mt-0.5 text-xs text-muted-foreground">
              Colore la case du jour pour un suivi des émotions poussé !
            </Text>
          </View>

          {/* Calendar (week or year) */}
          <View>
            {showFullYear ? (
              <MoodYearCalendarInteractive
                year={year}
                moodMap={moodMap}
                onSelectEmotion={handleSelectEmotion}
                isSubmitting={recordEmotion.isPending}
              />
            ) : (
              <MoodWeekCalendarInteractive
                moodMap={moodMap}
                onSelectEmotion={handleSelectEmotion}
                isSubmitting={recordEmotion.isPending}
              />
            )}
          </View>

          {/* Toggle button */}
          <View className="items-center">
            <Pressable
              onPress={() => setShowFullYear(!showFullYear)}
              className="rounded-full border border-border px-5 py-2 active:opacity-70"
              accessibilityRole="button"
            >
              <Text className="text-sm font-medium text-foreground">
                {showFullYear ? "Voir la semaine" : "Voir le graphique entier"}
              </Text>
            </Pressable>
          </View>

          {/* Mood slider widget (reused from dashboard) */}
          <MoodSliderWidget selectedDate={today} />

          {/* Weekly chart (reused from dashboard) */}
          <SuiviWeeklyWidget />

          {/* Monthly chart (reused from dashboard) */}
          <SuiviMonthlyWidget />

          {/* Badges / Récompenses (reused from journal) */}
          <JournalBadges />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
