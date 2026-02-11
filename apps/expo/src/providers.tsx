import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { NetworkProvider } from "@/lib/network/network-context";
import { OfflineBanner } from "@/lib/network/offline-banner";
import { usePushNotifications } from "@/lib/notifications/use-push-notifications";
import { ToastProvider } from "@/lib/toast/toast-context";

import { AuthProvider, useAuth } from "./providers/auth-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

function PushNotificationSetup({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  usePushNotifications(isAuthenticated);
  return <>{children}</>;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PushNotificationSetup>
          <NetworkProvider>
            <ToastProvider>
              {children}
              <OfflineBanner />
            </ToastProvider>
          </NetworkProvider>
        </PushNotificationSetup>
      </AuthProvider>
    </QueryClientProvider>
  );
}
