"use client";

import { ThemeProvider, Toaster } from "@packages/ui/index";
import { QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { getQueryClient } from "./query-client";

export default function Providers({
  children,
  locale,
}: {
  children: ReactNode;
  locale: string;
}) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale={locale}>
        <ThemeProvider
          attribute="class"
          defaultTheme={
            process.env.NODE_ENV === "development" ? "light" : "system"
          }
          enableSystem
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}
