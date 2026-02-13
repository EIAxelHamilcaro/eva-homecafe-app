import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import Link from "next/link";
import {
  getPendingTasks,
  getTotalCardCount,
  type IPendingTaskDto,
} from "@/adapters/queries/pending-tasks.query";
import { WidgetEmptyState } from "./widget-empty-state";

interface TasksWidgetProps {
  userId: string;
}

function getLocalDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isOverdue(dueDate: string): boolean {
  return dueDate < getLocalDateString();
}

export async function TasksWidget({ userId }: TasksWidgetProps) {
  let tasks: IPendingTaskDto[];
  let totalCards: number;
  try {
    [tasks, totalCards] = await Promise.all([
      getPendingTasks(userId, 5),
      getTotalCardCount(userId),
    ]);
  } catch {
    return <WidgetEmptyState type="tasks" />;
  }

  if (totalCards === 0) {
    return <WidgetEmptyState type="tasks" />;
  }

  if (tasks.length === 0) {
    return (
      <Card className="border-0">
        <CardHeader>
          <CardTitle>To do list</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ceci est un affichage restreint
          </p>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center">
            <p className="font-medium text-muted-foreground">
              Toutes les tâches sont terminées !
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Bravo — tu es à jour.
            </p>
          </div>
          <Link
            href="/organization"
            className="inline-block rounded-full bg-homecafe-pink px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            Voir plus
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle>To do list</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ceci est un affichage restreint
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start gap-2">
              <div className="mt-1 h-4 w-4 shrink-0 rounded border border-muted-foreground/30" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{task.title}</p>
                {task.dueDate && (
                  <p className="truncate text-xs text-muted-foreground">
                    {task.boardTitle}
                    <span
                      className={
                        isOverdue(task.dueDate)
                          ? " font-medium text-destructive"
                          : ""
                      }
                    >
                      {" "}
                      · Échéance : {task.dueDate}
                    </span>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <Link
          href="/organization"
          className="mt-4 inline-block rounded-full bg-homecafe-pink px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          Voir plus
        </Link>
      </CardContent>
    </Card>
  );
}
