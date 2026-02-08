import { requireAuth } from "@/adapters/guards/auth.guard";
import { MoodForm } from "./_components/mood-form";

export default async function MoodPage() {
  await requireAuth();

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Mood Tracker</h1>
      <MoodForm />
    </div>
  );
}
