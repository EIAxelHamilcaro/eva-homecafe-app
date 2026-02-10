const testimonials = [
  {
    quote:
      "HomeCafe m'a aidée à prendre l'habitude d'écrire chaque jour. L'ambiance est tellement apaisante que ça fait partie de mon rituel du matin.",
    name: "Lea",
    role: "Étudiante en design, 22 ans",
  },
  {
    quote:
      "J'utilise le kanban pour mes projets perso et le mood tracker tous les jours. Tout est au même endroit, c'est génial.",
    name: "Theo",
    role: "Développeur junior, 27 ans",
  },
  {
    quote:
      "Le système de stickers me motive à garder mes streaks. Et le feed avec mes amis proches, c'est exactement ce que je cherchais.",
    name: "Marie",
    role: "Étudiante, 20 ans",
  },
];

export function TestimonialsSection() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            id="testimonials-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Ce qu'ils en disent
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Nos premiers utilisateurs partagent leur expérience.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <blockquote
              key={testimonial.name}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <p className="text-sm leading-relaxed text-muted-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <footer className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-600">
                  {testimonial.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
