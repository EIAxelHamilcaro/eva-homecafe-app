import type { Metadata } from "next";
import { Sora } from "next/font/google";
import type { ReactElement, ReactNode } from "react";
import Providers from "../common/providers";
import "./global.css";

import { Analytics } from "@vercel/analytics/next";
import "@packages/ui/globals.css";
import { getLocale } from "next-intl/server";

const sora = Sora({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): Promise<ReactElement> {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={sora.className}>
        <Providers>{children}</Providers>
      </body>
      <Analytics />
    </html>
  );
}

export const metadata: Metadata = {
  title: {
    default: "Homecafe",
    template: "%s | Homecafe",
  },
  authors: [{ name: "AxelHamil", url: "https://github.com/axelhamil" }],
  creator: "AxelHamil",
  publisher: "AxelHamil",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://github.com/axelhamil"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://github.com/axelhamil/nextjs-clean-architecture-starter",
    title: "Homecafe",
    siteName: "Homecafe",
    images: [],
  },
  twitter: {
    card: "summary_large_image",
    title: "Homecafe",
    images: ["/og-image.png"],
    creator: "@axelhamil",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  applicationName: "Homecafe",
};
