import { Dimensions, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

interface MonthlyMoodChartProps {
  data: { month: string; average: number }[];
}

const CHART_H_PADDING = 64;

export function MonthlyMoodChart({ data }: MonthlyMoodChartProps) {
  if (data.length === 0) return null;

  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - CHART_H_PADDING;

  const count = data.length;
  const barWidth = Math.min(32, Math.floor((chartWidth * 0.5) / count));
  const spacing = Math.floor(
    (chartWidth - barWidth * count) / Math.max(count + 1, 1),
  );

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
            fontSize: 10,
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
    <View style={{ overflow: "hidden" }}>
      <BarChart
        data={chartData}
        barWidth={barWidth}
        height={100}
        width={chartWidth}
        spacing={spacing}
        initialSpacing={spacing}
        disableScroll
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
    </View>
  );
}
