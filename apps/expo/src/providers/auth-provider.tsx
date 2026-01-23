import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api/client";
import { authKeys } from "@/lib/api/hooks/query-keys";
import type { AuthSession, User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const refreshSession = useCallback(async () => {
    try {
      const token = await api.getToken();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await api.get<{
        user: User;
        session: { id: string; token: string; expiresAt: string };
      }>("/api/v1/auth/session");

      const session: AuthSession = {
        user: response.user,
        token: response.session.token,
      };
      setUser(session.user);
      queryClient.setQueryData(authKeys.session(), session);
    } catch {
      await api.clearToken();
      setUser(null);
      queryClient.setQueryData(authKeys.session(), null);
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    const sessionKey = authKeys.session();
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      const queryKey = event.query.queryKey;
      if (
        queryKey.length === sessionKey.length &&
        queryKey.every((val: unknown, idx: number) => val === sessionKey[idx])
      ) {
        const data = event.query.state.data as AuthSession | null | undefined;
        setUser(data?.user ?? null);
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
