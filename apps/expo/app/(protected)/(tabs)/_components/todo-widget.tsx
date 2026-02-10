import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { Checkbox } from "@/components/ui/checkbox";
import { useBoards } from "@/lib/api/hooks/use-boards";
import { colors } from "@/src/config/colors";

export function TodoWidget() {
  const router = useRouter();
  const { data, isLoading } = useBoards("todo", 1, 5);

  const pendingItems = useMemo(() => {
    if (!data?.boards) return [];
    const items: { id: string; title: string; completed: boolean }[] = [];
    for (const board of data.boards) {
      for (const col of board.columns) {
        for (const card of col.cards) {
          if (!card.isCompleted) {
            items.push({
              id: card.id,
              title: card.title,
              completed: false,
            });
          }
        }
      }
    }
    return items.slice(0, 5);
  }, [data]);

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
        {isLoading ? (
          <View className="items-center py-4">
            <ActivityIndicator size="small" />
          </View>
        ) : pendingItems.length === 0 ? (
          <Pressable
            onPress={() => router.push("/organisation" as `/organisation`)}
            className="items-center py-4"
          >
            <Text className="text-muted-foreground">
              Crée ta première liste
            </Text>
          </Pressable>
        ) : (
          pendingItems.map((item) => (
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
          ))
        )}
      </View>
    </View>
  );
}
