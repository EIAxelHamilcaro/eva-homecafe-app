export const POST_REACTION_EMOJIS = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "🎉",
] as const;
export type PostReactionEmoji = (typeof POST_REACTION_EMOJIS)[number];

export function isValidEmoji(emoji: string): emoji is PostReactionEmoji {
  return POST_REACTION_EMOJIS.includes(emoji as PostReactionEmoji);
}
