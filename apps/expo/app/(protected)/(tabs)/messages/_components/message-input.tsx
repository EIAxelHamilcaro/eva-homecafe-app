import { Camera, Image as ImageIcon, Send } from "lucide-react-native";
import { useState } from "react";
import {
  ActionSheetIOS,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import type { SelectedMedia } from "./media-picker";
import { pickMediaFromLibrary, takePhoto } from "./media-picker";

interface MessageInputProps {
  onSend: (content: string) => void;
  onMediaSelected: (media: SelectedMedia[]) => void;
  disabled?: boolean;
  hasMedia?: boolean;
}

export function MessageInput({
  onSend,
  onMediaSelected,
  disabled = false,
  hasMedia = false,
}: MessageInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText.length > 0 || hasMedia) {
      onSend(trimmedText);
      setText("");
    }
  };

  const handleImagePress = async () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            "Annuler",
            "Prendre une photo",
            "Choisir depuis la galerie",
          ],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            const photo = await takePhoto();
            if (photo) {
              onMediaSelected([photo]);
            }
          } else if (buttonIndex === 2) {
            const media = await pickMediaFromLibrary({ maxSelection: 10 });
            if (media.length > 0) {
              onMediaSelected(media);
            }
          }
        },
      );
    } else {
      const media = await pickMediaFromLibrary({ maxSelection: 10 });
      if (media.length > 0) {
        onMediaSelected(media);
      }
    }
  };

  const handleCameraPress = async () => {
    const photo = await takePhoto();
    if (photo) {
      onMediaSelected([photo]);
    }
  };

  const canSend = (text.trim().length > 0 || hasMedia) && !disabled;

  return (
    <View className="flex-row items-end border-t border-border bg-background px-3 py-2">
      <Pressable
        onPress={handleCameraPress}
        disabled={disabled}
        className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-primary active:opacity-80"
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        <Camera size={20} color="#FFFFFF" />
      </Pressable>
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
          onPress={handleImagePress}
          className="ml-2 h-8 w-8 items-center justify-center"
          disabled={disabled}
        >
          <ImageIcon size={20} color={disabled ? "#999" : "#666"} />
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
