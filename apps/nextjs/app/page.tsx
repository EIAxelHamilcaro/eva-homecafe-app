import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { authGuard } from "@/adapters/guards/auth.guard";
import { FaqSection, faqItems } from "./_components/faq-section";
import { FeaturesSection } from "./_components/features-section";
import { HeroSection } from "./_components/hero-section";
import { LandingFooter } from "./_components/landing-footer";
import { LandingNavbar } from "./_components/landing-navbar";
import { TestimonialsSection } from "./_components/testimonials-section";

export const metadata: Metadata = {
  title: "HomeCafe — Ton quotidien structuré avec créativité",
  description:
    "Journal intime, suivi d'humeur, kanban, galerie photo et feed social — tout dans une appli cozy. Gratuit.",
  keywords: [
    "journal",
    "mood tracker",
    "kanban",
    "social",
    "gallery",
    "moodboard",
    "productivity",
    "bien-être",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://homecafe.app",
    title: "HomeCafe — Ton quotidien structuré avec créativité",
    description:
      "Journal intime, suivi d'humeur, kanban, galerie photo et feed social — tout dans une appli cozy.",
    siteName: "HomeCafe",
    images: [
      {
        url: "/og-landing.png",
        width: 1200,
        height: 630,
        alt: "HomeCafe — Ton quotidien structuré avec créativité",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeCafe — Ton quotidien structuré avec créativité",
    description:
      "Journal intime, suivi d'humeur, kanban, galerie photo et feed social.",
    images: ["/og-landing.png"],
  },
  alternates: {
    canonical: "https://homecafe.app",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "HomeCafe",
      url: "https://homecafe.app",
      description:
        "Journal intime, suivi d'humeur, kanban, galerie photo et feed social.",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};

export default async function Home() {
  let authenticated = false;

  try {
    const guardResult = await authGuard();
    authenticated = guardResult.authenticated;
  } catch {
    // Auth unavailable — show landing page for visitors
  }

  if (authenticated) {
    redirect("/dashboard");
  }

  return (
    <>
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <LandingFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
