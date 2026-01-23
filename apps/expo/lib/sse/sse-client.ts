import * as SecureStore from "expo-secure-store";
import EventSource from "react-native-sse";

import type { SSEEvent } from "@/constants/chat";
import { env } from "@/src/config/env";

const TOKEN_KEY = "auth_token";

type SSEEventHandler = (event: SSEEvent) => void;

interface SSEClientConfig {
  onEvent?: SSEEventHandler;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

export class SSEClient {
  private eventSource: EventSource | null = null;
  private config: SSEClientConfig;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = true;

  constructor(config: SSEClientConfig = {}) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.eventSource || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.shouldReconnect = true;

    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        this.isConnecting = false;
        this.config.onError?.(new Error("No authentication token available"));
        return;
      }

      const url = `${env.apiUrl}/api/v1/chat/sse`;

      this.eventSource = new EventSource(url, {
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
    });

    this.eventSource.addEventListener("message", (event) => {
      if (event.data) {
        try {
          const message = JSON.parse(event.data) as SSEEvent;
          this.handleMessage(message);
        } catch {
          // Ignore malformed JSON
        }
      }
    });

    this.eventSource.addEventListener("error", (event) => {
      this.isConnecting = false;
      const message =
        "message" in event ? String(event.message) : "SSE connection error";
      this.config.onError?.(new Error(message));
      this.handleDisconnect();
    });
  }

  private handleMessage(message: SSEEvent): void {
    if (message.type === "connected") {
      this.reconnectAttempts = 0;
      this.config.onConnected?.();
    }

    if (message.type !== "ping") {
      this.config.onEvent?.(message);
    }
  }

  private handleDisconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnecting = false;
    this.config.onDisconnected?.();

    if (this.shouldReconnect) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this.config.onError?.(new Error("Max reconnection attempts reached"));
      return;
    }

    this.clearReconnectTimeout();
    this.reconnectAttempts++;
    const delay = RECONNECT_DELAY_MS * this.reconnectAttempts;

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnectTimeout();

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.isConnecting = false;
  }

  isConnected(): boolean {
    return this.eventSource !== null && !this.isConnecting;
  }

  updateConfig(config: Partial<SSEClientConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

let sseClientInstance: SSEClient | null = null;

export function getSSEClient(): SSEClient {
  if (!sseClientInstance) {
    sseClientInstance = new SSEClient();
  }
  return sseClientInstance;
}

export function resetSSEClient(): void {
  if (sseClientInstance) {
    sseClientInstance.disconnect();
    sseClientInstance = null;
  }
}
