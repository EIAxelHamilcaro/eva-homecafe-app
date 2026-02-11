import { Pressable, Text, View } from "react-native";
import type { Reaction, ReactionEmoji } from "@/constants/chat";
import { cn } from "@/src/libs/utils";

interface ReactionBarProps {
  reactions: Reaction[];
  userId: string;
  onReactionPress: (emoji: ReactionEmoji) => void;
}

interface GroupedReaction {
  emoji: ReactionEmoji;
  count: number;
  hasUserReacted: boolean;
}

function groupReactions(
  reactions: Reaction[],
  userId: string,
): GroupedReaction[] {
  const groups = new Map<ReactionEmoji, GroupedReaction>();

  for (const reaction of reactions) {
    const existing = groups.get(reaction.emoji);
    if (existing) {
      existing.count += 1;
      if (reaction.userId === userId) {
        existing.hasUserReacted = true;
      }
    } else {
      groups.set(reaction.emoji, {
        emoji: reaction.emoji,
        count: 1,
        hasUserReacted: reaction.userId === userId,
      });
    }
  }

  return Array.from(groups.values());
}

export function ReactionBar({
  reactions,
  userId,
  onReactionPress,
}: ReactionBarProps) {
  if (reactions.length === 0) {
    return null;
  }

  const groupedReactions = groupReactions(reactions, userId);

  return (
    <View className="mt-1 flex-row flex-wrap gap-1">
      {groupedReactions.map((group) => (
        <Pressable
          key={group.emoji}
          onPress={() => onReactionPress(group.emoji)}
          className={cn(
            "flex-row items-center rounded-full px-2 py-0.5",
            group.hasUserReacted
              ? "bg-primary/20 border border-primary"
              : "bg-muted border border-transparent",
          )}
        >
          <Text className="text-sm">{group.emoji}</Text>
          {group.count > 1 && (
            <Text
              className={cn(
                "ml-1 text-xs",
                group.hasUserReacted ? "text-primary" : "text-muted-foreground",
              )}
            >
              {group.count}
            </Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}
