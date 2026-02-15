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
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useCallback, useEffect, useRef, useState } from "react";
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
  todo: "To-do list",
  kanban: "Kanban",
  tableau: "Tableau",
  chronologie: "Chronologie",
  calendrier: "Calendrier",
  badges: "Badges",
};

const DEFAULT_ORDER = [
  "todo",
  "kanban",
  "tableau",
  "chronologie",
  "calendrier",
  "badges",
];

interface OrganisationDashboardProps {
  userName: string;
  userImage: string | null;
}

export function OrganisationDashboard({
  userName,
  userImage,
}: OrganisationDashboardProps) {
  const { data: layoutConfig } = useDashboardLayoutQuery();
  const updateLayout = useUpdateDashboardLayoutMutation();

  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_ORDER);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!layoutConfig || initializedRef.current) return;
    initializedRef.current = true;

    let order = layoutConfig.sectionOrder;
    if (order.includes("todo-kanban")) {
      const idx = order.indexOf("todo-kanban");
      order = [
        ...order.slice(0, idx),
        "todo",
        "kanban",
        ...order.slice(idx + 1),
      ];
      updateLayout.mutate({ sectionOrder: order });
    }
    setSectionOrder(order);
    setCollapsedSections(layoutConfig.collapsedSections);
  }, [layoutConfig, updateLayout]);

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
      case "todo":
        return <TodoListView />;
      case "kanban":
        return <KanbanListView userName={userName} userImage={userImage} />;
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
        <SortableContext items={sectionOrder} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-6 pb-8 lg:grid-cols-3">
            {sectionOrder.map((sectionId, index) => {
              const nextId = sectionOrder[index + 1];
              const prevId = sectionOrder[index - 1];

              const isTodoBeforeKanban =
                sectionId === "todo" && nextId === "kanban";
              const isKanbanAfterTodo =
                sectionId === "kanban" && prevId === "todo";

              let colSpan = "lg:col-span-3";
              if (isTodoBeforeKanban) colSpan = "lg:col-span-1";
              if (isKanbanAfterTodo) colSpan = "lg:col-span-2";

              return (
                <div
                  key={sectionId}
                  id={`section-${sectionId}`}
                  className={colSpan}
                >
                  <SectionWrapper
                    id={sectionId}
                    title={SECTION_TITLES[sectionId] ?? sectionId}
                    isCollapsed={collapsedSections.includes(sectionId)}
                    onToggleCollapse={() => toggleCollapse(sectionId)}
                  >
                    {renderSection(sectionId)}
                  </SectionWrapper>
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
