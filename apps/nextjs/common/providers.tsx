import { ThemeProvider, Toaster } from "@packages/ui/index";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { env } from "./env";

export default function Providers({ children }: { children: ReactNode }) {
  return (
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
  );
}
