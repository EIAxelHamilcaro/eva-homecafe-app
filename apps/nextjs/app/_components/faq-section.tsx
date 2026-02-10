const faqItems = [
  {
    question: "C'est quoi HomeCafe ?",
    answer:
      "HomeCafe est une application tout-en-un pour organiser ton quotidien : journal, suivi d'humeur, kanban, galerie photo, moodboards et feed social — dans une ambiance café cozy.",
  },
  {
    question: "C'est gratuit ?",
    answer:
      "Oui, HomeCafe est entièrement gratuit. Pas de paywall, pas de publicité. Toutes les fonctionnalités sont accessibles dès l'inscription.",
  },
  {
    question: "Comment ajouter des amis ?",
    answer:
      "Chaque utilisateur possède un code ami unique et un QR code. Partage ton code ou scanne celui d'un ami pour vous connecter instantanément.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer:
      "Absolument. Toutes les données sont chiffrées en transit (HTTPS), les mots de passe sont hachés avec un algorithme standard, et tu peux supprimer ton compte à tout moment.",
  },
  {
    question: "Sur quelles plateformes est disponible HomeCafe ?",
    answer:
      "HomeCafe est disponible sur le web (desktop et tablette) et en application mobile (iOS et Android).",
  },
];

export function FaqSection() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="bg-muted/50 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            id="faq-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Questions fréquentes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tout ce que tu dois savoir pour commencer.
          </p>
        </div>
        <div className="mt-12 space-y-4">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-lg border border-border bg-card"
            >
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-semibold text-foreground transition-colors hover:text-rose-500 [&::-webkit-details-marker]:hidden">
                {item.question}
                <svg
                  className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-6 pb-4 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export { faqItems };
