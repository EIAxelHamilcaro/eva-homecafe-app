import { Card, CardContent } from "@packages/ui/components/ui/card";
import { MOOD_CATEGORIES } from "@/app/(protected)/mood/_components/mood-config";

export function MoodLegendCard() {
  return (
    <Card className="border-0">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold">Légende</h3>
        <p className="text-xs text-muted-foreground">Palette d&apos;humeurs</p>
        <div className="mt-3 space-y-2">
          {MOOD_CATEGORIES.map((mood) => (
            <div key={mood.value} className="flex items-center gap-2">
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: mood.color }}
              />
              <span className="text-xs font-medium">{mood.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
