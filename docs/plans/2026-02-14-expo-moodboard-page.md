# Expo Moodboard Page — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Adapt the web moodboard page to Expo React Native — emotion year calendar, week view, bottom sheet picker, mood slider widget, and connect to real API endpoints.

**Architecture:** New API endpoints `GET/POST /api/v1/emotion` on the Next.js backend expose the existing `RecordEmotionUseCase` and `getEmotionYearCalendar` query. Expo app gets a new tab "moodboard" with `Palette` icon, a scrollable page with week/year calendar toggle, emotion bottom sheet picker, and mood widgets. React Query hooks fetch/mutate data.

**Tech Stack:** Next.js API routes, Expo Router tabs, React Native, NativeWind/Tailwind, React Query, lucide-react-native (Palette icon)

---

## Task 1: Backend — Emotion API Controller

**Files:**
- Create: `apps/nextjs/src/adapters/controllers/emotion/emotion.controller.ts`

This controller exposes two endpoints following the exact pattern of `mood.controller.ts`:
- `GET /api/v1/emotion?year=2026` → calls `getEmotionYearCalendar(userId, year)`
- `POST /api/v1/emotion` → calls `RecordEmotionUseCase`

**Step 1: Create the controller**

```typescript
// apps/nextjs/src/adapters/controllers/emotion/emotion.controller.ts
import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import { getEmotionYearCalendar } from "@/adapters/queries/emotion-year-calendar.query";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import type { IRecordEmotionOutputDto } from "@/application/dto/emotion/record-emotion.dto";
import { recordEmotionInputDtoSchema } from "@/application/dto/emotion/record-emotion.dto";
import { getInjection } from "@/common/di/container";

async function getAuthenticatedUser(
  request: Request,
): Promise<IGetSessionOutputDto | null> {
  const useCase = getInjection("GetSessionUseCase");
  const result = await useCase.execute(request.headers);

  if (result.isFailure) {
    return null;
  }

  return match<IGetSessionOutputDto, IGetSessionOutputDto | null>(
    result.getValue(),
    {
      Some: (session) => session,
      None: () => null,
    },
  );
}

export async function getEmotionYearCalendarController(
  request: Request,
): Promise<NextResponse> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const yearParam = url.searchParams.get("year");
  const year = yearParam ? Number.parseInt(yearParam, 10) : new Date().getFullYear();

  if (Number.isNaN(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  try {
    const entries = await getEmotionYearCalendar(session.user.id, year);
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json(
      { error: "Failed to load emotion calendar" },
      { status: 500 },
    );
  }
}

export async function recordEmotionController(
  request: Request,
): Promise<NextResponse<IRecordEmotionOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = recordEmotionInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("RecordEmotionUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 422 });
  }

  const output = result.getValue();
  return NextResponse.json(output, { status: output.isUpdate ? 200 : 201 });
}
```

**Step 2: Create the API route file**

```typescript
// apps/nextjs/app/api/v1/emotion/route.ts
import {
  getEmotionYearCalendarController,
  recordEmotionController,
} from "@/adapters/controllers/emotion/emotion.controller";

export const GET = getEmotionYearCalendarController;
export const POST = recordEmotionController;
```

**Step 3: Run `pnpm fix` and `pnpm type-check`**

Run: `pnpm fix && pnpm type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add apps/nextjs/src/adapters/controllers/emotion/ apps/nextjs/app/api/v1/emotion/
git commit -m "feat(api): add GET/POST /api/v1/emotion endpoints for year calendar and record"
```

---

## Task 2: Expo — Types & React Query Hooks

**Files:**
- Create: `apps/expo/types/emotion.ts`
- Create: `apps/expo/lib/api/hooks/use-emotions.ts`
- Modify: `apps/expo/lib/api/hooks/query-keys.ts` — add `emotionKeys`

**Step 1: Create emotion types**

