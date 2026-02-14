import { Dimensions, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

interface WeeklyMoodChartProps {
  data: { day: string; average: number }[];
}

function getMoodColor(average: number): string {
  const value = Math.max(1, Math.min(10, average));
  const ratio = (value - 1) / 9;
  if (ratio <= 0.5) {
    return interpolateColor("#F21622", "#FFD600", ratio * 2);
  }
  return interpolateColor("#FFD600", "#04A056", (ratio - 0.5) * 2);
}

function interpolateColor(
  color1: string,
  color2: string,
  factor: number,
): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);
  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string) {
  const match = hex.replace("#", "").match(/.{1,2}/g);
  if (!match) return { r: 255, g: 255, b: 255 };
  return {
    r: match[0] ? Number.parseInt(match[0], 16) : 255,
    g: match[1] ? Number.parseInt(match[1], 16) : 255,
    b: match[2] ? Number.parseInt(match[2], 16) : 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join("")}`;
}

const CHART_H_PADDING = 64;

export function WeeklyMoodChart({ data }: WeeklyMoodChartProps) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    value: d.average,
    label: d.day.charAt(0).toUpperCase(),
    dataPointColor: getMoodColor(d.average),
  }));

  const lineSegments = data.slice(0, -1).map((d, i) => {
    const midAvg = (d.average + (data[i + 1]?.average ?? d.average)) / 2;
    return {
      startIndex: i,
      endIndex: i + 1,
      color: getMoodColor(midAvg),
    };
  });

  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - CHART_H_PADDING;
  const spacing = Math.floor((chartWidth - 40) / Math.max(chartData.length, 1));

  return (
    <View style={{ overflow: "hidden" }}>
      <LineChart
        data={chartData}
        lineSegments={lineSegments}
        curved
        curvature={0.3}
        thickness={2.5}
        dataPointsRadius={5}
        height={130}
        width={chartWidth}
        spacing={spacing}
        initialSpacing={16}
        endSpacing={8}
        disableScroll
        hideYAxisText
        yAxisThickness={0}
        xAxisThickness={0}
        rulesType="solid"
        rulesColor="#01012E14"
        noOfSections={5}
        maxValue={10}
        xAxisLabelTextStyle={{
          fontSize: 11,
          color: "#888",
          textTransform: "uppercase",
        }}
      />
    </View>
  );
}
