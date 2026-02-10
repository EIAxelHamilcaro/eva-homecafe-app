const features = [
  {
    title: "Journal & Posts",
    description:
      "Exprime-toi librement avec du texte riche et des images. Public ou privé, à toi de choisir.",
    icon: "\u270D\uFE0F",
  },
  {
    title: "Suivi d'humeur",
    description:
      "Enregistre ton humeur au quotidien parmi 9 catégories et visualise tes tendances sur 6 mois.",
    icon: "\uD83C\uDF08",
  },
  {
    title: "Organisation",
    description:
      "Gère tes projets avec des to-do lists, des tableaux kanban et une vue chronologie/calendrier.",
    icon: "\uD83D\uDCCB",
  },
  {
    title: "Feed social",
    description:
      "Partage avec tes proches, réagis à leurs posts et reste connecté dans un espace bienveillant.",
    icon: "\uD83D\uDC9B",
  },
  {
    title: "Galerie & Moodboard",
    description:
      "Collectionne tes photos préférées et crée des moodboards visuels pour tes inspirations.",
    icon: "\uD83D\uDDBC\uFE0F",
  },
  {
    title: "Stickers & Badges",
    description:
      "Débloque des récompenses en maintenant tes habitudes. Collectionne stickers et badges !",
    icon: "\u2B50",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="bg-muted/50 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            HomeCafe c'est quoi ?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tout ce dont tu as besoin, dans un seul endroit chaleureux.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
