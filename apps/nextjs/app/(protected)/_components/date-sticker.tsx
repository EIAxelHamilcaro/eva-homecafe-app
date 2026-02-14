function formatMonth(dateStr?: string): string {
  const d = dateStr ? new Date(`${dateStr}T12:00:00`) : new Date();
  return d.toLocaleDateString("fr-FR", { month: "long" }).toUpperCase();
}

function getDay(dateStr?: string): number {
  const d = dateStr ? new Date(`${dateStr}T12:00:00`) : new Date();
  return d.getDate();
}

interface DateStickerProps {
  date?: string;
}

export function DateSticker({ date }: DateStickerProps) {
  return (
    <div className="flex shrink-0 items-center justify-between rounded bg-homecafe-green py-2 text-white">
      <span className="text-[10px] font-semibold tracking-wide -rotate-90 sm:text-xs">
        {formatMonth(date)}
      </span>
      <span className="text-5xl font-bold leading-none sm:text-6xl">
        {getDay(date)}
      </span>
    </div>
  );
}
