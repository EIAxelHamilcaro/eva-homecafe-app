import { Image, Pressable, Text, View } from "react-native";
import type { Recipient } from "@/constants/chat";

interface RecipientItemProps {
  recipient: Recipient;
  onPress: () => void;
}

const AVATAR_COLORS = [
  "#F691C3",
  "#FFA500",
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#E91E63",
  "#00BCD4",
  "#FF5722",
] as const;

const DEFAULT_COLOR = "#F691C3";

function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] ?? DEFAULT_COLOR;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function RecipientItem({ recipient, onPress }: RecipientItemProps) {
  const avatarColor = getAvatarColor(recipient.id);
  const initials = getInitials(recipient.name);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3 active:bg-muted"
    >
      {recipient.image ? (
        <Image
          source={{ uri: recipient.image }}
          className="mr-3 h-12 w-12 rounded-full"
        />
      ) : (
        <View
          className="mr-3 h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: avatarColor }}
        >
          <Text className="text-lg font-semibold text-white">{initials}</Text>
        </View>
      )}
      <View className="min-w-0 flex-1">
        <Text className="text-base font-medium text-foreground">
          {recipient.name}
        </Text>
        <Text className="text-sm text-muted-foreground" numberOfLines={1}>
          {recipient.email}
        </Text>
      </View>
    </Pressable>
  );
}
