"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@packages/ui/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface MoodMiniChartProps {
  data: Array<{ category: string; count: number; fill: string }>;
}

const chartConfig = {
  count: {
    label: "Count",
  },
} satisfies ChartConfig;

export function MoodMiniChart({ data }: MoodMiniChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-36 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 0 }}>
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="category"
          type="category"
          tickLine={false}
          axisLine={false}
          width={75}
          tick={{ fontSize: 11 }}
        />
        <XAxis type="number" hide />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
