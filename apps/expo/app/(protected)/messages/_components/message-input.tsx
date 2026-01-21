import { Image as ImageIcon, Send } from "lucide-react-native";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText.length > 0) {
      onSend(trimmedText);
      setText("");
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View className="flex-row items-end border-t border-border bg-background px-3 py-2">
      <View className="mr-2 flex-1 flex-row items-end rounded-3xl bg-muted px-4 py-2">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Aa"
          placeholderTextColor="#999"
          className="max-h-24 min-h-[24px] flex-1 text-base text-foreground"
          multiline
          editable={!disabled}
        />
        <Pressable
          className="ml-2 h-8 w-8 items-center justify-center"
          disabled={disabled}
        >
          <ImageIcon size={20} color="#999" />
        </Pressable>
      </View>
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        className="h-10 w-10 items-center justify-center rounded-full bg-primary active:opacity-80 disabled:opacity-50"
        style={{ opacity: canSend ? 1 : 0.5 }}
      >
        <Send size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
