import Link from "next/link";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { JournalEntries } from "./_components/journal-entries";
import { StreakCounter } from "./_components/streak-counter";

export default async function JournalPage() {
  await requireAuth();

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Journal</h1>
        <Link
          href="/posts/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Entry
        </Link>
      </div>
      <StreakCounter />
      <JournalEntries />
    </div>
  );
}
