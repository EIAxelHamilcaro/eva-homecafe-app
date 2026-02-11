"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Card, CardContent, CardFooter } from "@packages/ui/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useState } from "react";

const testimonials = [
  {
    id: "testimonial-1",
    quote:
      "Depuis que j'utilise HomeCafé, j'ai enfin un endroit pour poser mes pensées sans jugement. Le journal m'aide à y voir plus clair dans mes journées et à mieux comprendre mes émotions.",
    name: "Lisa",
    age: "28 ans",
  },
  {
    id: "testimonial-2",
    quote:
      "Le suivi d'humeur a changé ma façon de voir mes semaines. Je repère mieux les moments où j'ai besoin de ralentir. C'est devenu un vrai rituel du soir.",
    name: "Théo",
    age: "24 ans",
  },
  {
    id: "testimonial-3",
    quote:
      "J'adore le côté tout-en-un : mon kanban pour le boulot, mon journal pour moi, et le feed pour échanger avec mes amis. Tout est au même endroit, c'est reposant.",
    name: "Camille",
    age: "31 ans",
  },
  {
    id: "testimonial-4",
    quote:
      "Les moodboards m'inspirent au quotidien. Je collectionne des images qui me font du bien et ça me motive. L'ambiance cozy de l'app rend tout plus agréable.",
    name: "Inès",
    age: "22 ans",
  },
  {
    id: "testimonial-5",
    quote:
      "Grâce à HomeCafé, j'ai retrouvé une routine qui me convient. Les tâches ne sont plus stressantes, elles sont juste posées là, tranquillement, sans pression.",
    name: "Maxime",
    age: "26 ans",
  },
  {
    id: "testimonial-6",
    quote:
      "Ce qui m'a surprise, c'est le feed social. C'est bienveillant, pas de course aux likes. On partage des vraies choses et ça fait du bien de se sentir écoutée.",
    name: "Aïcha",
    age: "29 ans",
  },
];

function getVisibleIndices(center: number, total: number) {
  const prev = (center - 1 + total) % total;
  const next = (center + 1) % total;
  return [prev, center, next];
}

export function TestimonialsSection() {
  const [centerIndex, setCenterIndex] = useState(1);

  const goNext = useCallback(() => {
    setCenterIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const goPrev = useCallback(() => {
    setCenterIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  }, []);

  const visibleIndices = getVisibleIndices(centerIndex, testimonials.length);

  return (
    <section
      aria-label="Témoignages"
      className="bg-homecafe-grey/15 py-16 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex items-center gap-4 lg:gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="hidden shrink-0 sm:flex"
            aria-label="Témoignage précédent"
            onClick={goPrev}
          >
            <ChevronLeft className="size-6" />
          </Button>

          <div className="grid flex-1 grid-cols-1 items-center gap-6 md:grid-cols-3">
            {visibleIndices.map((index, position) => {
              const testimonial = testimonials[
                index
              ] as (typeof testimonials)[number];
              const isCenter = position === 1;
              return (
                <Card
                  key={testimonial.id}
                  className={`justify-between border-homecafe-grey transition-all duration-300 ${
                    isCenter ? "scale-105 py-10 shadow-md" : "py-8 opacity-80"
                  }`}
                >
                  <CardContent className="flex-1">
                    <p
                      className={`leading-relaxed text-black ${isCenter ? "text-base" : "text-sm"}`}
                    >
                      {testimonial.quote}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-homecafe-grey-dark">
                      {testimonial.name}, {testimonial.age}.
                    </p>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="hidden shrink-0 sm:flex"
            aria-label="Témoignage suivant"
            onClick={goNext}
          >
            <ChevronRight className="size-6" />
          </Button>
        </div>

        <div className="mt-6 flex justify-center gap-2 sm:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Témoignage précédent"
            onClick={goPrev}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Témoignage suivant"
            onClick={goNext}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