```typescript
// apps/expo/types/emotion.ts
import type { MoodCategory } from "./mood";

export interface EmotionYearEntry {
  date: string;
  category: MoodCategory;
}

export interface EmotionYearCalendarResponse {
  entries: EmotionYearEntry[];
}

export interface RecordEmotionInput {
  category: MoodCategory;
  emotionDate: string;
}

export interface RecordEmotionResponse {
  id: string;
  userId: string;
  category: string;
  isUpdate: boolean;
}
```

**Step 2: Add query keys**

In `apps/expo/lib/api/hooks/query-keys.ts`, add after `moodboardKeys`:

```typescript
export const emotionKeys = {
  all: ["emotions"] as const,
  yearCalendar: (year: number) =>
    [...emotionKeys.all, "yearCalendar", year] as const,
};
```

**Step 3: Create hooks**

```typescript
// apps/expo/lib/api/hooks/use-emotions.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  EmotionYearCalendarResponse,
  RecordEmotionInput,
  RecordEmotionResponse,
} from "@/types/emotion";
import { api } from "../client";
import { emotionKeys } from "./query-keys";

export { emotionKeys };

export function useEmotionYearCalendar(year: number) {
  return useQuery({
    queryKey: emotionKeys.yearCalendar(year),
    queryFn: () =>
      api.get<EmotionYearCalendarResponse>(
        `/api/v1/emotion?year=${year}`,
      ),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecordEmotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RecordEmotionInput) =>
      api.post<RecordEmotionResponse>("/api/v1/emotion", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emotionKeys.all });
    },
  });
}
```

**Step 4: Run `pnpm fix`**

Run: `cd apps/expo && npx tsc --noEmit` (or just `pnpm fix` at root)

**Step 5: Commit**

```bash
git add apps/expo/types/emotion.ts apps/expo/lib/api/hooks/use-emotions.ts apps/expo/lib/api/hooks/query-keys.ts
git commit -m "feat(expo): add emotion types, query keys, and React Query hooks"
```

---

## Task 3: Expo — Emotion Bottom Sheet Picker

**Files:**
- Create: `apps/expo/components/moodboard/emotion-picker.tsx`

A bottom sheet modal (using RN Modal with `slide` animation + `justifyContent: flex-end`) showing the 9 emotion colors in a 3×3 grid. Follows the `ReactionPicker` pattern from `components/messages/reaction-picker.tsx`.

**Step 1: Create the emotion picker component**

```typescript
// apps/expo/components/moodboard/emotion-picker.tsx
import { Modal, Pressable, Text, View } from "react-native";
import type { MoodCategory } from "@/types/mood";

interface EmotionOption {
  value: MoodCategory;
  label: string;
  color: string;
}

const EMOTION_OPTIONS: EmotionOption[] = [
  { value: "calme", label: "Calme", color: "#0062DD" },
  { value: "enervement", label: "Énervement", color: "#F21622" },
  { value: "excitation", label: "Excitation", color: "#F691C3" },
  { value: "anxiete", label: "Anxiété", color: "#DADADA" },
  { value: "tristesse", label: "Tristesse", color: "#000000" },
  { value: "bonheur", label: "Bonheur", color: "#81C784" },
  { value: "ennui", label: "Ennui", color: "#FDECCE" },
  { value: "nervosite", label: "Nervosité", color: "#F46604" },
  { value: "productivite", label: "Productivité", color: "#FDCB08" },
];

interface EmotionPickerProps {
  visible: boolean;
  selectedDate: string | null;
  onClose: () => void;
  onSelect: (category: MoodCategory) => void;
}

function EmotionPicker({
  visible,
  selectedDate,
  onClose,
  onSelect,
}: EmotionPickerProps) {
  const handleSelect = (category: MoodCategory) => {
    onSelect(category);
    onClose();
  };

  const formattedDate = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
      })
    : "";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl bg-background px-6 pb-10 pt-6"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="mb-1 items-center">
            <View className="mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />
          </View>
          <Text className="mb-1 text-center text-lg font-semibold text-foreground">
            Que ressens-tu ?
          </Text>
          {formattedDate !== "" && (
            <Text className="mb-5 text-center text-sm text-muted-foreground">
              {formattedDate}
            </Text>
          )}
          <View className="flex-row flex-wrap justify-center gap-4">
            {EMOTION_OPTIONS.map((emotion) => (
              <Pressable
                key={emotion.value}
                onPress={() => handleSelect(emotion.value)}
                className="items-center active:opacity-70"
                style={{ width: 80 }}
                accessibilityLabel={emotion.label}
                accessibilityRole="button"
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: emotion.color,
                  }}
                />
                <Text className="mt-1.5 text-xs font-medium text-foreground">
                  {emotion.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export { EmotionPicker, EMOTION_OPTIONS, type EmotionPickerProps };
```

