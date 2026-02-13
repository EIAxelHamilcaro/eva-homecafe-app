import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { WidgetEmptyState } from "@/components/dashboard/widget-empty-state";
import { useBoards } from "@/lib/api/hooks/use-boards";

function getLocalDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isOverdue(dueDate: string): boolean {
  return dueDate < getLocalDateString();
}

export function TodoWidget() {
  const router = useRouter();
  const { data, isLoading } = useBoards("todo", 1, 5);

  const pendingItems = useMemo(() => {
    if (!data?.boards) return [];
    const items: {
      id: string;
      title: string;
      completed: boolean;
      boardTitle: string;
      dueDate: string | null;
    }[] = [];
    for (const board of data.boards) {
      for (const col of board.columns) {
        for (const card of col.cards) {
          if (!card.isCompleted) {
            items.push({
              id: card.id,
              title: card.title,
              completed: false,
              boardTitle: board.title,
              dueDate: (card as { dueDate?: string | null }).dueDate ?? null,
            });
          }
        }
      }
    }
    return items.slice(0, 5);
  }, [data]);

  const isEmpty = !isLoading && pendingItems.length === 0;

  if (isEmpty && (!data?.boards || data.boards.length === 0)) {
    return <WidgetEmptyState type="tasks" />;
  }

  return (
    <View className="rounded-2xl bg-card p-4">
      <Text className="text-lg font-semibold text-foreground">To do list</Text>
      <Text className="mb-3 text-sm text-muted-foreground">
        Ceci est un affichage restreint
      </Text>
      <View className="gap-2">
        {isLoading ? (
          <View className="items-center py-4">
            <ActivityIndicator size="small" />
          </View>
        ) : pendingItems.length === 0 ? (
          <View className="items-center py-4">
            <Text className="font-medium text-muted-foreground">
              Toutes les tâches sont terminées !
            </Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Bravo — tu es à jour.
            </Text>
          </View>
        ) : (
          pendingItems.map((item) => (
            <View key={item.id} className="flex-row items-start gap-2">
              <View className="mt-1 h-4 w-4 rounded border border-muted-foreground/30" />
              <View className="min-w-0 flex-1">
                <Text className="text-sm text-foreground" numberOfLines={1}>
                  {item.title}
                </Text>
                {item.dueDate && (
                  <Text className="text-xs text-muted-foreground">
                    {item.boardTitle}
                    <Text
                      className={
                        isOverdue(item.dueDate)
                          ? "font-medium text-destructive"
                          : ""
                      }
                    >
                      {" · Échéance : "}
                      {item.dueDate}
                    </Text>
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>
      <Pressable
        onPress={() => router.push("/organisation" as `/organisation`)}
        className="mt-4 self-start rounded-full bg-homecafe-pink px-4 py-1.5 active:opacity-90"
      >
        <Text className="text-sm font-medium text-white">Voir plus</Text>
      </Pressable>
    </View>
  );
}
