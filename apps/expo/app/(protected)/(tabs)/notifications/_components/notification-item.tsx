import { Bell, Check, UserPlus, X } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { cn } from "@/src/libs/utils";
import type { Notification, NotificationType } from "@/types/notification";

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

const NOTIFICATION_ICONS: Record<NotificationType, typeof Bell> = {
  friend_request: UserPlus,
  friend_accepted: Check,
  new_message: Bell,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  friend_request: "#F691C3",
  friend_accepted: "#4CAF50",
  new_message: "#2196F3",
};

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `${diffDays} jours`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function NotificationItem({
  notification,
  onPress,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
}: NotificationItemProps) {
  const Icon = NOTIFICATION_ICONS[notification.type] ?? Bell;
  const iconColor = NOTIFICATION_COLORS[notification.type] ?? "#F691C3";
  const isUnread = notification.readAt === null;
  const isFriendRequest = notification.type === "friend_request";

  return (
    <Pressable
      onPress={onPress}
      className={cn("px-4 py-3 active:bg-muted", isUnread && "bg-muted/30")}
    >
      <View className="flex-row items-start">
        <View
          className="mr-3 h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Icon size={20} color={iconColor} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text
              className={cn(
                "flex-1 text-base text-foreground",
                isUnread && "font-semibold",
              )}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            <View className="flex-row items-center gap-2">
              {isUnread && (
                <View className="h-2 w-2 rounded-full bg-homecafe-pink" />
              )}
              <Text className="text-sm text-muted-foreground">
                {formatTimestamp(notification.createdAt)}
              </Text>
            </View>
          </View>

          <Text
            className={cn(
              "mt-0.5 text-sm text-muted-foreground",
              isUnread && "text-foreground/80",
            )}
            numberOfLines={2}
          >
            {notification.body}
          </Text>

          {isFriendRequest && onAccept && onReject && (
            <View className="mt-3 flex-row gap-2">
              <Button
                variant="default"
                size="sm"
                onPress={onAccept}
                loading={isAccepting}
                disabled={isRejecting}
                className="flex-1"
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
        </View>
      </View>
    </Pressable>
  );
}
