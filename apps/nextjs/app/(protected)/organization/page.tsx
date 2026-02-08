"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@packages/ui/components/ui/tabs";
import { KanbanListView } from "./_components/kanban-list-view";
import { TodoListView } from "./_components/todo-list-view";

export default function OrganizationPage() {
  return (
    <div className="mx-auto max-w-6xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Organization</h1>
      <Tabs defaultValue="todo">
        <TabsList className="mb-4">
          <TabsTrigger value="todo">To-do</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="chronology" disabled>
            Chronology
          </TabsTrigger>
        </TabsList>
        <TabsContent value="todo">
          <div className="mx-auto max-w-2xl">
            <TodoListView />
          </div>
        </TabsContent>
        <TabsContent value="kanban">
          <KanbanListView />
        </TabsContent>
        <TabsContent value="chronology">
          <p className="text-muted-foreground text-sm">Coming soon...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
