"use client";

import { Badge } from "@packages/ui/components/ui/badge";
import { Bell } from "lucide-react";
import {
  useNotificationsQuery,
  useUnreadCountQuery,
} from "@/app/(protected)/_hooks/use-notifications";
import { NotificationItem } from "./notification-item";

export function NotificationsList() {
  const { data, isLoading, error } = useNotificationsQuery();
  const { data: unreadData } = useUnreadCountQuery();

  const unreadCount = unreadData?.count ?? data?.unreadCount ?? 0;

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
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Badge className="bg-homecafe-pink text-white hover:bg-homecafe-pink/90">
            {unreadCount}
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {data.notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}
