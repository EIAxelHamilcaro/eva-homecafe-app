import { Button } from "@packages/ui/components/ui/button";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { TodoListView } from "./_components/todo-list-view";

export default async function OrganizationPage() {
  await requireAuth();

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Organization</h1>
      <div className="mb-4 flex gap-2">
        <Button>To-do</Button>
        <Button variant="secondary" disabled>
          Kanban
        </Button>
        <Button variant="secondary" disabled>
          Chronology
        </Button>
      </div>
      <TodoListView />
    </div>
  );
}
