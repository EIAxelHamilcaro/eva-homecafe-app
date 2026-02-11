const stats = [
  {
    value: "70 %",
    description: "comprennent mieux leurs émotions en les suivant visuellement",
    color: "text-homecafe-orange",
  },
  {
    value: "15",
    description:
      "minutes par jour suffisent pour faire de la place dans ta tête",
    color: "text-homecafe-blue",
  },
  {
    value: "40 %",
    description:
      "de charge mentale en moins quand tout est posé au même endroit",
    color: "text-homecafe-green",
  },
];

export function StatsSection() {
  return (
    <section aria-label="Statistiques" className="bg-white py-14 lg:py-20">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 sm:grid-cols-3 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.value} className="text-center">
            <p className={`text-4xl font-medium lg:text-[56px] ${stat.color}`}>
              {stat.value}
            </p>
            <p
              className={`mt-4 text-sm leading-relaxed lg:text-xl ${stat.color}`}
            >
              {stat.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
