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
    default: "HomeCafe",
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
  metadataBase: new URL("https://homecafe.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://homecafe.app",
    title: "HomeCafe",
    description:
      "Journal intime, suivi d'humeur, kanban, galerie photo et feed social — tout dans une appli cozy.",
    siteName: "HomeCafe",
    images: [
      {
        url: "/og-landing.png",
        width: 1200,
        height: 630,
        alt: "HomeCafe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeCafe",
    description:
      "Journal intime, suivi d'humeur, kanban, galerie photo et feed social — tout dans une appli cozy.",
    images: ["/og-landing.png"],
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
  applicationName: "HomeCafe",
};
