import { Card, CardContent } from "@packages/ui/components/ui/card";
import { MOOD_CATEGORIES } from "@/app/(protected)/mood/_components/mood-config";

export function MoodLegendCard() {
  return (
    <Card className="rounded-lg border-0">
      <CardContent className="px-4 py-3">
        <h3 className="text-sm font-semibold">Légende</h3>
        <p className="text-[11px] text-muted-foreground">
          Palette d&apos;humeurs
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 lg:grid-cols-1 lg:gap-x-0">
          {MOOD_CATEGORIES.map((mood) => (
            <div key={mood.value} className="flex items-center gap-1.5">
              <div
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: mood.color }}
              />
              <span className="text-[11px] font-medium leading-tight">
                {mood.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
