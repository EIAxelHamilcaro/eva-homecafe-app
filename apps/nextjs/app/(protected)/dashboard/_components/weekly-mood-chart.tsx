"use client";

import {
  type ChartConfig,
  ChartContainer,
} from "@packages/ui/components/ui/chart";
import { CartesianGrid, Line, LineChart, ResponsiveContainer } from "recharts";

interface WeeklyMoodChartProps {
  data: { day: string; average: number }[];
  height?: number;
}

const chartConfig = {
  average: {
    label: "Humeur",
    color: "#FFD600",
  },
} satisfies ChartConfig;

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

export function WeeklyMoodChart({ data, height }: WeeklyMoodChartProps) {
  const h = height ?? 150;
  return (
    <ChartContainer
      config={chartConfig}
      className="w-full"
      style={{ minHeight: h }}
    >
      <ResponsiveContainer width="100%" height={h}>
        <LineChart
          data={data}
          margin={{ top: 12, bottom: 12, left: 10, right: 10 }}
        >
          <defs>
            <linearGradient id="moodLineGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#F21622" />
              <stop offset="50%" stopColor="#FFD600" />
              <stop offset="100%" stopColor="#04A056" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#01012E14" />
          <Line
            type="monotone"
            dataKey="average"
            stroke="url(#moodLineGradient)"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload, index } = props as {
                cx: number;
                cy: number;
                index: number;
                payload: { average: number };
              };
              const color = getMoodColor(payload.average);
              return (
                <circle
                  key={index}
                  cx={cx}
                  cy={cy}
                  r={6}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={2}
                />
              );
            }}
            activeDot={{
              r: 7,
              stroke: "#01012E",
              strokeWidth: 2,
              fill: "#fff",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
