import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Calendar,
  createDot,
  type DotColor,
  type MarkedDate,
} from "@/components/organisation/calendar";
import type { KanbanColumnData } from "@/components/organisation/kanban-board";
import type { KanbanCardData } from "@/components/organisation/kanban-column";

let KanbanBoard:
  | typeof import("@/components/organisation/kanban-board").KanbanBoard
  | null = null;

try {
  const kanban = require("@/components/organisation/kanban-board");
  KanbanBoard = kanban.KanbanBoard;
} catch {
  // react-native-draggable-flatlist requires reanimated native (Expo Go)
}

import {
  Timeline,
  type TimelineEvent,
  type TimelineEventColor,
} from "@/components/organisation/timeline";
import { TodoList } from "@/components/organisation/todo-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  boardKeys,
  useBoards,
  useChronology,
  useMoveCard,
  useUpdateBoard,
} from "@/lib/api/hooks/use-boards";
import type {
  BoardDto,
  ChronologyCard,
  ChronologyEventDate,
  GetBoardsResponse,
} from "@/types/board";

const COLOR_CYCLE: TimelineEventColor[] = [
  "pink",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
];

function buildBoardColorMap(
  cards: ChronologyCard[],
  eventDates: Record<string, ChronologyEventDate>,
): Record<string, TimelineEventColor> {
  const map: Record<string, TimelineEventColor> = {};
  let index = 0;

  for (const card of cards) {
    if (!(card.boardId in map)) {
      map[card.boardId] = COLOR_CYCLE[index % COLOR_CYCLE.length] ?? "pink";
      index++;
    }
  }

  for (const info of Object.values(eventDates)) {
    for (const board of info.boards) {
      if (!(board.id in map)) {
        map[board.id] = COLOR_CYCLE[index % COLOR_CYCLE.length] ?? "pink";
        index++;
      }
    }
  }

  return map;
}

function mapBoardToTodoList(board: BoardDto) {
  return {
    id: board.id,
    title: board.title,
    items: (board.columns[0]?.cards ?? []).map((card) => ({
      id: card.id,
      label: card.title,
      completed: card.isCompleted,
    })),
  };
}

function mapBoardToKanban(board: BoardDto): KanbanColumnData[] {
  return board.columns.map((col) => ({
    id: col.id,
    title: col.title,
    cards: col.cards.map((card) => ({
      id: card.id,
      title: card.title,
      progress: card.progress > 0 ? card.progress : undefined,
    })),
  }));
}

function mapChronologyToTimeline(
  cards: ChronologyCard[],
  colorMap: Record<string, TimelineEventColor>,
): TimelineEvent[] {
  return cards.map((card) => ({
    id: card.id,
    title: `${card.title} (${card.boardTitle})`,
    time: new Date(card.dueDate).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    }),
    color: colorMap[card.boardId] ?? "pink",
  }));
}

function formatRelativeDate(dueDate: string): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) return `${Math.abs(diffDays)}j en retard`;
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Demain";
  return `Dans ${diffDays}j`;
}

function mapChronologyToCalendar(
  eventDates: Record<string, ChronologyEventDate>,
  colorMap: Record<string, TimelineEventColor>,
): Record<string, MarkedDate> {
  const result: Record<string, MarkedDate> = {};
  for (const [date, info] of Object.entries(eventDates)) {
    result[date] = {
      dots: info.boards.map((b) =>
        createDot((colorMap[b.id] ?? "pink") as DotColor, b.id),
      ),
    };
  }
  return result;
}

