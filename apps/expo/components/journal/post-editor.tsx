import {
  RichText,
  TenTapStartKit,
  useBridgeState,
  useEditorBridge,
  useEditorContent,
} from "@10play/tentap-editor";
import {
  AtSign,
  Bold,
  Image as ImageIcon,
  Italic,
  Underline,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, TextInput, View, type ViewProps } from "react-native";

import { api } from "@/lib/api/client";
import { colors } from "@/src/config/colors";
import { cn } from "@/src/libs/utils";
import type { GetFriendsResponse } from "@/types/friend";
import { type MentionItem, MentionList } from "./mention-list";

type PostEditorProps = ViewProps & {
  initialContent?: string;
  onChangeHTML?: (html: string) => void;
  onImagePress?: () => void;
  editable?: boolean;
  minHeight?: number;
  className?: string;
};

function PostEditor({
  initialContent,
  onChangeHTML,
  onImagePress,
  editable = true,
  minHeight = 200,
  className,
  ...props
}: PostEditorProps): React.JSX.Element {
  const editor = useEditorBridge({
    bridgeExtensions: TenTapStartKit,
    initialContent,
    avoidIosKeyboard: true,
    editable,
  });

  const editorState = useBridgeState(editor);
  const content = useEditorContent(editor, {
    type: "html",
    debounceInterval: 300,
  });

  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [friends, setFriends] = useState<MentionItem[]>([]);
  const friendsLoaded = useRef(false);

  useEffect(() => {
    if (content !== undefined) {
      onChangeHTML?.(content);
    }
  }, [content, onChangeHTML]);

  const loadFriends = useCallback(async () => {
    if (friendsLoaded.current) return;
    friendsLoaded.current = true;
    try {
      const data = await api.get<GetFriendsResponse>(
        "/api/v1/friends?limit=100",
      );
      setFriends(
        data.friends.map((f) => ({
          id: f.userId,
          label: f.displayName || f.name || "Ami",
          avatarUrl: f.avatarUrl,
        })),
      );
    } catch {
      friendsLoaded.current = false;
    }
  }, []);

  const handleMentionPress = useCallback(() => {
    loadFriends();
    setShowMentions(true);
    setMentionQuery("");
  }, [loadFriends]);

  const handleSelectMention = useCallback(
    (item: MentionItem) => {
      const escaped = item.label
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
      const escapedId = item.id.replace(/'/g, "\\'");
      editor.injectJS(
        `editor.commands.insertContent('<span data-type="mention" data-id="${escapedId}" style="color: #0062DD; font-weight: 500;">@${escaped}</span>&nbsp;')`,
      );
      setShowMentions(false);
      setMentionQuery("");
    },
    [editor],
  );

  const filteredFriends = mentionQuery
    ? friends
        .filter((f) =>
          f.label.toLowerCase().includes(mentionQuery.toLowerCase()),
        )
        .slice(0, 8)
    : friends.slice(0, 8);

  return (
    <View
      className={cn(
        "bg-card rounded-xl border border-border overflow-hidden",
        className,
      )}
      {...props}
    >
      <View className="flex-row items-center justify-between px-3 py-2 border-b border-border">
        <View className="flex-row items-center gap-1">
          <FormatButton
            active={editorState.isBoldActive}
            onPress={() => editor.toggleBold()}
          >
            <Bold
              size={18}
              color={
                editorState.isBoldActive ? colors.white : colors.icon.default
              }
              strokeWidth={2.5}
            />
          </FormatButton>

          <FormatButton
            active={editorState.isItalicActive}
            onPress={() => editor.toggleItalic()}
          >
            <Italic
              size={18}
              color={
                editorState.isItalicActive ? colors.white : colors.status.info
              }
              strokeWidth={2}
            />
          </FormatButton>

          <FormatButton
            active={editorState.isUnderlineActive}
            onPress={() => editor.toggleUnderline()}
          >
            <Underline
              size={18}
              color={
                editorState.isUnderlineActive
                  ? colors.white
                  : colors.status.info
              }
              strokeWidth={2}
            />
          </FormatButton>
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={onImagePress}
            className="items-center justify-center w-8 h-8 rounded-md active:opacity-60"
            hitSlop={4}
          >
            <ImageIcon size={20} color={colors.status.info} strokeWidth={2} />
          </Pressable>

          <Pressable
            onPress={handleMentionPress}
            className="items-center justify-center w-8 h-8 rounded-md active:opacity-60"
            hitSlop={4}
          >
            <AtSign size={20} color={colors.status.info} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      {showMentions && (
        <View className="px-3 py-2 border-b border-border">
          <View className="flex-row items-center gap-2 mb-2">
            <TextInput
              autoFocus
              value={mentionQuery}
              onChangeText={setMentionQuery}
              placeholder="Rechercher un ami..."
              placeholderTextColor={colors.mutedForeground}
              className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm text-foreground"
            />
            <Pressable
              onPress={() => setShowMentions(false)}
              className="h-8 w-8 items-center justify-center rounded-full bg-muted active:bg-muted/80"
              hitSlop={4}
            >
              <X size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <MentionList items={filteredFriends} onSelect={handleSelectMention} />
        </View>
      )}

      <View style={{ minHeight }}>
        <RichText editor={editor} />
      </View>
    </View>
  );
}

type FormatButtonProps = {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
};

function FormatButton({
  active,
  onPress,
  children,
}: FormatButtonProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "items-center justify-center w-8 h-8 rounded-md",
        active ? "bg-blue-500" : "bg-transparent",
      )}
      hitSlop={4}
    >
      {children}
    </Pressable>
  );
}

export { PostEditor, type PostEditorProps };
