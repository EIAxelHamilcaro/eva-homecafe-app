import { FlatList, Image, Pressable, Text, View } from "react-native";

export interface MentionItem {
  id: string;
  label: string;
  avatarUrl: string | null;
}

interface MentionListProps {
  items: MentionItem[];
  onSelect: (item: MentionItem) => void;
}

export function MentionList({ items, onSelect }: MentionListProps) {
  if (items.length === 0) {
    return (
      <View className="rounded-lg border border-border bg-card p-3">
        <Text className="text-xs text-muted-foreground">Aucun ami trouvé</Text>
      </View>
    );
  }

  return (
    <View className="max-h-48 rounded-lg border border-border bg-card overflow-hidden">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item)}
            className="flex-row items-center gap-2 px-3 py-2 active:bg-homecafe-pink/10"
          >
            {item.avatarUrl ? (
              <Image
                source={{ uri: item.avatarUrl }}
                className="h-6 w-6 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-6 w-6 items-center justify-center rounded-full bg-homecafe-blue">
                <Text className="text-[10px] font-bold text-white">
                  {item.label.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text className="text-sm text-foreground">{item.label}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
