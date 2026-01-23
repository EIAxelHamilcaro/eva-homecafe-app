import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Checkbox } from "@/components/ui/checkbox";
import { MOCK_TODO_ITEMS } from "@/constants/dashboard-mock-data";
import { colors } from "@/src/config/colors";

export function TodoWidget() {
  const router = useRouter();

  return (
    <View className="mb-4 rounded-2xl bg-card p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground">To do</Text>
        <Pressable
          onPress={() => router.push("/organisation" as `/organisation`)}
          className="flex-row items-center"
        >
          <Text className="mr-1 text-sm text-primary">Voir plus</Text>
          <ChevronRight size={16} color={colors.primary} />
        </Pressable>
      </View>
      <View className="gap-2">
        {MOCK_TODO_ITEMS.map((item) => (
          <View key={item.id} className="flex-row items-center gap-3">
            <Checkbox checked={item.completed} />
            <Text
              className={`flex-1 text-base ${
                item.completed
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
            >
              {item.title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
