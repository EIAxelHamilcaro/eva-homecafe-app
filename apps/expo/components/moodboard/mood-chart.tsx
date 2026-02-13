import { Text, View, type ViewProps } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";

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

type WeeklyDataPoint = {
  day: number;
  value: number;
  mood?: MoodType;
};

type MonthlyDataPoint = {
  month: number;
  value: number;
  mood?: MoodType;
};

type MoodLineChartProps = ViewProps & {
  data: WeeklyDataPoint[];
  title?: string;
  subtitle?: string;
  showCard?: boolean;
  height?: number;
  trendText?: string;
  className?: string;
};

function MoodLineChart({
  data,
  title = "Suivi",
  subtitle = "Humeurs de la semaine",
  showCard = true,
  height = 180,
  trendText,
  className,
  ...props
}: MoodLineChartProps) {
  const chartData = data.map((d) => ({
    value: d.value,
    label: `${d.day}`,
    dataPointColor: d.mood ? MOOD_HEX_COLORS[d.mood] : "#F691C3",
  }));

  const content = (
    <>
      <View className="mb-2">
        <Text className="text-foreground text-lg font-semibold">{title}</Text>
        {subtitle && (
          <Text className="text-muted-foreground text-sm">{subtitle}</Text>
        )}
      </View>
      <View style={{ alignItems: "center" }}>
        <LineChart
          data={chartData}
          curved
          curvature={0.3}
          color="#F691C3"
          thickness={2}
          dataPointsRadius={6}
          height={height - 40}
          spacing={40}
          hideYAxisText
          hideRules
          yAxisThickness={0}
          xAxisThickness={0}
          maxValue={100}
          noOfSections={5}
          xAxisLabelTextStyle={{ fontSize: 10, color: "#888" }}
        />
      </View>
      {trendText && (
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-foreground text-sm">{trendText}</Text>
          <Text className="text-primary text-lg">↗</Text>
        </View>
      )}
    </>
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

const MONTH_LABELS = ["Jan.", "Fév.", "Mars", "Avri", "Mai", "Juin"];

type MoodBarChartProps = ViewProps & {
  data: MonthlyDataPoint[];
  title?: string;
  subtitle?: string;
  showCard?: boolean;
  height?: number;
  trendText?: string;
  className?: string;
};

function MoodBarChart({
  data,
  title = "Suivi",
  subtitle = "Moodboard janvier → juin 2025",
  showCard = true,
  height = 200,
  trendText,
  className,
  ...props
}: MoodBarChartProps) {
  const chartData = data.map((d, index) => ({
    value: d.value,
    label: MONTH_LABELS[index] || `M${d.month}`,
    frontColor: d.mood ? MOOD_HEX_COLORS[d.mood] : "#4ADE80",
    barBorderTopLeftRadius: 4,
    barBorderTopRightRadius: 4,
  }));

  const content = (
    <>
      <View className="mb-2">
        <Text className="text-foreground text-lg font-semibold">{title}</Text>
        {subtitle && (
          <Text className="text-muted-foreground text-sm">{subtitle}</Text>
        )}
      </View>
      <View style={{ alignItems: "center" }}>
        <BarChart
          data={chartData}
          barWidth={30}
          height={height - 60}
          spacing={20}
          hideYAxisText
          hideRules
          yAxisThickness={0}
          xAxisThickness={0}
          maxValue={100}
          noOfSections={5}
          xAxisLabelTextStyle={{ fontSize: 10, color: "#888" }}
        />
      </View>
      {trendText && (
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-foreground text-sm">{trendText}</Text>
          <Text className="text-primary text-lg">↗</Text>
        </View>
      )}
    </>
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

export {
  MoodLineChart,
  MoodBarChart,
  MOOD_HEX_COLORS,
  type MoodLineChartProps,
  type MoodBarChartProps,
  type WeeklyDataPoint,
  type MonthlyDataPoint,
};