export default function OrganisationScreen() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("todolist");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [calendarMonth, setCalendarMonth] = useState<string | undefined>();

  const todoBoardsQuery = useBoards("todo");
  const kanbanBoardsQuery = useBoards("kanban");
  const chronologyQuery = useChronology(calendarMonth);
  const updateBoard = useUpdateBoard();
  const moveCard = useMoveCard();

  const todoLists = useMemo(
    () => (todoBoardsQuery.data?.boards ?? []).map(mapBoardToTodoList),
    [todoBoardsQuery.data],
  );

  const kanbanBoards = kanbanBoardsQuery.data?.boards ?? [];

  const boardColorMap = useMemo(
    () =>
      buildBoardColorMap(
        chronologyQuery.data?.cards ?? [],
        chronologyQuery.data?.eventDates ?? {},
      ),
    [chronologyQuery.data],
  );

  const timelineEvents = useMemo(
    () =>
      mapChronologyToTimeline(chronologyQuery.data?.cards ?? [], boardColorMap),
    [chronologyQuery.data?.cards, boardColorMap],
  );

  const markedDates = useMemo(
    () =>
      mapChronologyToCalendar(
        chronologyQuery.data?.eventDates ?? {},
        boardColorMap,
      ),
    [chronologyQuery.data?.eventDates, boardColorMap],
  );

  const upcomingEvents = useMemo((): TimelineEvent[] => {
    const cards = (chronologyQuery.data?.cards ?? [])
      .filter((card) => !card.isCompleted)
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      );
    return cards.map((card) => ({
      id: card.id,
      title: `${card.title} (${card.boardTitle})`,
      time: formatRelativeDate(card.dueDate),
      color: (boardColorMap[card.boardId] ?? "pink") as TimelineEventColor,
    }));
  }, [chronologyQuery.data?.cards, boardColorMap]);

  const handleToggleTodoItem = useCallback(
    (boardId: string, cardId: string, _completed: boolean) => {
      queryClient.setQueryData<GetBoardsResponse>(
        boardKeys.list("todo", 1, 20),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            boards: old.boards.map((board) =>
              board.id === boardId
                ? {
                    ...board,
                    columns: board.columns.map((col) => ({
                      ...col,
                      cards: col.cards.map((card) =>
                        card.id === cardId
                          ? { ...card, isCompleted: !card.isCompleted }
                          : card,
                      ),
                    })),
                  }
                : board,
            ),
          };
        },
      );
      updateBoard.mutate(
        { boardId, toggleCardIds: [cardId] },
        {
          onError: () => {
            queryClient.invalidateQueries({
              queryKey: boardKeys.list("todo", 1, 20),
            });
            Alert.alert("Erreur", "Impossible de modifier l'élément");
          },
        },
      );
    },
    [queryClient, updateBoard],
  );

  const handleAddTodoItem = useCallback(
    (boardId: string, label: string) => {
      updateBoard.mutate(
        { boardId, addCards: [{ title: label }] },
        {
          onError: () => {
            Alert.alert("Erreur", "Impossible d'ajouter l'élément");
          },
        },
      );
    },
    [updateBoard],
  );

  const handleKanbanCardReorder = useCallback(
    (board: BoardDto, columnId: string, newCards: KanbanCardData[]) => {
      const oldColumn = board.columns.find((c) => c.id === columnId);
      if (!oldColumn) return;

      let maxDist = 0;
      let movedCardId = "";
      let movedNewPosition = 0;

      for (let i = 0; i < newCards.length; i++) {
        const card = newCards[i];
        if (!card) continue;
        const oldIdx = oldColumn.cards.findIndex((c) => c.id === card.id);
        if (oldIdx === -1) continue;
        const dist = Math.abs(oldIdx - i);
        if (dist > maxDist) {
          maxDist = dist;
          movedCardId = card.id;
          movedNewPosition = i;
        }
      }

      if (maxDist > 0 && movedCardId) {
        moveCard.mutate(
          {
            boardId: board.id,
            cardId: movedCardId,
            toColumnId: columnId,
            newPosition: movedNewPosition,
          },
          {
            onError: () => {
              queryClient.invalidateQueries({ queryKey: boardKeys.all });
              Alert.alert("Erreur", "Impossible de déplacer la carte");
            },
          },
        );
      }
    },
    [moveCard, queryClient],
  );

  const handleKanbanCardPress = useCallback(
    (board: BoardDto, columnId: string, cardId: string) => {
      const otherColumns = board.columns.filter((c) => c.id !== columnId);
      if (otherColumns.length === 0) return;

      Alert.alert("Déplacer la carte", "Vers quelle colonne ?", [
        ...otherColumns.map((col) => ({
          text: col.title,
          onPress: () => {
            moveCard.mutate(
              {
                boardId: board.id,
                cardId,
                toColumnId: col.id,
                newPosition: 0,
              },
              {
                onError: () => {
                  queryClient.invalidateQueries({ queryKey: boardKeys.all });
                  Alert.alert("Erreur", "Impossible de déplacer la carte");
                },
              },
            );
          },
        })),
        { text: "Annuler", style: "cancel" as const },
      ]);
    },
    [moveCard, queryClient],
  );

  const handleCalendarMonthChange = useCallback(
    (date: { year: number; month: number }) => {
      setCalendarMonth(`${date.year}-${String(date.month).padStart(2, "0")}`);
    },
    [],
  );

  const isRefreshing =
    todoBoardsQuery.isRefetching ||
    kanbanBoardsQuery.isRefetching ||
    chronologyQuery.isRefetching;

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: boardKeys.all });
  }, [queryClient]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 px-4">
        <Text className="mb-4 text-2xl font-bold text-foreground">
          Organisation
        </Text>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList scrollable>
            <TabsTrigger value="todolist">To do list</TabsTrigger>
            <TabsTrigger value="timings">Timings</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="chronologie">Chronologie</TabsTrigger>
            <TabsTrigger value="calendrier">Calendrier</TabsTrigger>
          </TabsList>

          <TabsContent value="todolist">
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 24, paddingBottom: 24 }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              }
            >
              {todoBoardsQuery.isLoading ? (
                <View className="items-center py-12">
                  <ActivityIndicator size="large" />
                </View>
              ) : todoBoardsQuery.isError ? (
                <View className="items-center gap-2 py-12">
                  <Text className="text-destructive">Erreur de chargement</Text>
                  <Pressable onPress={() => todoBoardsQuery.refetch()}>
                    <Text className="text-primary">Réessayer</Text>
                  </Pressable>
                </View>
              ) : todoLists.length === 0 ? (
                <View className="items-center py-12">
                  <Text className="text-muted-foreground">
                    Aucune liste pour le moment
                  </Text>
                </View>
              ) : (
                todoLists.map((list) => (
                  <TodoList
                    key={list.id}
                    id={list.id}
                    title={list.title}
                    items={list.items}
                    onToggleItem={handleToggleTodoItem}
                    onAddItem={handleAddTodoItem}
                  />
                ))
              )}
            </ScrollView>
          </TabsContent>

          <TabsContent value="timings">
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 24, paddingBottom: 24 }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              }
            >
              {chronologyQuery.isLoading ? (
                <View className="items-center py-12">
                  <ActivityIndicator size="large" />
                </View>
              ) : chronologyQuery.isError ? (
                <View className="items-center gap-2 py-12">
                  <Text className="text-destructive">Erreur de chargement</Text>
                  <Pressable onPress={() => chronologyQuery.refetch()}>
                    <Text className="text-primary">Réessayer</Text>
                  </Pressable>
                </View>
              ) : upcomingEvents.length === 0 ? (
                <View className="items-center py-12">
                  <Text className="text-muted-foreground">
                    Aucune échéance à venir
                  </Text>
                </View>
              ) : (
                <Timeline events={upcomingEvents} />
              )}
            </ScrollView>
          </TabsContent>

          <TabsContent value="kanban">
            {kanbanBoardsQuery.isLoading ? (
              <View className="items-center py-12">
                <ActivityIndicator size="large" />
              </View>
            ) : kanbanBoardsQuery.isError ? (
              <View className="items-center gap-2 py-12">
                <Text className="text-destructive">Erreur de chargement</Text>
                <Pressable onPress={() => kanbanBoardsQuery.refetch()}>
                  <Text className="text-primary">Réessayer</Text>
                </Pressable>
              </View>
            ) : kanbanBoards.length === 0 ? (
              <View className="items-center py-12">
                <Text className="text-muted-foreground">
                  Aucun tableau kanban
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 24, paddingBottom: 24 }}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                  />
                }
              >
                {kanbanBoards.map((board) => (
                  <View key={board.id} className="gap-2">
                    <Text className="font-semibold text-base text-foreground">
                      {board.title}
                    </Text>
                    {KanbanBoard ? (
                      <KanbanBoard
                        columns={mapBoardToKanban(board)}
                        onCardPress={(colId, cardId) =>
                          handleKanbanCardPress(board, colId, cardId)
                        }
                        onCardReorder={(colId, cards) =>
                          handleKanbanCardReorder(board, colId, cards)
                        }
                      />
                    ) : (
                      <Text className="text-muted-foreground text-sm p-4">
                        Kanban indisponible dans Expo Go
                      </Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
          </TabsContent>

          <TabsContent value="chronologie">
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 24, paddingBottom: 24 }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              }
            >
              {chronologyQuery.isLoading ? (
                <View className="items-center py-12">
                  <ActivityIndicator size="large" />
                </View>
              ) : chronologyQuery.isError ? (
                <View className="items-center gap-2 py-12">
                  <Text className="text-destructive">Erreur de chargement</Text>
                  <Pressable onPress={() => chronologyQuery.refetch()}>
                    <Text className="text-primary">Réessayer</Text>
                  </Pressable>
                </View>
              ) : timelineEvents.length === 0 ? (
                <View className="items-center py-12">
                  <Text className="text-muted-foreground">
                    Aucun événement dans la chronologie
                  </Text>
                </View>
              ) : (
                <Timeline events={timelineEvents} />
              )}
            </ScrollView>
          </TabsContent>

          <TabsContent value="calendrier">
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              }
            >
              {chronologyQuery.isLoading ? (
                <View className="items-center py-12">
                  <ActivityIndicator size="large" />
                </View>
              ) : chronologyQuery.isError ? (
                <View className="items-center gap-2 py-12">
                  <Text className="text-destructive">Erreur de chargement</Text>
                  <Pressable onPress={() => chronologyQuery.refetch()}>
                    <Text className="text-primary">Réessayer</Text>
                  </Pressable>
                </View>
              ) : (
                <Calendar
                  selectedDate={selectedDate}
                  markedDates={markedDates}
                  onDayPress={(date) => setSelectedDate(date.dateString)}
                  onMonthChange={handleCalendarMonthChange}
                />
              )}
            </ScrollView>
          </TabsContent>
        </Tabs>
      </View>
    </SafeAreaView>
  );
}
