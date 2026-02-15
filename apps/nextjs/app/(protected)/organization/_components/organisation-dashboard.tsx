"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useEffect, useState } from "react";
import {
  useDashboardLayoutQuery,
  useUpdateDashboardLayoutMutation,
} from "@/app/(protected)/_hooks/use-dashboard-layout";
import { BadgesSection } from "./badges-section";
import { CalendarView } from "./calendar-view";
import { GanttView } from "./gantt-view";
import { KanbanListView } from "./kanban-list-view";
import { SectionWrapper } from "./section-wrapper";
import { TabNavigation } from "./tab-navigation";
import { TableauView } from "./tableau-view";
import { TodoListView } from "./todo-list-view";

const SECTION_TITLES: Record<string, string> = {
  "todo-kanban": "To-do & Kanban",
  tableau: "Tableau",
  chronologie: "Chronologie",
  calendrier: "Calendrier",
  badges: "Badges",
};

const DEFAULT_ORDER = [
  "todo-kanban",
  "tableau",
  "chronologie",
  "calendrier",
  "badges",
];

export function OrganisationDashboard() {
  const { data: layoutConfig } = useDashboardLayoutQuery();
  const updateLayout = useUpdateDashboardLayoutMutation();

  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_ORDER);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  useEffect(() => {
    if (layoutConfig) {
      setSectionOrder(layoutConfig.sectionOrder);
      setCollapsedSections(layoutConfig.collapsedSections);
    }
  }, [layoutConfig]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setSectionOrder((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        const newOrder = arrayMove(prev, oldIndex, newIndex);
        updateLayout.mutate({ sectionOrder: newOrder });
        return newOrder;
      });
    },
    [updateLayout],
  );

  const toggleCollapse = useCallback(
    (sectionId: string) => {
      setCollapsedSections((prev) => {
        const next = prev.includes(sectionId)
          ? prev.filter((id) => id !== sectionId)
          : [...prev, sectionId];
        updateLayout.mutate({ collapsedSections: next });
        return next;
      });
    },
    [updateLayout],
  );

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "todo-kanban":
        return (
          <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
            <TodoListView />
            <KanbanListView />
          </div>
        );
      case "tableau":
        return <TableauView />;
      case "chronologie":
        return <GanttView />;
      case "calendrier":
        return <CalendarView />;
      case "badges":
        return <BadgesSection />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4">
      <TabNavigation />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sectionOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6 pb-8">
            {sectionOrder.map((sectionId) => (
              <div key={sectionId} id={`section-${sectionId}`}>
                <SectionWrapper
                  id={sectionId}
                  title={SECTION_TITLES[sectionId] ?? sectionId}
                  isCollapsed={collapsedSections.includes(sectionId)}
                  onToggleCollapse={() => toggleCollapse(sectionId)}
                >
                  {renderSection(sectionId)}
                </SectionWrapper>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
