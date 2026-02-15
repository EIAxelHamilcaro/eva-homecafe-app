import { useRouter } from "expo-router";
import { Award, Check, X } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { cn } from "@/src/libs/utils";
import type { Notification } from "@/types/notification";

interface NotificationItemProps {
  notification: Notification;
  senderImage?: string | null;
  onPress: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
  responded?: boolean;
}

const AVATAR_COLORS: Record<string, string> = {
  friend_request: "#6366F1",
  friend_accepted: "#22C55E",
  new_message: "#A855F7",
  post_reaction: "#EC4899",
  post_comment: "#3B82F6",
};

const ACHIEVEMENT_FR: Record<string, { name: string; description: string }> = {
  "first-post": {
    name: "Premier article",
    description: "Ecris ton premier article",
  },
  "first-mood": {
    name: "Premiere humeur",
    description: "Enregistre ton humeur pour la premiere fois",
  },
  "first-photo": {
    name: "Premiere photo",
    description: "Publie ta premiere photo",
  },
  "first-moodboard": {
    name: "Premier moodboard",
    description: "Cree ton premier moodboard",
  },
  "first-friend": {
    name: "Premier ami",
    description: "Ajoute ton premier ami",
  },
  "journal-streak-7": {
    name: "Serie de 7 jours",
    description: "Ecris dans ton journal 7 jours de suite",
  },
  "journal-streak-14": {
    name: "Serie de 14 jours",
    description: "Ecris dans ton journal 14 jours de suite",
  },
  "posts-10": { name: "Conteur", description: "Ecris 10 articles" },
  "photos-10": { name: "Photographe", description: "Publie 10 photos" },
  "journal-streak-30": {
    name: "Serie de 30 jours",
    description: "Ecris dans ton journal 30 jours de suite",
  },
  "posts-50": {
    name: "Ecrivain prolifique",
    description: "Ecris 50 articles",
  },
  "photos-50": { name: "Pro de la photo", description: "Publie 50 photos" },
  "friends-5": { name: "Sociable", description: "Ajoute 5 amis" },
  "friends-10": { name: "Populaire", description: "Ajoute 10 amis" },
  "all-moods-recorded": {
    name: "Arc-en-ciel",
    description: "Enregistre chaque categorie d'humeur au moins une fois",
  },
  "kanban-master": {
    name: "Maitre kanban",
    description: "Complete 10 cartes sur tes tableaux",
  },
};

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "A l'instant";
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `${diffDays} jours`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function getSenderInfo(notification: Notification): {
  name: string;
  initial: string;
} {
  const data = notification.data;
  const name =
    (data.senderName as string) ||
    (data.acceptorName as string) ||
    (data.friendName as string) ||
    "";
  return {
    name,
    initial: name.charAt(0).toUpperCase() || "?",
  };
}

function getRewardInfo(notification: Notification): {
  name: string;
  description: string;
} {
  const key = notification.data.achievementKey as string | undefined;
  if (key && ACHIEVEMENT_FR[key]) {
    return ACHIEVEMENT_FR[key];
  }
  const title = notification.title;
  const match = title.match(/^New (?:sticker|badge|letter):\s*(.+?)!*$/i);
  if (match?.[1]) return { name: match[1], description: notification.body };
  const frMatch = title.match(/^Nouvelle recompense\s*:\s*(.+)$/i);
  if (frMatch?.[1]) return { name: frMatch[1], description: notification.body };
  return { name: title, description: notification.body };
}

