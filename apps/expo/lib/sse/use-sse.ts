import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

import type {
  SSEEvent,
  SSEMessageSentEvent,
  SSENotificationEvent,
  SSEReactionAddedEvent,
  SSEReactionRemovedEvent,
} from "@/constants/chat";
import {
  conversationKeys,
  messageKeys,
  notificationKeys,
} from "@/lib/api/hooks/query-keys";
import { useAuth } from "@/src/providers/auth-provider";

import { getSSEClient } from "./sse-client";

interface UseSSEOptions {
  conversationId?: string;
  enabled?: boolean;
}

export function useSSE({ conversationId, enabled = true }: UseSSEOptions = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isConnectedRef = useRef(false);

  const handleMessageSent = useCallback(
    (event: SSEMessageSentEvent) => {
      const { data } = event;

      if (conversationId && data.conversationId !== conversationId) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey: messageKeys.list(data.conversationId),
      });

      queryClient.invalidateQueries({
        queryKey: conversationKeys.all,
      });
    },
    [queryClient, conversationId],
  );

  const handleReactionAdded = useCallback(
    (event: SSEReactionAddedEvent) => {
      const { data } = event;

      if (conversationId && data.conversationId !== conversationId) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey: messageKeys.list(data.conversationId),
      });
    },
    [queryClient, conversationId],
  );

  const handleReactionRemoved = useCallback(
    (event: SSEReactionRemovedEvent) => {
      const { data } = event;

      if (conversationId && data.conversationId !== conversationId) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey: messageKeys.list(data.conversationId),
      });
    },
    [queryClient, conversationId],
  );

  const handleConversationRead = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: conversationKeys.all,
    });
  }, [queryClient]);

  const handleConversationCreated = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: conversationKeys.all,
    });
  }, [queryClient]);

  const handleNotification = useCallback(
    (event: SSENotificationEvent) => {
      const { data } = event;

      if (data.userId !== user?.id) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
    [queryClient, user?.id],
  );

  const handleEvent = useCallback(
    (event: SSEEvent) => {
      switch (event.type) {
        case "message_sent":
          handleMessageSent(event);
          break;
        case "reaction_added":
          handleReactionAdded(event);
          break;
        case "reaction_removed":
          handleReactionRemoved(event);
          break;
        case "conversation_read":
          handleConversationRead();
          break;
        case "conversation_created":
          handleConversationCreated();
          break;
        case "notification":
          handleNotification(event);
          break;
      }
    },
    [
      handleMessageSent,
      handleReactionAdded,
      handleReactionRemoved,
      handleConversationRead,
      handleConversationCreated,
      handleNotification,
    ],
  );

  useEffect(() => {
    if (!enabled || !user) {
      return;
    }

    const client = getSSEClient();

    client.subscribe();
    client.updateConfig({
      onEvent: handleEvent,
      onConnected: () => {
        isConnectedRef.current = true;
      },
      onDisconnected: () => {
        isConnectedRef.current = false;
      },
    });

    client.connect();

    return () => {
      client.unsubscribe();
      isConnectedRef.current = false;
    };
  }, [enabled, user, handleEvent]);

  return {
    isConnected: isConnectedRef.current,
  };
}
