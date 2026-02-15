import { Button } from "@packages/ui/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="bg-white pt-28 pb-16 lg:pt-32 lg:pb-20"
    >
      <div className="mx-auto max-w-334 px-6 lg:px-13">
        <div className="relative flex min-h-125 items-center justify-center overflow-hidden rounded-[30px] lg:min-h-[620px]">
          <Image
            src="/landing/hero-image.png"
            alt=""
            fill
            className="pointer-events-none object-cover opacity-50"
            priority
          />
          <div className="relative z-10 mx-auto max-w-165.5 px-6 py-16 text-center">
            <h1
              id="hero-heading"
              className="text-3xl font-medium tracking-tight text-black sm:text-4xl lg:text-[56px] lg:leading-[1.15]"
            >
              Ton quotidien structuré avec douceur
            </h1>
            <p className="mx-auto mt-8 max-w-143.5 text-sm leading-relaxed text-black">
              HomeCafé est un espace personnel et apaisant où tu peux écrire,
              suivre ton humeur, organiser ton quotidien et échanger avec
              d'autres, à ton rythme. Bref, un lieu simple, chaleureux et
              vivant, pensé pour te faire du bien.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="rounded-full px-8 shadow-md">
                <Link href="/register">Commencer</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