function getNotificationDetails(notification: Notification): {
  title: string;
  description: string;
  isReward: boolean;
} {
  const sender = getSenderInfo(notification);

  switch (notification.type) {
    case "friend_request":
      return {
        title: "Demande d'ami",
        description: sender.name
          ? `${sender.name} souhaite devenir votre ami`
          : notification.body,
        isReward: false,
      };
    case "friend_accepted":
      return {
        title: "Ami accepte",
        description: sender.name
          ? `${sender.name} et vous etes maintenant amis`
          : notification.body,
        isReward: false,
      };
    case "new_message":
      return {
        title: "Nouveau message",
        description: sender.name
          ? `${sender.name} vous a envoye un message`
          : notification.body,
        isReward: false,
      };
    case "post_reaction":
      return {
        title: "Nouvelle reaction",
        description: notification.body,
        isReward: false,
      };
    case "post_comment":
      return {
        title: "Nouveau commentaire",
        description: notification.body,
        isReward: false,
      };
    case "reward_earned": {
      const reward = getRewardInfo(notification);
      return {
        title: `Nouveau badge : ${reward.name}`,
        description: reward.description,
        isReward: true,
      };
    }
    default:
      return {
        title: notification.title,
        description: notification.body,
        isReward: false,
      };
  }
}

export function NotificationItem({
  notification,
  senderImage,
  onPress,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
  responded,
}: NotificationItemProps) {
  const router = useRouter();
  const isUnread = notification.readAt === null;
  const sender = getSenderInfo(notification);
  const details = getNotificationDetails(notification);

  function handlePress() {
    onPress();
    const postId = notification.data.postId as string | undefined;
    if (
      postId &&
      (notification.type === "post_reaction" ||
        notification.type === "post_comment")
    ) {
      router.push(`/(protected)/(tabs)/journal/post/${postId}`);
    }
    if (notification.type === "new_message") {
      const conversationId = notification.data.conversationId as
        | string
        | undefined;
      if (conversationId) {
        router.push(`/(protected)/(tabs)/messages/${conversationId}`);
      }
    }
  }

  const avatarBg = details.isReward
    ? "#F59E0B"
    : (AVATAR_COLORS[notification.type] ?? "#6B7280");

  return (
    <Pressable
      onPress={handlePress}
      className={cn(
        "px-4 py-3 active:bg-muted/50",
        isUnread && "bg-homecafe-pink/5",
      )}
    >
      <View className="flex-row items-start">
        {details.isReward ? (
          <View
            className="mr-3 h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: avatarBg }}
          >
            <Award size={20} color="#FFFFFF" />
          </View>
        ) : senderImage ? (
          <Image
            source={{ uri: senderImage }}
            className="mr-3 h-10 w-10 rounded-full"
          />
        ) : (
          <View
            className="mr-3 h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: avatarBg }}
          >
            <Text className="text-sm font-bold text-white">
              {sender.initial}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-1.5">
              {isUnread && (
                <View className="h-2 w-2 rounded-full bg-homecafe-pink" />
              )}
              <Text
                className={cn(
                  "text-sm",
                  isUnread
                    ? "font-bold text-foreground"
                    : "font-medium text-muted-foreground",
                )}
                numberOfLines={1}
              >
                {details.title}
              </Text>
            </View>
            <Text className="ml-2 text-xs text-muted-foreground">
              {formatTimestamp(notification.createdAt)}
            </Text>
          </View>

          <Text
            className={cn(
              "mt-0.5 text-sm",
              isUnread
                ? "font-medium text-foreground/80"
                : "text-muted-foreground",
            )}
            numberOfLines={2}
          >
            {details.description}
          </Text>

          {notification.type === "friend_request" &&
            !responded &&
            onAccept &&
            onReject && (
              <View className="mt-3 flex-row gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onPress={onAccept}
                  loading={isAccepting}
                  disabled={isRejecting}
                  className="flex-1 bg-green-600"
                >
                  <View className="flex-row items-center gap-1">
                    <Check size={16} color="#FFFFFF" />
                    <Text className="font-medium text-white">Accepter</Text>
                  </View>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={onReject}
                  loading={isRejecting}
                  disabled={isAccepting}
                  className="flex-1"
                >
                  <View className="flex-row items-center gap-1">
                    <X size={16} color="#3D2E2E" />
                    <Text className="font-medium text-foreground">Refuser</Text>
                  </View>
                </Button>
              </View>
            )}

          {notification.type === "friend_request" && responded && (
            <Text className="mt-2 text-xs font-medium text-muted-foreground">
              Demande traitee
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
