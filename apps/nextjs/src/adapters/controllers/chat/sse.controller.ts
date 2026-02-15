import { match } from "@packages/ddd-kit";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import { getInjection } from "@/common/di/container";

export interface SSEMessage {
  type:
    | "connected"
    | "message_sent"
    | "reaction_added"
    | "reaction_removed"
    | "conversation_read"
    | "conversation_created"
    | "conversation_deleted"
    | "notification"
    | "ping";
  data: unknown;
  timestamp: string;
}

type ConnectionCallback = (message: SSEMessage) => void;

class SSEConnectionManager {
  private connections: Map<string, Set<ConnectionCallback>> = new Map();

  addConnection(userId: string, callback: ConnectionCallback): void {
    const userConnections = this.connections.get(userId) ?? new Set();
    userConnections.add(callback);
    this.connections.set(userId, userConnections);
  }

  removeConnection(userId: string, callback: ConnectionCallback): void {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(callback);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
    }
  }

  sendToUser(userId: string, message: SSEMessage): void {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      for (const callback of userConnections) {
        callback(message);
      }
    }
  }

  sendToUsers(userIds: string[], message: SSEMessage): void {
    for (const userId of userIds) {
      this.sendToUser(userId, message);
    }
  }

  getConnectionCount(userId: string): number {
    return this.connections.get(userId)?.size ?? 0;
  }

  getAllConnectedUserIds(): string[] {
    return Array.from(this.connections.keys());
  }
}

const globalForSSE = globalThis as unknown as {
  sseConnectionManager: SSEConnectionManager | undefined;
};

export const sseConnectionManager =
  globalForSSE.sseConnectionManager ?? new SSEConnectionManager();
globalForSSE.sseConnectionManager = sseConnectionManager;

async function getAuthenticatedUser(
  request: Request,
): Promise<IGetSessionOutputDto | null> {
  const useCase = getInjection("GetSessionUseCase");
  const result = await useCase.execute(request.headers);

  if (result.isFailure) {
    return null;
  }

  return match<IGetSessionOutputDto, IGetSessionOutputDto | null>(
    result.getValue(),
    {
      Some: (session) => session,
      None: () => null,
    },
  );
}

function formatSSEMessage(message: SSEMessage): string {
  return `data: ${JSON.stringify(message)}\n\n`;
}

export async function sseController(request: Request): Promise<Response> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendMessage: ConnectionCallback = (message: SSEMessage) => {
        try {
          controller.enqueue(encoder.encode(formatSSEMessage(message)));
        } catch {
          sseConnectionManager.removeConnection(userId, sendMessage);
        }
      };

      sseConnectionManager.addConnection(userId, sendMessage);

      sendMessage({
        type: "connected",
        data: {
          userId,
          connectionCount: sseConnectionManager.getConnectionCount(userId),
        },
        timestamp: new Date().toISOString(),
      });

      const pingInterval = setInterval(() => {
        sendMessage({
          type: "ping",
          data: null,
          timestamp: new Date().toISOString(),
        });
      }, 30000);

      request.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        sseConnectionManager.removeConnection(userId, sendMessage);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export function broadcastMessageSent(
  participantIds: string[],
  data: {
    messageId: string;
    conversationId: string;
    senderId: string;
    content: string | null;
    hasAttachments: boolean;
  },
): void {
  sseConnectionManager.sendToUsers(participantIds, {
    type: "message_sent",
    data,
    timestamp: new Date().toISOString(),
  });
}

export function broadcastReactionAdded(
  participantIds: string[],
  data: {
    messageId: string;
    conversationId: string;
    userId: string;
    emoji: string;
  },
): void {
  sseConnectionManager.sendToUsers(participantIds, {
    type: "reaction_added",
    data,
    timestamp: new Date().toISOString(),
  });
}

export function broadcastReactionRemoved(
  participantIds: string[],
  data: {
    messageId: string;
    conversationId: string;
    userId: string;
    emoji: string;
  },
): void {
  sseConnectionManager.sendToUsers(participantIds, {
    type: "reaction_removed",
    data,
    timestamp: new Date().toISOString(),
  });
}

export function broadcastConversationRead(
  participantIds: string[],
  data: {
    conversationId: string;
    userId: string;
    readAt: string;
  },
): void {
  sseConnectionManager.sendToUsers(participantIds, {
    type: "conversation_read",
    data,
    timestamp: new Date().toISOString(),
  });
}

export function broadcastConversationCreated(
  participantIds: string[],
  data: {
    conversationId: string;
    createdBy: string;
    participantIds: string[];
  },
): void {
  sseConnectionManager.sendToUsers(participantIds, {
    type: "conversation_created",
    data,
    timestamp: new Date().toISOString(),
  });
}

export function broadcastConversationDeleted(
  participantIds: string[],
  data: {
    conversationId: string;
    deletedBy: string;
  },
): void {
  sseConnectionManager.sendToUsers(participantIds, {
    type: "conversation_deleted",
    data,
    timestamp: new Date().toISOString(),
  });
}

export function broadcastNotification(
  userId: string,
  data: {
    notificationId: string;
    userId: string;
    notificationType: string;
    title: string;
    body: string;
  },
): void {
  sseConnectionManager.sendToUser(userId, {
    type: "notification",
    data,
    timestamp: new Date().toISOString(),
  });
}
