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
      "C'est un espace pour \u00e9crire librement, d\u00e9poser tes pens\u00e9es et suivre ton \u00e9volution au fil du temps. Que ce soit quelques lignes ou de longues pages, ton journal t'appartient.",
    image: "/landing/card-1.png",
    borderColor: "border-green-100",
  },
  {
    title: "De l'organisation",
    description:
      "C'est un outil pour organiser tes journ\u00e9es sans pression. T\u00e2ches, id\u00e9es, listes : tout est l\u00e0 pour t'aider \u00e0 avancer en douceur, sans te surcharger.",
    image: "/landing/card-2.png",
    borderColor: "border-pink-100",
  },
  {
    title: "Du suivi \u00e9motionnel",
    description:
      "C'est le suivi de ton humeur, jour apr\u00e8s jour, sans jugement. Quelques couleurs, des mots simples, pour mieux comprendre ce que tu ressens et suivre ton \u00e9quilibre \u00e9motionnel dans le temps.",
    image: "/landing/card-3.png",
    borderColor: "border-orange-100",
  },
  {
    title: "Des rencontres",
    description:
      "C'est une opportunit\u00e9 d'\u00e9changes avec d'autres personnes dans un espace bienveillant. Discussions l\u00e9g\u00e8res, messages priv\u00e9s et partages d'inspirations : ici, on prend le temps.",
    image: "/landing/card-4.png",
    borderColor: "border-blue-100",
  },
  {
    title: "Un espace sur mesure",
    description:
      "Personnalise ton espace HomeCaf\u00e9 selon tes besoins et ton rythme. Choisis ce que tu veux voir, organiser ou suivre afin de cr\u00e9er un lieu qui te ressemble vraiment.",
    image: "/landing/card-5.png",
    borderColor: "border-yellow-100",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="bg-background py-16 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <h2
          id="features-heading"
          className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          HomeCaf&eacute;, c'est quoi ?
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.slice(0, 3).map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
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
    <Card className={`border-12 py-0 ${feature.borderColor}`}>
      <CardHeader className="px-5 pt-5 pb-0">
        <CardTitle className="text-lg">{feature.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5">
        <div className="aspect-4/3 overflow-hidden rounded-xl">
          <Image
            src={feature.image}
            alt={feature.title}
            className="h-full w-full object-cover"
            loading="lazy"
            width={"100"}
            height={"100"}
          />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {feature.description}
        </p>
      </CardContent>
    </Card>
  );
}
