import { getMoodByDate } from "@/adapters/queries/today-mood.query";
import { MoodboardWidget } from "./moodboard-widget";

interface MoodboardWidgetServerProps {
  userId: string;
  selectedDate: string;
}

export async function MoodboardWidgetServer({
  userId,
  selectedDate,
}: MoodboardWidgetServerProps) {
  let existingIntensity: number | null = null;
  let existingCategory: string | null = null;

  try {
    const mood = await getMoodByDate(userId, selectedDate);
    if (mood) {
      existingIntensity = mood.intensity;
      existingCategory = mood.category;
    }
  } catch {
    /* empty */
  }

  return (
    <MoodboardWidget
      selectedDate={selectedDate}
      existingIntensity={existingIntensity}
      existingCategory={existingCategory}
    />
  );
}
