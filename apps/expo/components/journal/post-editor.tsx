import { AtSign, Bold, Image, Italic, Underline } from "lucide-react-native";
import {
  Pressable,
  TextInput,
  type TextInputProps,
  View,
  type ViewProps,
} from "react-native";

import { cn } from "../../src/libs/utils";

type FormattingOption = "bold" | "italic" | "underline";

type PostEditorProps = ViewProps & {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  activeFormatting?: FormattingOption[];
  onFormatPress?: (format: FormattingOption) => void;
  onImagePress?: () => void;
  onMentionPress?: () => void;
  editable?: boolean;
  maxLength?: number;
  minHeight?: number;
  textInputProps?: Omit<
    TextInputProps,
    "value" | "onChangeText" | "placeholder"
  >;
  className?: string;
};

function PostEditor({
  value = "",
  onChangeText,
  placeholder = "Commence à écrire ici",
  activeFormatting = [],
  onFormatPress,
  onImagePress,
  onMentionPress,
  editable = true,
  maxLength,
  minHeight = 200,
  textInputProps,
  className,
  ...props
}: PostEditorProps) {
  const isFormatActive = (format: FormattingOption) =>
    activeFormatting.includes(format);

  const handleFormatPress = (format: FormattingOption) => {
    onFormatPress?.(format);
  };

  return (
    <View
      className={cn(
        "bg-card rounded-xl border border-border overflow-hidden",
        className,
      )}
      {...props}
    >
      {/* Toolbar */}
      <View className="flex-row items-center justify-between px-3 py-2 border-b border-border">
        {/* Formatting buttons (B/I/U) */}
        <View className="flex-row items-center gap-1">
          {/* Bold button */}
          <Pressable
            onPress={() => handleFormatPress("bold")}
            className={cn(
              "items-center justify-center w-8 h-8 rounded-md",
              isFormatActive("bold") ? "bg-blue-500" : "bg-transparent",
            )}
            hitSlop={4}
          >
            <Bold
              size={18}
              color={isFormatActive("bold") ? "#FFFFFF" : "#374151"}
              strokeWidth={2.5}
            />
          </Pressable>

          {/* Italic button */}
          <Pressable
            onPress={() => handleFormatPress("italic")}
            className={cn(
              "items-center justify-center w-8 h-8 rounded-md",
              isFormatActive("italic") ? "bg-blue-500" : "bg-transparent",
            )}
            hitSlop={4}
          >
            <Italic
              size={18}
              color={isFormatActive("italic") ? "#FFFFFF" : "#3B82F6"}
              strokeWidth={2}
            />
          </Pressable>

          {/* Underline button */}
          <Pressable
            onPress={() => handleFormatPress("underline")}
            className={cn(
              "items-center justify-center w-8 h-8 rounded-md",
              isFormatActive("underline") ? "bg-blue-500" : "bg-transparent",
            )}
            hitSlop={4}
          >
            <Underline
              size={18}
              color={isFormatActive("underline") ? "#FFFFFF" : "#3B82F6"}
              strokeWidth={2}
            />
          </Pressable>
        </View>

        {/* Image and mention buttons */}
        <View className="flex-row items-center gap-2">
          {/* Image button */}
          <Pressable
            onPress={onImagePress}
            className="items-center justify-center w-8 h-8 rounded-md active:opacity-60"
            hitSlop={4}
          >
            <Image size={20} color="#3B82F6" strokeWidth={2} />
          </Pressable>

          {/* Mention button */}
          <Pressable
            onPress={onMentionPress}
            className="items-center justify-center w-8 h-8 rounded-md active:opacity-60"
            hitSlop={4}
          >
            <AtSign size={20} color="#3B82F6" strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      {/* Text input area */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline
        textAlignVertical="top"
        editable={editable}
        maxLength={maxLength}
        style={{ minHeight }}
        className="px-4 py-3 text-base text-foreground leading-6"
        {...textInputProps}
      />
    </View>
  );
}

export { PostEditor, type PostEditorProps, type FormattingOption };