**Step 2: Run `pnpm fix`**

**Step 3: Commit**

```bash
git add apps/expo/components/moodboard/emotion-picker.tsx
git commit -m "feat(expo): add EmotionPicker bottom sheet component"
```

---

## Task 4: Expo — Interactive Year Calendar Component

**Files:**
- Create: `apps/expo/components/moodboard/mood-year-calendar-interactive.tsx`

An interactive year calendar (31 rows × 12 columns) that mirrors the web `MoodYearCalendar`. Tapping a cell opens the EmotionPicker. Uses `ScrollView` horizontal for overflow. Each cell is colored by emotion or empty.

**Step 1: Create the interactive year calendar**

```typescript
// apps/expo/components/moodboard/mood-year-calendar-interactive.tsx
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { MoodCategory } from "@/types/mood";
import { EmotionPicker, EMOTION_OPTIONS } from "./emotion-picker";

interface MoodYearCalendarInteractiveProps {
  year: number;
  moodMap: Map<string, string>;
  onSelectEmotion: (date: string, category: MoodCategory) => void;
  isSubmitting?: boolean;
}

const MONTH_HEADERS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

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
          {/* Month headers */}
          <View className="flex-row" style={{ marginLeft: 20 }}>
            {MONTH_HEADERS.map((label, idx) => (
              <View
                key={`h-${idx}`}
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

          {/* Day rows */}
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
                      key={monthIdx}
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
```

**Step 2: Run `pnpm fix`**

**Step 3: Commit**

```bash
git add apps/expo/components/moodboard/mood-year-calendar-interactive.tsx
git commit -m "feat(expo): add interactive MoodYearCalendarInteractive component"
```

---

## Task 5: Expo — Interactive Week Calendar Component

**Files:**
- Create: `apps/expo/components/moodboard/mood-week-calendar-interactive.tsx`

The week view mirrors the web `MoodWeekCalendar`: 7 columns for current week, tapping a cell opens the EmotionPicker.

**Step 1: Create the interactive week calendar**

```typescript
// apps/expo/components/moodboard/mood-week-calendar-interactive.tsx
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { MoodCategory } from "@/types/mood";
import { EmotionPicker, EMOTION_OPTIONS } from "./emotion-picker";

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

export {
  MoodWeekCalendarInteractive,
  type MoodWeekCalendarInteractiveProps,
};
```

**Step 2: Run `pnpm fix`**

**Step 3: Commit**

```bash
git add apps/expo/components/moodboard/mood-week-calendar-interactive.tsx
git commit -m "feat(expo): add interactive MoodWeekCalendarInteractive component"
```

---

## Task 6: Expo — Moodboard Screen Page

**Files:**
- Create: `apps/expo/app/(protected)/(tabs)/moodboard/_layout.tsx`
- Create: `apps/expo/app/(protected)/(tabs)/moodboard/index.tsx`
- Modify: `apps/expo/app/(protected)/(tabs)/_layout.tsx` — add moodboard tab

This is the main page that assembles everything: title, week/year calendar toggle, legend, and mood slider widget. Layout mirrors the web mobile view.

**Step 1: Create the moodboard tab layout**

