import { Plus } from "lucide-react-native";
import { Pressable, Text, View, type ViewProps } from "react-native";
import DraggableFlatList, {
  type RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

import { cn } from "@/src/libs/utils";

import { KanbanCard, type KanbanLabel } from "./kanban-card";

type KanbanCardData = {
  id: string;
  title: string;
  labels?: KanbanLabel[];
  progress?: number;
};

type KanbanColumnProps = ViewProps & {
  id: string;
  title: string;
  cards: KanbanCardData[];
  onCardPress?: (columnId: string, cardId: string) => void;
  onCardReorder?: (columnId: string, cards: KanbanCardData[]) => void;
  onAddCard?: (columnId: string) => void;
  showAddButton?: boolean;
  disabled?: boolean;
};

function KanbanColumn({
  id,
  title,
  cards,
  onCardPress,
  onCardReorder,
  onAddCard,
  showAddButton = true,
  disabled = false,
  className,
  ...props
}: KanbanColumnProps) {
  const handleCardPress = (cardId: string) => {
    if (onCardPress) {
      onCardPress(id, cardId);
    }
  };

  const handleDragEnd = ({ data }: { data: KanbanCardData[] }) => {
    if (onCardReorder) {
      onCardReorder(id, data);
    }
  };

  const handleAddCard = () => {
    if (onAddCard) {
      onAddCard(id);
    }
  };

  const renderItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<KanbanCardData>) => (
    <ScaleDecorator>
      <Pressable onLongPress={drag} disabled={isActive || disabled}>
        <KanbanCard
          id={item.id}
          title={item.title}
          labels={item.labels}
          progress={item.progress}
          onPress={onCardPress ? handleCardPress : undefined}
          disabled={disabled}
          className={cn("mb-2", isActive && "opacity-80")}
        />
      </Pressable>
    </ScaleDecorator>
  );

  return (
    <View
      className={cn("w-64 rounded-xl bg-muted/30 p-3", className)}
      {...props}
    >
      {/* Column Header */}
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="font-semibold text-base text-foreground">{title}</Text>
        <Text className="text-sm text-muted-foreground">{cards.length}</Text>
      </View>

      {/* Cards List */}
      <DraggableFlatList
        data={cards}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onDragEnd={handleDragEnd}
        containerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Card Button */}
      {showAddButton && !disabled && (
        <Pressable
          onPress={handleAddCard}
          className="mt-2 flex-row items-center justify-center gap-2 rounded-lg border border-dashed border-homecafe-grey-light bg-white p-2 active:opacity-60"
          accessibilityRole="button"
          accessibilityLabel="Ajouter une carte"
        >
          <Plus size={16} color="#9CA3AF" strokeWidth={2} />
          <Text className="text-sm text-muted-foreground">Ajouter</Text>
        </Pressable>
      )}
    </View>
  );
}

export { KanbanColumn, type KanbanColumnProps, type KanbanCardData };
