const stats = [
  {
    value: "70 %",
    description:
      "comprennent mieux leurs \u00e9motions en les suivant visuellement",
    color: "text-orange-500",
  },
  {
    value: "15",
    description:
      "minutes par jour suffisent pour faire de la place dans la t\u00eate",
    color: "text-blue-500",
  },
  {
    value: "40 %",
    description:
      "de charge mentale en moins quand tout est pos\u00e9 au m\u00eame endroit",
    color: "text-green-400",
  },
];

export function StatsSection() {
  return (
    <section aria-label="Statistiques" className="bg-background py-14 lg:py-20">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 sm:grid-cols-3 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.value} className={`text-center ${stat.color}`}>
            <p className={`text-4xl font-bold lg:text-5xl ${stat.color}`}>
              {stat.value}
            </p>
            <p className={`mt-3 text-sm leading-relaxed ${stat.color}`}>
              {stat.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
