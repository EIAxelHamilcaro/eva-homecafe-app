import { Modal, Pressable, Text, View } from "react-native";
import { REACTION_EMOJIS, type ReactionEmoji } from "@/constants/chat";

interface ReactionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectReaction: (emoji: ReactionEmoji) => void;
}

export function ReactionPicker({
  visible,
  onClose,
  onSelectReaction,
}: ReactionPickerProps) {
  const handleSelect = (emoji: ReactionEmoji) => {
    onSelectReaction(emoji);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/50"
        onPress={onClose}
      >
        <Pressable
          className="mx-4 rounded-2xl bg-background p-4 shadow-lg"
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="mb-3 text-center text-sm font-medium text-muted-foreground">
            Réagir au message
          </Text>
          <View className="flex-row justify-center gap-2">
            {REACTION_EMOJIS.map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => handleSelect(emoji)}
                className="h-12 w-12 items-center justify-center rounded-full active:bg-muted"
              >
                <Text className="text-2xl">{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