```typescript
// apps/expo/app/(protected)/(tabs)/moodboard/_layout.tsx
import { Stack } from "expo-router";

export default function MoodboardLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

**Step 2: Create the main moodboard screen**

```typescript
// apps/expo/app/(protected)/(tabs)/moodboard/index.tsx
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MoodLegend } from "@/components/moodboard/mood-legend";
import { MoodSlider } from "@/components/moodboard/mood-slider";
import { MoodWeekCalendarInteractive } from "@/components/moodboard/mood-week-calendar-interactive";
import { MoodYearCalendarInteractive } from "@/components/moodboard/mood-year-calendar-interactive";
import { useEmotionYearCalendar, useRecordEmotion } from "@/lib/api/hooks/use-emotions";
import { useRecordMood, useTodayMood } from "@/lib/api/hooks/use-mood";
import { colors } from "@/src/config/colors";
import type { MoodCategory } from "@/types/mood";

export default function MoodboardScreen() {
  const year = new Date().getFullYear();
  const [showFullYear, setShowFullYear] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);

  const { data: emotionData, isLoading } = useEmotionYearCalendar(year);
  const recordEmotion = useRecordEmotion();

  const { data: todayMood } = useTodayMood();
  const recordMood = useRecordMood();

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

  const handleValidateMood = useCallback(() => {
    const categories: MoodCategory[] = [
      "tristesse",
      "anxiete",
      "ennui",
      "nervosite",
      "calme",
      "excitation",
      "bonheur",
      "productivite",
      "enervement",
    ];
    const index = Math.min(
      Math.floor(sliderValue / (100 / categories.length)),
      categories.length - 1,
    );
    const category = categories[index] ?? "calme";
    recordMood.mutate({ category, intensity: sliderValue });
  }, [sliderValue, recordMood]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={["top"]}>
        <ActivityIndicator size="large" color={colors.homecafe.yellow} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 pt-4">
          {/* Title */}
          <Text className="text-lg font-bold text-foreground">
            Que ressens-tu aujourd'hui ?
          </Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">
            Colore la case du jour pour un suivi des émotions poussé !
          </Text>

          {/* Calendar */}
          <View className="mt-4">
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
          <View className="mt-4 items-center">
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

          {/* Legend */}
          <View className="mt-6">
            <MoodLegend showCard />
          </View>

          {/* Mood slider widget */}
          <View className="mt-4">
            <MoodSlider
              value={sliderValue}
              onValueChange={setSliderValue}
              onValidate={handleValidateMood}
              showCard
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

**Step 3: Add moodboard tab to `_layout.tsx`**

In `apps/expo/app/(protected)/(tabs)/_layout.tsx`:
- Add `Palette` import from lucide-react-native
- Add `<Tabs.Screen name="moodboard" ...>` with Palette icon, inserted AFTER the `index` tab (position 2)

```typescript
// Modified _layout.tsx — add import
import {
  BookOpen,
  CalendarDays,
  House,
  MessageCircle,
  Palette,
  User,
  Users,
} from "lucide-react-native";

// Add this Tabs.Screen after the "index" screen and before "journal":
<Tabs.Screen
  name="moodboard"
  options={{
    tabBarIcon: ({ color, focused }) => (
      <View>
        <Palette
          size={24}
          color={color}
          fill={focused ? color : "transparent"}
        />
      </View>
    ),
  }}
/>
```

**Step 4: Run `pnpm fix`**

**Step 5: Commit**

```bash
git add apps/expo/app/(protected)/(tabs)/moodboard/ apps/expo/app/(protected)/(tabs)/_layout.tsx
git commit -m "feat(expo): add moodboard tab page with calendar, legend, and mood slider"
```

---

## Task 7: Polish & Final Integration

**Step 1: Verify all imports resolve and no TypeScript errors**

Run: `pnpm fix && pnpm type-check`

**Step 2: Test the full flow**

1. Open Expo app
2. Navigate to Moodboard tab (Palette icon visible)
3. See week calendar with empty cells
4. Tap a cell → bottom sheet appears with 9 emotions
5. Select an emotion → cell colors, API called
6. Toggle "Voir le graphique entier" → year calendar appears
7. Tap a year calendar cell → same bottom sheet
8. Legend card shows 9 moods
9. Mood slider works and records mood

**Step 3: Commit final polish**

```bash
git add -A
git commit -m "feat(expo): moodboard page — polish and integration"
```
