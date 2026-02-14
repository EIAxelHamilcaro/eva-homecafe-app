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
  height?: number;
}

const chartConfig = {
  centered: {
    label: "Moyenne",
    color: "#04A056",
  },
} satisfies ChartConfig;

export function MonthlyMoodChart({ data, height }: MonthlyMoodChartProps) {
  const h = height ?? 140;
  const centeredData = data.map((d) => ({
    ...d,
    centered: d.average - 5,
  }));

  return (
    <ChartContainer
      config={chartConfig}
      className="w-full"
      style={{ minHeight: h }}
    >
      <BarChart
        accessibilityLayer
        margin={{ top: 12, bottom: 12, left: -20, right: 0 }}
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
