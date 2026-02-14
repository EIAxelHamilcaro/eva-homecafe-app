const MONTH_NAMES = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export function DateStickerCard() {
  const now = new Date();
  const day = now.getDate();
  const month = MONTH_NAMES[now.getMonth()] ?? "";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl bg-homecafe-green/20">
        <span className="text-xs font-medium text-homecafe-green">{month}</span>
        <span className="text-3xl font-bold text-homecafe-green">{day}</span>
      </div>
    </div>
  );
}
