import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { MoodCategory } from "@/types/mood";
import { EMOTION_OPTIONS, EmotionPicker } from "./emotion-picker";

interface MoodWeekCalendarInteractiveProps {
  moodMap: Map<string, string>;
  onSelectEmotion: (date: string, category: MoodCategory) => void;
  isSubmitting?: boolean;
}

const WEEK_HEADERS = ["L", "M", "M", "J", "V", "S", "D"];

function getWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  });
}

function getColorForCategory(category: string): string {
  return EMOTION_OPTIONS.find((e) => e.value === category)?.color ?? "#BDBDBD";
}

const EMPTY_COLOR = "#F5F0EB";

function MoodWeekCalendarInteractive({
  moodMap,
  onSelectEmotion,
  isSubmitting = false,
}: MoodWeekCalendarInteractiveProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const weekDates = getWeekDates();

  const handleCellPress = useCallback(
    (dateStr: string) => {
      if (isSubmitting) return;
      setSelectedDate(dateStr);
      setPickerVisible(true);
    },
    [isSubmitting],
  );

  const handleEmotionSelect = useCallback(
    (category: MoodCategory) => {
      if (selectedDate) {
        onSelectEmotion(selectedDate, category);
      }
    },
    [selectedDate, onSelectEmotion],
  );

  return (
    <>
      <View className="flex-row justify-between">
        {weekDates.map((dateStr, idx) => {
          const category = moodMap.get(dateStr);
          const bgColor = category
            ? getColorForCategory(category)
            : EMPTY_COLOR;
          const dayNum = dateStr.split("-")[2];

          return (
            <View key={dateStr} className="flex-1 items-center">
              <Text className="mb-1 text-sm font-bold text-foreground">
                {WEEK_HEADERS[idx]}
              </Text>
              <Pressable
                onPress={() => handleCellPress(dateStr)}
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: bgColor,
                  borderRadius: 4,
                }}
                className="items-center justify-center"
                accessibilityLabel={`${WEEK_HEADERS[idx]} ${dayNum}`}
                accessibilityRole="button"
              >
                {!category && (
                  <Text className="text-[10px] text-muted-foreground/60">
                    {dayNum}
                  </Text>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>

      <EmotionPicker
        visible={pickerVisible}
        selectedDate={selectedDate}
        onClose={() => setPickerVisible(false)}
        onSelect={handleEmotionSelect}
      />
    </>
  );
}

export { MoodWeekCalendarInteractive, type MoodWeekCalendarInteractiveProps };
