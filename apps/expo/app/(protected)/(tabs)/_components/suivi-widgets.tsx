import { Text, View } from "react-native";

import {
  MOCK_MONTHLY_DATA,
  MOCK_WEEKLY_DATA,
} from "@/constants/dashboard-mock-data";

export function SuiviWidgets() {
  const maxMonthlyValue = Math.max(...MOCK_MONTHLY_DATA.map((d) => d.value));
  const maxWeeklyValue = Math.max(...MOCK_WEEKLY_DATA.map((d) => d.value));

  return (
    <View className="mb-4">
      <Text className="mb-3 text-lg font-semibold text-foreground">Suivi</Text>

      {/* Monthly bar chart */}
      <View className="mb-3 rounded-2xl bg-card p-4">
        <Text className="mb-3 text-sm font-medium text-muted-foreground">
          Mensuel
        </Text>
        <View className="h-24 flex-row items-end justify-between">
          {MOCK_MONTHLY_DATA.map((item) => (
            <View key={item.month} className="items-center">
              <View
                className="w-6 rounded-t-md bg-primary"
                style={{ height: (item.value / maxMonthlyValue) * 80 }}
              />
              <Text className="mt-1 text-xs text-muted-foreground">
                {item.month}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Weekly line graph (simplified as dots) */}
      <View className="rounded-2xl bg-card p-4">
        <Text className="mb-3 text-sm font-medium text-muted-foreground">
          Hebdomadaire
        </Text>
        <View className="h-16 flex-row items-end justify-between">
          {MOCK_WEEKLY_DATA.map((item, index) => (
            <View key={`${item.day}-${index}`} className="items-center">
              <View
                className="h-3 w-3 rounded-full bg-primary"
                style={{
                  marginBottom: (item.value / maxWeeklyValue) * 40,
                }}
              />
              <Text className="mt-2 text-xs text-muted-foreground">
                {item.day}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
