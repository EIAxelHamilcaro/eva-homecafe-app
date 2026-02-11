import { Button } from "@packages/ui/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="flex min-h-[600px] items-center justify-center overflow-hidden bg-homecafe-cream bg-[url('/landing/hero-image.png')] bg-cover bg-center bg-blend-soft-light pt-20 lg:min-h-[700px]"
    >
      <div className="mx-auto max-w-3xl px-4 py-16 lg:py-24">
        <div className="px-6 py-10 text-center md:rounded-3xl md:bg-white/90 md:px-14 md:py-14 md:shadow-[0_8px_32px_rgba(0,0,0,0.1)] md:backdrop-blur-sm">
          <h1
            id="hero-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Ton quotidien structuré avec douceur
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            HomeCafé est un espace personnel et apaisant où tu peux écrire,
            suivre ton humeur, organiser ton quotidien et échanger avec
            d'autres, à ton rythme. Bref, un lieu simple, chaleureux et vivant,
            pensé pour te faire du bien.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="rounded-full px-8 shadow-md">
              <Link href="/register">Commencer</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
