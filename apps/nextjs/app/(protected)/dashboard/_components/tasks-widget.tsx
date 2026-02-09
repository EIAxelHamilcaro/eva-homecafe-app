import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import Link from "next/link";
import { getChronology } from "@/adapters/queries/chronology.query";
import { WidgetEmptyState } from "./widget-empty-state";

interface TasksWidgetProps {
  userId: string;
}

export async function TasksWidget({ userId }: TasksWidgetProps) {
  const result = await getChronology(userId);

  const pendingCards = result.cards.filter((c) => !c.isCompleted).slice(0, 5);

  if (pendingCards.length === 0 && result.cards.length === 0) {
    return <WidgetEmptyState type="tasks" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link href="/organization" className="hover:underline">
            Tasks
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingCards.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            All tasks completed!
          </p>
        ) : (
          <ul className="space-y-2">
            {pendingCards.map((card) => (
              <li key={card.id} className="flex items-start gap-2">
                <div className="mt-1 h-4 w-4 shrink-0 rounded border border-muted-foreground/30" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{card.title}</p>
                  {card.dueDate && (
                    <p className="text-xs text-muted-foreground">
                      Due: {card.dueDate}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
