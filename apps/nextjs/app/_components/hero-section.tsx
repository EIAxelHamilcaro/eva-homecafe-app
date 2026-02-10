import Link from "next/link";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-gradient-to-b from-orange-50 to-background py-16 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="text-center lg:text-left">
            <h1
              id="hero-heading"
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Ton quotidien <span className="text-rose-500">structuré</span>{" "}
              avec <span className="text-rose-500">créativité</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Journal intime, suivi d'humeur, kanban, galerie photo et feed
              social — tout dans une appli cozy et gratuite. Ton petit café
              numérique, toujours ouvert.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/register"
                className="inline-flex h-12 items-center rounded-lg bg-rose-500 px-8 text-base font-semibold text-white shadow-sm transition-colors hover:bg-rose-600"
              >
                S'inscrire gratuitement
              </Link>
              <a
                href="#features"
                className="inline-flex h-12 items-center rounded-lg border border-border px-8 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                Découvrir
              </a>
            </div>
          </div>
          <div className="mt-12 flex justify-center lg:mt-0" aria-hidden="true">
            <div className="relative h-64 w-64 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-200 via-orange-100 to-amber-100" />
              <div className="absolute inset-4 flex items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-orange-50">
                <span className="text-7xl sm:text-8xl lg:text-9xl">
                  &#9749;
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
