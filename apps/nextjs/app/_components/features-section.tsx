import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import Image from "next/image";

const features = [
  {
    title: "Du journaling",
    description:
      "C'est un espace pour écrire librement, déposer tes pensées et suivre ton évolution au fil du temps. Que ce soit quelques lignes ou de longues pages, ton journal t'appartient.",
    image: "/landing/card-1.png",
    glowColor: "border-homecafe-green/20",
  },
  {
    title: "De l'organisation",
    description:
      "C'est un outil pour organiser tes journées sans pression. Tâches, idées, listes : tout est là pour t'aider à avancer en douceur, sans te surcharger.",
    image: "/landing/card-2.png",
    glowColor: "border-homecafe-pink/20",
  },
  {
    title: "Du suivi émotionnel",
    description:
      "C'est le suivi de ton humeur, jour après jour, sans jugement. Quelques couleurs, des mots simples, pour mieux comprendre ce que tu ressens et suivre ton équilibre émotionnel dans le temps.",
    image: "/landing/card-3.png",
    glowColor: "border-homecafe-orange/20",
  },
  {
    title: "Des connexions",
    description:
      "C'est une opportunité d'échanges avec d'autres personnes dans un espace bienveillant. Discussions légères, messages privés et partages d'inspirations : ici, on prend le temps.",
    image: "/landing/card-4.png",
    glowColor: "border-homecafe-blue/20",
  },
  {
    title: "Un espace sur mesure",
    description:
      "Personnalise ton espace HomeCafé selon tes besoins et ton rythme. Choisis ce que tu veux voir, organiser ou suivre afin de créer un lieu qui te ressemble vraiment.",
    image: "/landing/card-5.png",
    glowColor: "border-homecafe-yellow/20",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="bg-white py-16 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <h2
          id="features-heading"
          className="text-center text-3xl font-medium tracking-tight text-black sm:text-4xl lg:text-[56px]"
        >
          HomeCaf&eacute;, c&apos;est quoi ?
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.slice(0, 3).map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-stretch gap-8 sm:flex-row sm:justify-center">
          {features.slice(3).map((feature) => (
            <div key={feature.title} className="w-full max-w-sm">
              <FeatureCard feature={feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: (typeof features)[number] }) {
  return (
    <Card
      className={`h-full gap-0 py-0 shadow-sm border-12 ${feature.glowColor}`}
    >
      <CardHeader className="p-6 pb-0">
        <CardTitle className="text-2xl font-medium text-black">
          {feature.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4 p-6">
        <div className="aspect-4/3 overflow-hidden rounded-xl">
          <Image
            src={feature.image}
            alt={feature.title}
            className="h-full w-full object-cover"
            loading="lazy"
            width={301}
            height={201}
          />
        </div>
        <p className="flex-1 text-base leading-relaxed text-black">
          {feature.description}
        </p>
      </CardContent>
    </Card>
  );
}
