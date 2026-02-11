import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { unregisterPushNotifications } from "@/lib/notifications/push-notifications";
import type { AuthSession, User } from "@/types/auth";

import { api } from "../client";
import { authKeys } from "./query-keys";

export type { AuthSession, User };

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

export { authKeys };

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
    mutationFn: async () => {
      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        await unregisterPushNotifications(tokenData.data);
      } catch {}

      return api.post<void>("/api/v1/auth/sign-out");
    },
    onSuccess: async () => {
      await api.clearToken();
      queryClient.setQueryData(authKeys.session(), null);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export interface ForgotPasswordInput {
  email: string;
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) =>
      api.post<{ message: string }>("/api/v1/auth/forgot-password", input),
  });
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      api.post<{ message: string }>("/api/v1/auth/reset-password", input),
  });
}
