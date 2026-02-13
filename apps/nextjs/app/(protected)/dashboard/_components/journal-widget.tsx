import { Card, CardContent } from "@packages/ui/components/ui/card";
import { Lock } from "lucide-react";
import { getJournalEntries } from "@/adapters/queries/journal.query";
import { JournalWidgetClient } from "./journal-widget-client";

interface JournalWidgetProps {
  userId: string;
  userName: string;
  userImage: string | null;
  selectedDate: string;
}

export async function JournalWidget({
  userId,
  userName,
  userImage,
  selectedDate,
}: JournalWidgetProps) {
  const dateLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
    "fr-FR",
    { weekday: "long", day: "numeric", month: "long" },
  );

  let existingContent: string | null = null;
  try {
    const result = await getJournalEntries(userId, selectedDate, 1, 1);
    const firstPost = result.groups[0]?.posts[0];
    if (firstPost) {
      existingContent = firstPost.content;
    }
  } catch {
    /* empty */
  }

  return (
    <Card className="border-none">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Journal</h3>
            <p className="text-sm capitalize text-muted-foreground">
              {dateLabel}
            </p>
          </div>
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <JournalWidgetClient
          selectedDate={selectedDate}
          dateLabel={dateLabel}
          userName={userName}
          userImage={userImage}
          existingContent={existingContent}
        />
      </CardContent>
    </Card>
  );
}
