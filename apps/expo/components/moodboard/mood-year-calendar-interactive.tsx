import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { MoodCategory } from "@/types/mood";
import { EMOTION_OPTIONS, EmotionPicker } from "./emotion-picker";

interface MoodYearCalendarInteractiveProps {
  year: number;
  moodMap: Map<string, string>;
  onSelectEmotion: (date: string, category: MoodCategory) => void;
  isSubmitting?: boolean;
}

const MONTH_HEADERS = [
  "J",
  "F",
  "M",
  "A",
  "M",
  "J",
  "J",
  "A",
  "S",
  "O",
  "N",
  "D",
];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function getColorForCategory(category: string): string {
  return EMOTION_OPTIONS.find((e) => e.value === category)?.color ?? "#BDBDBD";
}

const CELL_SIZE = 24;
const CELL_GAP = 2;
const EMPTY_COLOR = "#F5F0EB";

function MoodYearCalendarInteractive({
  year,
  moodMap,
  onSelectEmotion,
  isSubmitting = false,
}: MoodYearCalendarInteractiveProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View className="flex-row" style={{ marginLeft: 20 }}>
            {MONTH_HEADERS.map((label, monthIndex) => (
              <View
                key={`month-${String(monthIndex)}`}
                style={{
                  width: CELL_SIZE,
                  marginRight: CELL_GAP,
                }}
                className="items-center justify-end"
              >
                <Text className="text-[10px] font-semibold text-foreground">
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {days.map((day) => (
            <View
              key={day}
              className="flex-row items-center"
              style={{ marginTop: CELL_GAP }}
            >
              <View style={{ width: 18 }} className="items-end justify-center">
                <Text className="text-[9px] font-bold text-foreground">
                  {day}
                </Text>
              </View>
              <View style={{ width: 2 }} />
              {Array.from({ length: 12 }, (_, monthIdx) => {
                const maxDays = daysInMonth(monthIdx, year);
                if (day > maxDays) {
                  return (
                    <View
                      key={`empty-${day}-${String(monthIdx)}`}
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        marginRight: CELL_GAP,
                      }}
                    />
                  );
                }

                const dateStr = formatDate(year, monthIdx, day);
                const category = moodMap.get(dateStr);
                const bgColor = category
                  ? getColorForCategory(category)
                  : EMPTY_COLOR;

                return (
                  <Pressable
                    key={dateStr}
                    onPress={() => handleCellPress(dateStr)}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: bgColor,
                      borderRadius: 3,
                      marginRight: CELL_GAP,
                    }}
                    accessibilityLabel={`${day}/${monthIdx + 1}/${year}`}
                    accessibilityRole="button"
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <EmotionPicker
        visible={pickerVisible}
        selectedDate={selectedDate}
        onClose={() => setPickerVisible(false)}
        onSelect={handleEmotionSelect}
      />
    </>
  );
}

export { MoodYearCalendarInteractive, type MoodYearCalendarInteractiveProps };
