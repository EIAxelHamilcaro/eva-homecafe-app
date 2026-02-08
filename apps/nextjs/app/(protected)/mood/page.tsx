import { requireAuth } from "@/adapters/guards/auth.guard";
import { MoodForm } from "./_components/mood-form";
import { MoodHistory } from "./_components/mood-history";

export default async function MoodPage() {
  await requireAuth();

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Mood Tracker</h1>
      <div className="space-y-8">
        <MoodForm />
        <MoodHistory />
      </div>
    </div>
  );
}
