import { requireAuth } from "@/adapters/guards/auth.guard";
import { MoodboardClient } from "./_components/moodboard-client";

export default async function MoodboardPage() {
  await requireAuth();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 font-bold text-2xl">Moodboards</h1>
      <MoodboardClient />
    </div>
  );
}
