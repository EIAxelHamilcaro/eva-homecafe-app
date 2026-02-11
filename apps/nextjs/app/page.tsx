import type { Metadata } from "next";
import { CtaSection } from "./_components/cta-section";
import { faqItems } from "./_components/faq-data";
import { FaqSection } from "./_components/faq-section";
import { FeaturesSection } from "./_components/features-section";
import { HeroSection } from "./_components/hero-section";
import { LandingFooter } from "./_components/landing-footer";
import { LandingNavbar } from "./_components/landing-navbar";
import { StatsSection } from "./_components/stats-section";
import { TestimonialsSection } from "./_components/testimonials-section";

export const metadata: Metadata = {
  title: "HomeCafe \u2014 Ton quotidien structur\u00e9 avec douceur",
  description:
    "HomeCaf\u00e9 est un espace personnel et apaisant o\u00f9 tu peux \u00e9crire, suivre ton humeur, organiser ton quotidien et \u00e9changer avec d'autres.",
  keywords: [
    "journal",
    "mood tracker",
    "kanban",
    "social",
    "gallery",
    "moodboard",
    "productivity",
    "bien-\u00eatre",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://homecafe.app",
    title: "HomeCafe \u2014 Ton quotidien structur\u00e9 avec douceur",
    description:
      "HomeCaf\u00e9 est un espace personnel et apaisant o\u00f9 tu peux \u00e9crire, suivre ton humeur, organiser ton quotidien et \u00e9changer avec d'autres.",
    siteName: "HomeCafe",
    images: [
      {
        url: "/og-landing.png",
        width: 1200,
        height: 630,
        alt: "HomeCafe \u2014 Ton quotidien structur\u00e9 avec douceur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeCafe \u2014 Ton quotidien structur\u00e9 avec douceur",
    description:
      "HomeCaf\u00e9 est un espace personnel et apaisant o\u00f9 tu peux \u00e9crire, suivre ton humeur, organiser ton quotidien et \u00e9changer avec d'autres.",
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
        "HomeCaf\u00e9 est un espace personnel et apaisant o\u00f9 tu peux \u00e9crire, suivre ton humeur, organiser ton quotidien et \u00e9changer avec d'autres.",
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
  return (
    <>
      <LandingNavbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
