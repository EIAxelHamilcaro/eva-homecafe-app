"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { conversationKeys, messageKeys } from "./query-keys";
import { notificationKeys } from "./use-notifications";

interface SSENotificationData {
  notificationId: string;
  userId: string;
  notificationType: string;
  title: string;
  body: string;
}

interface SSEChatData {
  messageId?: string;
  conversationId?: string;
  senderId?: string;
  userId?: string;
}

interface SSEMessage {
  type: string;
  data: SSENotificationData & SSEChatData;
}

function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function showBrowserNotification(notif: SSENotificationData) {
  if ("Notification" in window && Notification.permission === "granted") {
    new window.Notification(notif.title, {
      body: notif.body,
      icon: "/landing/logo.svg",
      tag: notif.notificationId,
    });
  }
}

export function useBrowserNotifications() {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const sseConnectedRef = useRef(false);

  const invalidateNotifications = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  }, [queryClient]);

  const handleChatEvent = useCallback(
    (message: SSEMessage) => {
      const { conversationId } = message.data;

      switch (message.type) {
        case "message_sent":
          if (conversationId) {
            queryClient.invalidateQueries({
              queryKey: messageKeys.list(conversationId),
            });
          }
          queryClient.invalidateQueries({ queryKey: conversationKeys.all });
          break;

        case "reaction_added":
        case "reaction_removed":
          if (conversationId) {
            queryClient.invalidateQueries({
              queryKey: messageKeys.list(conversationId),
            });
          }
          break;

        case "conversation_created":
          queryClient.invalidateQueries({ queryKey: conversationKeys.all });
          break;

        case "conversation_read":
          queryClient.invalidateQueries({ queryKey: conversationKeys.all });
          break;
      }
    },
    [queryClient],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    requestNotificationPermission();

    function connect() {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource("/api/v1/chat/sse");
      eventSourceRef.current = es;

      es.onopen = () => {
        sseConnectedRef.current = true;
      };

      es.onmessage = (event) => {
        try {
          const message: SSEMessage = JSON.parse(event.data);

          if (message.type === "notification") {
            invalidateNotifications();
            showBrowserNotification(message.data);
          } else {
            handleChatEvent(message);
          }
        } catch {
          // ignore parse errors
        }
      };

      es.onerror = () => {
        sseConnectedRef.current = false;
        es.close();
        eventSourceRef.current = null;
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };
    }

    connect();

    const fallbackInterval = setInterval(() => {
      if (!sseConnectedRef.current) {
        invalidateNotifications();
      }
    }, 60_000);

    return () => {
      clearInterval(fallbackInterval);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [invalidateNotifications, handleChatEvent]);
}
