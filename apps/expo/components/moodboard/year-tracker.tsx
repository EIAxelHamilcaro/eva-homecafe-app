import { ScrollView, Text, View, type ViewProps } from "react-native";

import { cn } from "@/src/libs/utils";
import type { MoodType } from "./mood-legend";

const MOOD_HEX_COLORS: Record<MoodType, string> = {
  calme: "#7CB9E8",
  enervement: "#E85454",
  excitation: "#FFD93D",
  anxiete: "#9CA3AF",
  tristesse: "#374151",
  bonheur: "#4ADE80",
  ennui: "#FB923C",
  nervosite: "#F472B6",
  productivite: "#A78BFA",
};

const EMPTY_COLOR = "#FFF8F0";

type DayMood = {
  date: Date;
  mood?: MoodType;
};

type YearTrackerCellProps = {
  day: DayMood;
  size?: number;
  gap?: number;
};

function YearTrackerCell({ day, size = 12, gap = 2 }: YearTrackerCellProps) {
  const backgroundColor = day.mood ? MOOD_HEX_COLORS[day.mood] : EMPTY_COLOR;

  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor,
        borderRadius: 2,
        marginRight: gap,
        marginBottom: gap,
      }}
      accessibilityLabel={`${day.date.toLocaleDateString("fr-FR")}${day.mood ? `: ${day.mood}` : ""}`}
    />
  );
}

type YearTrackerProps = ViewProps & {
  data: DayMood[];
  year?: number;
  cellSize?: number;
  cellGap?: number;
  showCard?: boolean;
  className?: string;
};

function generateYearDays(year: number): Date[] {
  const days: Date[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

type DayCell = {
  id: string;
  date: Date | null;
};

type WeekColumn = {
  id: string;
  days: DayCell[];
};

function groupDaysByWeek(days: Date[], year: number): WeekColumn[] {
  const weeks: WeekColumn[] = [];
  let currentWeek: DayCell[] = [];
  let weekNumber = 0;

  const firstDay = days[0];
  if (firstDay) {
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    for (let i = 0; i < mondayOffset; i++) {
      currentWeek.push({
        id: `${year}-w0-placeholder-${i}`,
        date: null,
      });
    }
  }

  for (const day of days) {
    const dateKey = day.toISOString().split("T")[0];
    currentWeek.push({
      id: `day-${dateKey}`,
      date: day,
    });

    if (day.getDay() === 0) {
      weeks.push({
        id: `${year}-week-${weekNumber}`,
        days: currentWeek,
      });
      weekNumber++;
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    let placeholderCount = 0;
    while (currentWeek.length < 7) {
      currentWeek.push({
        id: `${year}-w${weekNumber}-end-placeholder-${placeholderCount}`,
        date: null,
      });
      placeholderCount++;
    }
    weeks.push({
      id: `${year}-week-${weekNumber}`,
      days: currentWeek,
    });
  }

  return weeks;
}

function YearTracker({
  data,
  year = new Date().getFullYear(),
  cellSize = 12,
  cellGap = 2,
  showCard = false,
  className,
  ...props
}: YearTrackerProps) {
  const yearDays = generateYearDays(year);
  const weeks = groupDaysByWeek(yearDays, year);

  const moodMap = new Map<string, MoodType>();
  for (const item of data) {
    const key = item.date.toISOString().split("T")[0];
    if (key && item.mood) {
      moodMap.set(key, item.mood);
    }
  }

  const content = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 4 }}
    >
      <View className="flex-row">
        {weeks.map((week) => (
          <View key={week.id} className="flex-col">
            {week.days.map((dayCell) => {
              if (!dayCell.date) {
                return (
                  <View
                    key={dayCell.id}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      marginRight: cellGap,
                      marginBottom: cellGap,
                    }}
                  />
                );
              }

              const dateKey = dayCell.date.toISOString().split("T")[0];
              const mood = dateKey ? moodMap.get(dateKey) : undefined;

              return (
                <YearTrackerCell
                  key={dayCell.id}
                  day={{ date: dayCell.date, mood }}
                  size={cellSize}
                  gap={cellGap}
                />
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  if (!showCard) {
    return (
      <View className={cn("", className)} {...props}>
        {content}
      </View>
    );
  }

  return (
    <View
      className={cn(
        "bg-card rounded-xl border border-border p-4 shadow-sm",
        className,
      )}
      {...props}
    >
      {content}
    </View>
  );
}

type YearTrackerFullProps = ViewProps & {
  data: DayMood[];
  year?: number;
  title?: string;
  subtitle?: string;
  cellSize?: number;
  cellGap?: number;
  showLegend?: boolean;
  className?: string;
};

function YearTrackerFull({
  data,
  year = new Date().getFullYear(),
  title,
  subtitle,
  cellSize = 12,
  cellGap = 2,
  showLegend = true,
  className,
  ...props
}: YearTrackerFullProps) {
  return (
    <View className={cn("flex-1", className)} {...props}>
      {(title || subtitle) && (
        <View className="mb-4">
          {title && (
            <Text className="text-foreground text-lg font-semibold">
              {title}
            </Text>
          )}
          {subtitle && (
            <Text className="text-muted-foreground text-sm">{subtitle}</Text>
          )}
        </View>
      )}

      <YearTracker
        data={data}
        year={year}
        cellSize={cellSize}
        cellGap={cellGap}
      />

      {showLegend && (
        <View className="mt-4 flex-row flex-wrap gap-x-4 gap-y-2">
          {(Object.entries(MOOD_HEX_COLORS) as [MoodType, string][]).map(
            ([mood, color]) => (
              <View key={mood} className="flex-row items-center gap-1">
                <View
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: color,
                    borderRadius: 2,
                  }}
                />
                <Text className="text-muted-foreground text-xs capitalize">
                  {mood}
                </Text>
              </View>
            ),
          )}
        </View>
      )}
    </View>
  );
}

export {
  YearTracker,
  YearTrackerCell,
  YearTrackerFull,
  MOOD_HEX_COLORS as YEAR_TRACKER_MOOD_COLORS,
  type YearTrackerProps,
  type YearTrackerFullProps,
  type YearTrackerCellProps,
  type DayMood,
};
