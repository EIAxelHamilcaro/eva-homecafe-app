import { Text } from "react-native";
import { BarChart } from "react-native-gifted-charts";

interface MonthlyMoodChartProps {
  data: { month: string; average: number }[];
}

export function MonthlyMoodChart({ data }: MonthlyMoodChartProps) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => {
    const centered = d.average - 5;
    const label = d.month.length > 3 ? `${d.month.slice(0, 3)}.` : d.month;
    return {
      value: centered,
      frontColor: centered >= 0 ? "#04A056" : "#F21622",
      barBorderTopLeftRadius: centered >= 0 ? 2 : 0,
      barBorderTopRightRadius: centered >= 0 ? 2 : 0,
      barBorderBottomLeftRadius: centered < 0 ? 2 : 0,
      barBorderBottomRightRadius: centered < 0 ? 2 : 0,
      topLabelComponent: () => (
        <Text
          style={{
            fontSize: 11,
            color: centered >= 0 ? "#04A056" : "#F21622",
            textTransform: "capitalize",
            textAlign: "center",
            marginBottom: 2,
          }}
        >
          {label}
        </Text>
      ),
    };
  });

  return (
    <BarChart
      data={chartData}
      barWidth={28}
      height={100}
      spacing={24}
      mostNegativeValue={-5}
      maxValue={5}
      noOfSections={2}
      noOfSectionsBelowXAxis={2}
      hideYAxisText
      yAxisThickness={0}
      xAxisThickness={1}
      xAxisColor="#01012E20"
      rulesType="solid"
      rulesColor="#01012E14"
      hideOrigin
    />
  );
}
