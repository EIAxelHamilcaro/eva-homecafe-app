import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
}

export interface SignInInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface SessionResponse {
  user: User;
  session: {
    id: string;
    token: string;
    expiresAt: string;
  };
}

export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const data = await api.get<SessionResponse>("/api/v1/auth/session");
      return {
        user: data.user,
        token: data.session.token,
      } as AuthSession;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignUpInput) =>
      api.post<AuthSession>("/api/v1/auth/sign-up", input),
    onSuccess: async (data) => {
      await api.setToken(data.token);
      queryClient.setQueryData(authKeys.session(), data);
    },
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignInInput) =>
      api.post<AuthSession>("/api/v1/auth/sign-in", input),
    onSuccess: async (data) => {
      await api.setToken(data.token);
      queryClient.setQueryData(authKeys.session(), data);
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<void>("/api/v1/auth/sign-out"),
    onSuccess: async () => {
      await api.clearToken();
      queryClient.setQueryData(authKeys.session(), null);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}
