import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { NetworkProvider } from "@/lib/network/network-context";
import { OfflineBanner } from "@/lib/network/offline-banner";
import { ToastProvider } from "@/lib/toast/toast-context";

import { AuthProvider } from "./providers/auth-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NetworkProvider>
          <ToastProvider>
            {children}
            <OfflineBanner />
          </ToastProvider>
        </NetworkProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
