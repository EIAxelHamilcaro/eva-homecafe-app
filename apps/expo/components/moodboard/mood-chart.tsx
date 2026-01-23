import { Circle } from "@shopify/react-native-skia";
import { Text, View, type ViewProps } from "react-native";
import { Bar, CartesianChart, Line } from "victory-native";

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
    ...d,
    color: d.mood ? MOOD_HEX_COLORS[d.mood] : "#F691C3",
  }));

  const content = (
    <>
      <View className="mb-2">
        <Text className="text-foreground text-lg font-semibold">{title}</Text>
        {subtitle && (
          <Text className="text-muted-foreground text-sm">{subtitle}</Text>
        )}
      </View>
      <View style={{ height }}>
        <CartesianChart
          data={chartData}
          xKey="day"
          yKeys={["value"]}
          padding={{ left: 0, right: 0, top: 10, bottom: 10 }}
          domainPadding={{ left: 20, right: 20, top: 20, bottom: 10 }}
          domain={{ y: [0, 100] }}
        >
          {({ points }) => (
            <>
              <Line
                points={points.value}
                color="#F691C3"
                strokeWidth={2}
                curveType="natural"
              />
              {points.value.map((point, index) => {
                const dataPoint = chartData[index];
                if (!point.x || !point.y) return null;
                return (
                  <Circle
                    key={`point-${point.x}-${point.y}`}
                    cx={point.x}
                    cy={point.y}
                    r={6}
                    color={dataPoint?.color || "#F691C3"}
                  />
                );
              })}
            </>
          )}
        </CartesianChart>
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
  const chartData = data.map((d) => ({
    ...d,
    color: d.mood ? MOOD_HEX_COLORS[d.mood] : "#4ADE80",
  }));

  const content = (
    <>
      <View className="mb-2">
        <Text className="text-foreground text-lg font-semibold">{title}</Text>
        {subtitle && (
          <Text className="text-muted-foreground text-sm">{subtitle}</Text>
        )}
      </View>
      <View style={{ height }}>
        <CartesianChart
          data={chartData}
          xKey="month"
          yKeys={["value"]}
          padding={{ left: 0, right: 0, top: 10, bottom: 30 }}
          domainPadding={{ left: 30, right: 30, top: 20, bottom: 0 }}
          domain={{ y: [0, 100] }}
        >
          {({ points, chartBounds }) => (
            <>
              {points.value.map((point, index) => {
                const dataPoint = chartData[index];
                if (!point.x || point.y === undefined || point.y === null)
                  return null;

                return (
                  <Bar
                    key={`bar-${point.x}`}
                    points={[point]}
                    chartBounds={chartBounds}
                    color={dataPoint?.color || "#4ADE80"}
                    roundedCorners={{ topLeft: 4, topRight: 4 }}
                    barWidth={30}
                  />
                );
              })}
            </>
          )}
        </CartesianChart>
      </View>
      <View className="flex-row justify-around px-2">
        {data.map((d, index) => (
          <Text
            key={`label-${d.month}`}
            className="text-muted-foreground text-xs"
            style={{
              color: d.mood ? MOOD_HEX_COLORS[d.mood] : "#8D7E7E",
            }}
          >
            {MONTH_LABELS[index] || `M${d.month}`}
          </Text>
        ))}
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
