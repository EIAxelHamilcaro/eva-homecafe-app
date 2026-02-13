"use client";

import { ThemeProvider, Toaster } from "@packages/ui/index";
import { QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { env } from "./env";
import { getQueryClient } from "./query-client";

export default function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme={env.NODE_ENV === "development" ? "light" : "system"}
          enableSystem
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}
