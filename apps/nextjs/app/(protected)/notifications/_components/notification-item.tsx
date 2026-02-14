"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Award, Check, X } from "lucide-react";
import { useState } from "react";
import { useRespondRequestMutation } from "@/app/(protected)/_hooks/use-friends";
import { useMarkNotificationReadMutation } from "@/app/(protected)/_hooks/use-notifications";
import type { INotificationDto } from "@/application/dto/notification/notification.dto";

function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays === 1) return "hier";
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function getSenderInfo(notification: INotificationDto): {
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

const ACHIEVEMENT_FR: Record<string, { name: string; description: string }> = {
  "first-post": {
    name: "Premier article",
    description: "Écris ton premier article",
  },
  "first-mood": {
    name: "Première humeur",
    description: "Enregistre ton humeur pour la première fois",
  },
  "first-photo": {
    name: "Première photo",
    description: "Publie ta première photo",
  },
  "first-moodboard": {
    name: "Premier moodboard",
    description: "Crée ton premier moodboard",
  },
  "first-friend": {
    name: "Premier ami",
    description: "Ajoute ton premier ami",
  },
  "journal-streak-7": {
    name: "Série de 7 jours",
    description: "Écris dans ton journal 7 jours de suite",
  },
  "journal-streak-14": {
    name: "Série de 14 jours",
    description: "Écris dans ton journal 14 jours de suite",
  },
  "posts-10": { name: "Conteur", description: "Écris 10 articles" },
  "photos-10": { name: "Photographe", description: "Publie 10 photos" },
  "journal-streak-30": {
    name: "Série de 30 jours",
    description: "Écris dans ton journal 30 jours de suite",
  },
  "posts-50": {
    name: "Écrivain prolifique",
    description: "Écris 50 articles",
  },
  "photos-50": { name: "Pro de la photo", description: "Publie 50 photos" },
  "friends-5": { name: "Sociable", description: "Ajoute 5 amis" },
  "friends-10": { name: "Populaire", description: "Ajoute 10 amis" },
  "all-moods-recorded": {
    name: "Arc-en-ciel",
    description: "Enregistre chaque catégorie d'humeur au moins une fois",
  },
  "kanban-master": {
    name: "Maître kanban",
    description: "Complète 10 cartes sur tes tableaux",
  },
};

function getRewardInfo(notification: INotificationDto): {
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
  const frMatch = title.match(/^Nouvelle récompense\s*:\s*(.+)$/i);
  if (frMatch?.[1]) return { name: frMatch[1], description: notification.body };
  return { name: title, description: notification.body };
}

function getNotificationDetails(notification: INotificationDto): {
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
        title: "Ami accepté",
        description: sender.name
          ? `${sender.name} et vous êtes maintenant amis`
          : notification.body,
        isReward: false,
      };
    case "new_message":
      return {
        title: "Nouveau message",
        description: sender.name
          ? `${sender.name} vous a envoyé un message`
          : notification.body,
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

interface NotificationItemProps {
  notification: INotificationDto;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const markAsRead = useMarkNotificationReadMutation();
  const respondRequest = useRespondRequestMutation();
  const [responded, setResponded] = useState(false);

  const isUnread = notification.readAt === null;
  const sender = getSenderInfo(notification);
  const details = getNotificationDetails(notification);

  function handleClick() {
    if (isUnread) {
      markAsRead.mutate({ id: notification.id });
    }
  }

  function handleAccept() {
    const requestId = notification.data.requestId as string;
    respondRequest.mutate(
      { requestId, accept: true },
      {
        onSuccess: () => {
          setResponded(true);
          if (isUnread) {
            markAsRead.mutate({ id: notification.id });
          }
        },
      },
    );
  }

  function handleRefuse() {
    const requestId = notification.data.requestId as string;
    respondRequest.mutate(
      { requestId, accept: false },
      {
        onSuccess: () => {
          setResponded(true);
          if (isUnread) {
            markAsRead.mutate({ id: notification.id });
          }
        },
      },
    );
  }

  const letterBadge = details.isReward ? (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
      <Award className="h-5 w-5" />
    </div>
  ) : (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
        notification.type === "friend_request"
          ? "bg-indigo-500"
          : notification.type === "friend_accepted"
            ? "bg-green-500"
            : notification.type === "new_message"
              ? "bg-purple-500"
              : "bg-gray-500"
      }`}
    >
      {sender.initial}
    </div>
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-start gap-3 rounded-xl p-4 text-left transition-all ${
        isUnread
          ? "bg-homecafe-pink/5 shadow-sm ring-1 ring-homecafe-pink/20 hover:bg-homecafe-pink/10"
          : "bg-white hover:bg-muted/50"
      }`}
    >
      {letterBadge}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {isUnread && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-homecafe-pink" />
            )}
            <p
              className={`text-sm ${isUnread ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}
            >
              {details.title}
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>

        <p
          className={`mt-0.5 text-sm ${isUnread ? "font-medium text-foreground/80" : "text-muted-foreground"}`}
        >
          {details.description}
        </p>

        {notification.type === "friend_request" && !responded && (
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={(e) => {
                e.stopPropagation();
                handleAccept();
              }}
              disabled={respondRequest.isPending}
            >
              <Check className="mr-1 h-4 w-4" />
              Accepter
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleRefuse();
              }}
              disabled={respondRequest.isPending}
            >
              <X className="mr-1 h-4 w-4" />
              Refuser
            </Button>
          </div>
        )}

        {notification.type === "friend_request" && responded && (
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            Demande traitée
          </p>
        )}
      </div>
    </button>
  );
}
