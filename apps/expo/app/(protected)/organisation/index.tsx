import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Calendar, createDot } from "../../../components/organisation/calendar";
import {
  KanbanBoard,
  type KanbanColumnData,
} from "../../../components/organisation/kanban-board";
import {
  Timeline,
  type TimelineEvent,
} from "../../../components/organisation/timeline";
import {
  type TodoItemData,
  TodoList,
} from "../../../components/organisation/todo-list";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";

const MOCK_TODO_LISTS: { id: string; title: string; items: TodoItemData[] }[] =
  [
    {
      id: "1",
      title: "To do list 1",
      items: [
        { id: "1-1", label: "Chose à faire n°1", completed: true },
        { id: "1-2", label: "Chose à faire n°2", completed: false },
        { id: "1-3", label: "Chose à faire n°3", completed: false },
        { id: "1-4", label: "Chose à faire n°4", completed: false },
        { id: "1-5", label: "Chose à faire n°5", completed: false },
      ],
    },
    {
      id: "2",
      title: "To do list 2",
      items: [
        { id: "2-1", label: "Chose à faire n°1", completed: true },
        { id: "2-2", label: "Chose à faire n°2", completed: true },
      ],
    },
    {
      id: "3",
      title: "To do list 3",
      items: [],
    },
  ];

const MOCK_KANBAN_COLUMNS: KanbanColumnData[] = [
  {
    id: "todo",
    title: "À faire",
    cards: [
      {
        id: "k1",
        title: "Tâche 1",
        labels: [
          { id: "l1", color: "pink" },
          { id: "l2", color: "orange" },
        ],
        progress: 25,
      },
      {
        id: "k2",
        title: "Tâche 2",
        labels: [{ id: "l3", color: "green" }],
        progress: 50,
      },
    ],
  },
  {
    id: "inprogress",
    title: "En cours",
    cards: [
      {
        id: "k3",
        title: "Tâche 3",
        labels: [{ id: "l4", color: "blue" }],
        progress: 75,
      },
    ],
  },
  {
    id: "done",
    title: "Terminé",
    cards: [
      {
        id: "k4",
        title: "Tâche 4",
        labels: [{ id: "l5", color: "purple" }],
        progress: 100,
      },
    ],
  },
];

const MOCK_TIMELINE_EVENTS: TimelineEvent[] = [
  { id: "t1", title: "Sortie", time: "8h", color: "pink" },
  { id: "t2", title: "Activité", time: "10h", color: "orange" },
  { id: "t3", title: "Repas", time: "12h", color: "yellow" },
  { id: "t4", title: "Repos", time: "14h", color: "green" },
  { id: "t5", title: "Activité", time: "16h", color: "blue" },
];

const MOCK_MARKED_DATES = {
  "2026-01-15": { dots: [createDot("pink"), createDot("orange")] },
  "2026-01-16": { dots: [createDot("green")] },
  "2026-01-20": { dots: [createDot("blue"), createDot("purple")] },
  "2026-01-22": { dots: [createDot("pink")] },
  "2026-01-25": { dots: [createDot("yellow"), createDot("green")] },
};

export default function OrganisationScreen() {
  const [activeTab, setActiveTab] = useState("todolist");
  const [todoLists, setTodoLists] = useState(MOCK_TODO_LISTS);
  const [kanbanColumns, setKanbanColumns] = useState(MOCK_KANBAN_COLUMNS);
  const [selectedDate, setSelectedDate] = useState("2026-01-22");

  const handleToggleTodoItem = (
    listId: string,
    itemId: string,
    completed: boolean,
  ) => {
    setTodoLists((lists) =>
      lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map((item) =>
                item.id === itemId ? { ...item, completed } : item,
              ),
            }
          : list,
      ),
    );
  };

  const handleAddTodoItem = (listId: string, label: string) => {
    setTodoLists((lists) =>
      lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: [
                ...list.items,
                { id: `${listId}-${Date.now()}`, label, completed: false },
              ],
            }
          : list,
      ),
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 px-4">
        {/* Header */}
        <Text className="mb-4 text-2xl font-bold text-foreground">
          Organisation
        </Text>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList scrollable>
            <TabsTrigger value="todolist">To do list</TabsTrigger>
            <TabsTrigger value="timings">Timings</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="chronologie">Chronologie</TabsTrigger>
            <TabsTrigger value="calendrier">Calendrier</TabsTrigger>
          </TabsList>

          {/* To Do List Tab */}
          <TabsContent value="todolist">
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 24, paddingBottom: 24 }}
            >
              {todoLists.map((list) => (
                <TodoList
                  key={list.id}
                  id={list.id}
                  title={list.title}
                  items={list.items}
                  onToggleItem={handleToggleTodoItem}
                  onAddItem={handleAddTodoItem}
                />
              ))}
            </ScrollView>
          </TabsContent>

          {/* Timings Tab */}
          <TabsContent value="timings">
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 24, paddingBottom: 24 }}
            >
              <Timeline
                title="Chronologie 1"
                events={MOCK_TIMELINE_EVENTS}
                showEditButton
                onEdit={() => {}}
              />
            </ScrollView>
          </TabsContent>

          {/* Kanban Tab */}
          <TabsContent value="kanban">
            <KanbanBoard
              columns={kanbanColumns}
              onCardReorder={(columnId, cards) => {
                setKanbanColumns((cols) =>
                  cols.map((col) =>
                    col.id === columnId ? { ...col, cards } : col,
                  ),
                );
              }}
            />
          </TabsContent>

          {/* Chronologie Tab */}
          <TabsContent value="chronologie">
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 24, paddingBottom: 24 }}
            >
              <Timeline
                title="Chronologie 1"
                events={MOCK_TIMELINE_EVENTS}
                showEditButton
                onEdit={() => {}}
              />
              <Timeline
                title="Chronologie 2"
                events={MOCK_TIMELINE_EVENTS.slice(0, 3)}
              />
            </ScrollView>
          </TabsContent>

          {/* Calendrier Tab */}
          <TabsContent value="calendrier">
            <Calendar
              selectedDate={selectedDate}
              markedDates={MOCK_MARKED_DATES}
              onDayPress={(date) => setSelectedDate(date.dateString)}
            />
          </TabsContent>
        </Tabs>
      </View>
    </SafeAreaView>
  );
}
