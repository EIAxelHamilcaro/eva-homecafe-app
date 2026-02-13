"use client";

import {
  type ChartConfig,
  ChartContainer,
} from "@packages/ui/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
} from "recharts";

interface MonthlyMoodChartProps {
  data: { month: string; average: number }[];
}

const chartConfig = {
  centered: {
    label: "Moyenne",
    color: "#04A056",
  },
} satisfies ChartConfig;

export function MonthlyMoodChart({ data }: MonthlyMoodChartProps) {
  const centeredData = data.map((d) => ({
    ...d,
    centered: d.average - 5,
  }));

  return (
    <ChartContainer config={chartConfig} className="min-h-35 w-full">
      <BarChart
        accessibilityLayer
        margin={{ top: 20, bottom: 20, left: -20, right: 0 }}
        data={centeredData}
      >
        <CartesianGrid vertical={false} stroke="#01012E14" />
        <ReferenceLine y={0} stroke="#01012E30" />
        <Bar dataKey="centered">
          <LabelList
            dataKey="month"
            position="top"
            fontSize={12}
            className="capitalize"
            formatter={(value: string) =>
              value.length > 5 ? `${value.slice(0, 3)}.` : value
            }
          />
          {centeredData.map((entry) => (
            <Cell
              key={entry.month}
              fill={entry.centered >= 0 ? "#04A056" : "#F21622"}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
