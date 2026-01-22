import { ScrollView, View, type ViewProps } from "react-native";

import { cn } from "@/src/libs/utils";

import { type KanbanCardData, KanbanColumn } from "./kanban-column";

type KanbanColumnData = {
  id: string;
  title: string;
  cards: KanbanCardData[];
};

type KanbanBoardProps = ViewProps & {
  columns: KanbanColumnData[];
  onCardPress?: (columnId: string, cardId: string) => void;
  onCardReorder?: (columnId: string, cards: KanbanCardData[]) => void;
  onAddCard?: (columnId: string) => void;
  showAddButtons?: boolean;
  disabled?: boolean;
  columnWidth?: number;
};

function KanbanBoard({
  columns,
  onCardPress,
  onCardReorder,
  onAddCard,
  showAddButtons = true,
  disabled = false,
  columnWidth = 256,
  className,
  ...props
}: KanbanBoardProps) {
  return (
    <View className={cn("flex-1", className)} {...props}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
      >
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            cards={column.cards}
            onCardPress={onCardPress}
            onCardReorder={onCardReorder}
            onAddCard={onAddCard}
            showAddButton={showAddButtons}
            disabled={disabled}
            style={{ width: columnWidth }}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export { KanbanBoard, type KanbanBoardProps, type KanbanColumnData };
export type { KanbanCardData } from "./kanban-column";
