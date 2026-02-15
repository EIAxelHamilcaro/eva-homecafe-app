"use client";

import { Badge } from "@packages/ui/components/ui/badge";
import { Button } from "@packages/ui/components/ui/button";
import { Separator } from "@packages/ui/components/ui/separator";
import { Bell, CheckCheck } from "lucide-react";
import { useMemo } from "react";
import { useProfilesQuery } from "@/app/(protected)/_hooks/use-chat";
import {
  useMarkNotificationReadMutation,
  useNotificationsQuery,
  useUnreadCountQuery,
} from "@/app/(protected)/_hooks/use-notifications";
import { NotificationItem } from "./notification-item";

export function NotificationsList() {
  const { data, isLoading, error } = useNotificationsQuery();
  const { data: unreadData } = useUnreadCountQuery();
  const markAsRead = useMarkNotificationReadMutation();

  const unreadCount = unreadData?.unreadCount ?? data?.unreadCount ?? 0;

  const senderIds = useMemo(() => {
    if (!data?.notifications) return [];
    const ids = new Set<string>();
    for (const n of data.notifications) {
      const senderId = (n.data.senderId ?? n.data.acceptorId) as
        | string
        | undefined;
      if (senderId) ids.add(senderId);
    }
    return [...ids];
  }, [data?.notifications]);

  const { data: profilesData } = useProfilesQuery(senderIds);

  const senderProfiles = useMemo(() => {
    const map = new Map<string, { name: string; image: string | null }>();
    if (profilesData?.profiles) {
      for (const p of profilesData.profiles) {
        map.set(p.id, { name: p.name, image: p.image });
      }
    }
    return map;
  }, [profilesData?.profiles]);

  const { unread, read } = useMemo(() => {
    if (!data?.notifications) return { unread: [], read: [] };
    return {
      unread: data.notifications.filter((n) => n.readAt === null),
      read: data.notifications.filter((n) => n.readAt !== null),
    };
  }, [data?.notifications]);

  function handleMarkAllAsRead() {
    for (const notification of unread) {
      markAsRead.mutate({ id: notification.id });
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
          {error.message}
        </div>
      </div>
    );
  }

  if (!data || data.notifications.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex flex-col items-center justify-center rounded-xl border border-border py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">
            Aucune notification
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vous n'avez aucune notification pour le moment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-homecafe-pink text-white hover:bg-homecafe-pink/90">
              {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleMarkAllAsRead}
            disabled={markAsRead.isPending}
          >
            <CheckCheck className="mr-1.5 h-4 w-4" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {unread.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Non lues
          </p>
          <div className="space-y-2">
            {unread.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                senderImage={
                  senderProfiles.get(
                    (notification.data.senderId ??
                      notification.data.acceptorId) as string,
                  )?.image ?? null
                }
              />
            ))}
          </div>
        </div>
      )}

      {unread.length > 0 && read.length > 0 && <Separator />}

      {read.length > 0 && (
        <div className="space-y-2">
          {unread.length > 0 && (
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lues
            </p>
          )}
          <div className="space-y-2">
            {read.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                senderImage={
                  senderProfiles.get(
                    (notification.data.senderId ??
                      notification.data.acceptorId) as string,
                  )?.image ?? null
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
