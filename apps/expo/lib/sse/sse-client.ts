import EventSource, {
  type CustomEvent,
  type ErrorEvent,
  type ExceptionEvent,
  type TimeoutEvent,
} from "react-native-sse";
import type { SSEEvent, SSEEventType } from "@/constants/chat";

type SSEEventHandler = (event: SSEEvent) => void;

type CustomSSEEventType =
  | "connected"
  | "message:new"
  | "message:updated"
  | "message:deleted"
  | "reaction:added"
  | "reaction:removed"
  | "conversation:read"
  | "conversation:created";

interface SSEClientConfig {
  baseUrl: string;
  getToken: () => Promise<string | null>;
  onEvent?: SSEEventHandler;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export class SSEClient {
  private eventSource: EventSource<CustomSSEEventType> | null = null;
  private config: SSEClientConfig;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(config: SSEClientConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.eventSource || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = await this.config.getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const url = `${this.config.baseUrl}/api/v1/chat/sse`;

      this.eventSource = new EventSource<CustomSSEEventType>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      this.setupEventListeners();
    } catch (error) {
      this.isConnecting = false;
      this.config.onError?.(
        error instanceof Error ? error : new Error(String(error)),
      );
      this.scheduleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.eventSource) return;

    this.eventSource.addEventListener("open", () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.config.onConnected?.();
    });

    this.eventSource.addEventListener(
      "error",
      (event: ErrorEvent | TimeoutEvent | ExceptionEvent) => {
        this.isConnecting = false;
        const message =
          "message" in event ? event.message : "SSE connection error";
        this.config.onError?.(new Error(message));
        this.disconnect();
        this.scheduleReconnect();
      },
    );

    this.eventSource.addEventListener(
      "connected",
      (_event: CustomEvent<"connected">) => {
        this.reconnectAttempts = 0;
      },
    );

    const eventTypes: SSEEventType[] = [
      "message:new",
      "message:updated",
      "message:deleted",
      "reaction:added",
      "reaction:removed",
      "conversation:read",
      "conversation:created",
    ];

    for (const eventType of eventTypes) {
      this.eventSource.addEventListener(
        eventType,
        (event: CustomEvent<typeof eventType>) => {
          if (event.data) {
            try {
              const data = JSON.parse(event.data) as SSEEvent["data"];
              const sseEvent = { type: eventType, data } as SSEEvent;
              this.config.onEvent?.(sseEvent);
            } catch {
              // Ignore malformed JSON
            }
          }
        },
      );
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this.config.onError?.(new Error("Max reconnection attempts reached"));
      this.config.onDisconnected?.();
      return;
    }

    this.reconnectAttempts++;
    const delay = RECONNECT_DELAY_MS * this.reconnectAttempts;

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.isConnecting = false;
    this.config.onDisconnected?.();
  }

  isConnected(): boolean {
    return this.eventSource !== null && !this.isConnecting;
  }
}

let sseClientInstance: SSEClient | null = null;

export function createSSEClient(config: SSEClientConfig): SSEClient {
  if (sseClientInstance) {
    sseClientInstance.disconnect();
  }
  sseClientInstance = new SSEClient(config);
  return sseClientInstance;
}

export function getSSEClient(): SSEClient | null {
  return sseClientInstance;
}
