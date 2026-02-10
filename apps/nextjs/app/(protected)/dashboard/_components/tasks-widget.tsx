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
      <Card>
        <CardHeader>
          <CardTitle>
            <Link href="/organization" className="hover:underline">
              Tasks
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="font-medium text-muted-foreground">
              All tasks completed!
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Great job — you're all caught up.
            </p>
          </div>
        </CardContent>
      </Card>
    );
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
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start gap-2">
              <div className="mt-1 h-4 w-4 shrink-0 rounded border border-muted-foreground/30" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{task.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {task.boardTitle}
                  {task.dueDate && (
                    <span
                      className={
                        isOverdue(task.dueDate)
                          ? " text-destructive font-medium"
                          : ""
                      }
                    >
                      {" "}
                      · Due: {task.dueDate}
                    </span>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
