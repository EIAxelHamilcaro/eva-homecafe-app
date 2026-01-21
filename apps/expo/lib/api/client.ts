import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000";

const TOKEN_KEY = "auth_token";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private tokenCache: string | null = null;

  async getToken(): Promise<string | null> {
    if (this.tokenCache) return this.tokenCache;
    this.tokenCache = await SecureStore.getItemAsync(TOKEN_KEY);
    return this.tokenCache;
  }

  async setToken(token: string | null): Promise<void> {
    this.tokenCache = token;
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  }

  async clearToken(): Promise<void> {
    this.tokenCache = null;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }

  async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...(options?.headers as Record<string, string>),
      },
    });

    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
    } & T;

    if (!response.ok) {
      throw new ApiError(
        data.error ?? "Une erreur est survenue",
        data.code ?? "UNKNOWN_ERROR",
        response.status,
      );
    }

    return data;
  }

  get<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: "DELETE" });
  }

  async uploadFile<T>(
    endpoint: string,
    formData: FormData,
    onProgress?: (progress: number) => void,
  ): Promise<T> {
    const token = await this.getToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText) as T;
            resolve(data);
          } catch {
            reject(
              new ApiError("Invalid JSON response", "PARSE_ERROR", xhr.status),
            );
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText) as {
              error?: string;
              code?: string;
            };
            reject(
              new ApiError(
                data.error ?? "An error occurred",
                data.code ?? "UNKNOWN_ERROR",
                xhr.status,
              ),
            );
          } catch {
            reject(new ApiError("Upload failed", "UPLOAD_ERROR", xhr.status));
          }
        }
      });

      xhr.addEventListener("error", () => {
        reject(new ApiError("Network error", "NETWORK_ERROR", 0));
      });

      xhr.open("POST", `${API_URL}${endpoint}`);

      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value);
      }

      xhr.send(formData);
    });
  }
}

export const api = new ApiClient();
