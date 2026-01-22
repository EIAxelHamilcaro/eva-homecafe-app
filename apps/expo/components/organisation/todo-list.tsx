import { Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, TextInput, View, type ViewProps } from "react-native";

import { cn } from "@/src/libs/utils";

import { TodoItem } from "./todo-item";

type TodoItemData = {
  id: string;
  label: string;
  completed: boolean;
};

type TodoListProps = ViewProps & {
  id: string;
  title: string;
  items: TodoItemData[];
  onToggleItem?: (listId: string, itemId: string, completed: boolean) => void;
  onPressItem?: (listId: string, itemId: string) => void;
  onAddItem?: (listId: string, label: string) => void;
  showAddInput?: boolean;
  addPlaceholder?: string;
  disabled?: boolean;
};

function TodoList({
  id,
  title,
  items,
  onToggleItem,
  onPressItem,
  onAddItem,
  showAddInput = true,
  addPlaceholder = "Ajouter un élément...",
  disabled = false,
  className,
  ...props
}: TodoListProps) {
  const [newItemText, setNewItemText] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);

  const handleToggleItem = (itemId: string, completed: boolean) => {
    if (onToggleItem) {
      onToggleItem(id, itemId, completed);
    }
  };

  const handlePressItem = (itemId: string) => {
    if (onPressItem) {
      onPressItem(id, itemId);
    }
  };

  const handleAddItem = () => {
    if (newItemText.trim() && onAddItem) {
      onAddItem(id, newItemText.trim());
      setNewItemText("");
      setIsAddingItem(false);
    }
  };

  const handleSubmitEditing = () => {
    handleAddItem();
  };

  return (
    <View className={cn("gap-2", className)} {...props}>
      {/* List Title */}
      <Text className="font-semibold text-base text-foreground">{title}</Text>

      {/* Todo Items */}
      <View className="gap-2">
        {items.map((item) => (
          <TodoItem
            key={item.id}
            id={item.id}
            label={item.label}
            completed={item.completed}
            onToggle={handleToggleItem}
            onPress={onPressItem ? handlePressItem : undefined}
            disabled={disabled}
          />
        ))}
      </View>

      {/* Add New Item */}
      {showAddInput && !disabled && (
        <View className="mt-1">
          {isAddingItem ? (
            <View className="flex-row items-center gap-3">
              <View className="h-5 w-5 items-center justify-center rounded-full border-2 border-homecafe-grey-light bg-white" />
              <TextInput
                value={newItemText}
                onChangeText={setNewItemText}
                placeholder={addPlaceholder}
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={handleSubmitEditing}
                onBlur={() => {
                  if (!newItemText.trim()) {
                    setIsAddingItem(false);
                  }
                }}
                autoFocus
                className="flex-1 text-base text-foreground"
                returnKeyType="done"
              />
            </View>
          ) : (
            <Pressable
              onPress={() => setIsAddingItem(true)}
              className="flex-row items-center gap-3 active:opacity-60"
              accessibilityRole="button"
              accessibilityLabel="Ajouter un nouvel élément"
            >
              <View className="h-5 w-5 items-center justify-center rounded-full border-2 border-dashed border-homecafe-grey-light">
                <Plus size={12} color="#9CA3AF" strokeWidth={2} />
              </View>
              <Text className="text-base text-muted-foreground">
                {addPlaceholder}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export { TodoList, type TodoListProps, type TodoItemData };
