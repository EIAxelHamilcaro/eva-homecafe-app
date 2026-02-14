"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Check, MessageCircle, UserPlus, Users, X } from "lucide-react";
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

  if (diffMin < 1) return "a l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays === 1) return "hier";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function getNotificationIcon(type: INotificationDto["type"]) {
  switch (type) {
    case "friend_request":
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100">
          <UserPlus className="h-5 w-5 text-indigo-600" />
        </div>
      );
    case "friend_accepted":
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
          <Users className="h-5 w-5 text-green-600" />
        </div>
      );
    case "new_message":
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
          <MessageCircle className="h-5 w-5 text-purple-600" />
        </div>
      );
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

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-start gap-3 rounded-lg border bg-white p-4 text-left transition-colors hover:bg-muted/50 ${
        isUnread
          ? "border-l-4 border-homecafe-pink border-t-border border-r-border border-b-border"
          : "border-border"
      }`}
    >
      {getNotificationIcon(notification.type)}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">
            {notification.title}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>

        <p className="mt-0.5 text-sm text-muted-foreground">
          {notification.body}
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
            Demande traitee
          </p>
        )}
      </div>
    </button>
  );
}
