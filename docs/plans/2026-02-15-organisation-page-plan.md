# Organisation Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refonte complète de la page Organisation pour matcher le Figma — page scrollable avec sections To-do + Kanban side by side, Tableau, Chronologie Gantt, Calendrier mensuel, Badges — toutes sections collapsables et réorganisables par drag & drop, layout persisté en DB.

**Architecture:** Dashboard scrollable avec sections réorganisables. Tab bar pill-style pour navigation rapide (smooth scroll). Chaque section = composant autonome dans un wrapper collapsable/draggable. Layout config stocké dans une nouvelle table `dashboard_layout` en DB. @dnd-kit déjà installé pour le drag & drop.

**Tech Stack:** Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui + @dnd-kit + Drizzle ORM + Zod

---

## Task 1: Schema DB — Table `dashboard_layout`

**Files:**
- Create: `packages/drizzle/src/schema/dashboard-layout.ts`
- Modify: `packages/drizzle/src/schema/index.ts`

**Step 1: Create the schema file**

```typescript
// packages/drizzle/src/schema/dashboard-layout.ts
import { jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const dashboardLayout = pgTable(
  "dashboard_layout",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    sectionOrder: jsonb("section_order").$type<string[]>().notNull().default(["todo-kanban", "tableau", "chronologie", "calendrier", "badges"]),
    collapsedSections: jsonb("collapsed_sections").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("dashboard_layout_user_id_idx").on(table.userId)],
);
```

**Step 2: Export from index**

Add `export * from "./dashboard-layout";` to `packages/drizzle/src/schema/index.ts` (alphabetically after `./chat`).

**Step 3: Push schema**

Run: `pnpm db:push` (or `pnpm db:generate` if DB not running — schema will be ready for later push)

**Step 4: Commit**

```bash
git add packages/drizzle/src/schema/dashboard-layout.ts packages/drizzle/src/schema/index.ts
git commit -m "feat: add dashboard_layout table for organization page"
```

---

## Task 2: API Endpoint — Dashboard Layout CRUD

**Files:**
- Create: `apps/nextjs/app/api/v1/dashboard-layout/route.ts`

This is a simple CRUD endpoint — no need for full DDD (it's purely presentation config).

**Step 1: Create the API route**

```typescript
// apps/nextjs/app/api/v1/dashboard-layout/route.ts
import { db } from "@packages/drizzle";
import { dashboardLayout } from "@packages/drizzle/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { v4 as uuid } from "uuid";
import { getInjection } from "@/common/di/container";

const DEFAULT_SECTION_ORDER = ["todo-kanban", "tableau", "chronologie", "calendrier", "badges"];

async function getAuthUserId(): Promise<string | null> {
  const headersList = await headers();
  const useCase = getInjection("GetSessionUseCase");
  const result = await useCase.execute(headersList);
  if (result.isFailure) return null;
  const session = result.getValue();
  if (session.isNone()) return null;
  return session.unwrap().user.id;
}

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [existing] = await db.select().from(dashboardLayout).where(eq(dashboardLayout.userId, userId)).limit(1);

  if (existing) {
    return Response.json({
      sectionOrder: existing.sectionOrder,
      collapsedSections: existing.collapsedSections,
    });
  }

  return Response.json({
    sectionOrder: DEFAULT_SECTION_ORDER,
    collapsedSections: [],
  });
}

export async function PATCH(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { sectionOrder, collapsedSections } = body;

  const [existing] = await db.select().from(dashboardLayout).where(eq(dashboardLayout.userId, userId)).limit(1);

  if (existing) {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (sectionOrder) updates.sectionOrder = sectionOrder;
    if (collapsedSections !== undefined) updates.collapsedSections = collapsedSections;

    await db.update(dashboardLayout).set(updates).where(eq(dashboardLayout.userId, userId));
  } else {
    await db.insert(dashboardLayout).values({
      id: uuid(),
      userId,
      sectionOrder: sectionOrder ?? DEFAULT_SECTION_ORDER,
      collapsedSections: collapsedSections ?? [],
    });
  }

  return Response.json({ success: true });
}
```

**Step 2: Commit**

```bash
git add apps/nextjs/app/api/v1/dashboard-layout/route.ts
git commit -m "feat: add dashboard-layout API endpoint"
```

---

## Task 3: React Query Hook — useDashboardLayout

**Files:**
- Create: `apps/nextjs/app/(protected)/_hooks/use-dashboard-layout.ts`

**Step 1: Create the hook**

```typescript
// apps/nextjs/app/(protected)/_hooks/use-dashboard-layout.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface DashboardLayoutConfig {
  sectionOrder: string[];
  collapsedSections: string[];
}

export function useDashboardLayoutQuery() {
  return useQuery<DashboardLayoutConfig>({
    queryKey: ["dashboard-layout"],
    queryFn: async () => {
      const res = await fetch("/api/v1/dashboard-layout");
      if (!res.ok) throw new Error("Failed to fetch layout");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateDashboardLayoutMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Partial<DashboardLayoutConfig>>({
    mutationFn: async (updates) => {
      const res = await fetch("/api/v1/dashboard-layout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update layout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-layout"] });
    },
  });
}
```

**Step 2: Commit**

```bash
git add apps/nextjs/app/(protected)/_hooks/use-dashboard-layout.ts
git commit -m "feat: add useDashboardLayout React Query hook"
```

---

## Task 4: Section Wrapper — Collapsable + Draggable

**Files:**
- Create: `apps/nextjs/app/(protected)/organization/_components/section-wrapper.tsx`

**Step 1: Create the wrapper component**

This wraps every section with a title bar, collapse toggle, and drag handle. Uses @dnd-kit `useSortable`.

```typescript
// section-wrapper.tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@packages/ui/components/ui/button";
import { ChevronDown, ChevronRight, GripVertical, Pencil } from "lucide-react";
import type { ReactNode } from "react";

interface SectionWrapperProps {
  id: string;
  title: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  children: ReactNode;
  onEdit?: () => void;
}

export function SectionWrapper({
  id,
  title,
  isCollapsed,
  onToggleCollapse,
  children,
  onEdit,
}: SectionWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-2xl border border-orange-100 bg-white"
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <h2 className="flex-1 text-lg font-semibold">{title}</h2>
        {onEdit && (
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      {!isCollapsed && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/nextjs/app/(protected)/organization/_components/section-wrapper.tsx
git commit -m "feat: add SectionWrapper collapsable/draggable component"
```

---

## Task 5: Tab Navigation — Pill-Style with Scroll-to-Section

**Files:**
- Create: `apps/nextjs/app/(protected)/organization/_components/tab-navigation.tsx`

**Step 1: Create the tab navigation**

```typescript
// tab-navigation.tsx
"use client";

import { Button } from "@packages/ui/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

const TABS = [
  { id: "todo-kanban", label: "To-do list" },
  { id: "tableau", label: "Tableau" },
  { id: "todo-kanban", label: "Kanban", scrollId: "todo-kanban" },
  { id: "chronologie", label: "Chronologie" },
  { id: "calendrier", label: "Calendrier" },
] as const;

interface TabNavigationProps {
  activeSection?: string;
}

export function TabNavigation({ activeSection }: TabNavigationProps) {
  const handleScroll = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="sticky top-0 z-10 flex items-center justify-center gap-2 py-4">
      <div className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50/80 p-1 backdrop-blur-sm">
        {TABS.map((tab) => {
          const scrollTarget = tab.scrollId ?? tab.id;
          const isActive = activeSection === scrollTarget;

          return (
            <button
              key={`${tab.id}-${tab.label}`}
              type="button"
              onClick={() => handleScroll(scrollTarget)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-orange-400 text-white shadow-sm"
                  : "text-gray-600 hover:bg-orange-100 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <Button variant="outline" size="sm" className="rounded-full gap-1.5">
        <SlidersHorizontal className="h-4 w-4" />
        Filtre
      </Button>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/nextjs/app/(protected)/organization/_components/tab-navigation.tsx
git commit -m "feat: add pill-style tab navigation component"
```

---

## Task 6: Tableau View — Table Format of Board Tasks

**Files:**
- Create: `apps/nextjs/app/(protected)/organization/_components/tableau-view.tsx`
- Create: `apps/nextjs/app/(protected)/organization/_components/tableau-board.tsx`

**Step 1: Create TableauBoard component**

Table view for a single board — columns: Date, Nom, Texte, État, Priorité, Fichiers.

```typescript
// tableau-board.tsx — table view for one board
"use client";

import { Badge } from "@packages/ui/components/ui/badge";
import { Button } from "@packages/ui/components/ui/button";
import {
  Calendar,
  CheckCheck,
  Cookie,
  FileText,
  Link2,
  Pencil,
  Snail,
  Text,
  Timer,
  X,
} from "lucide-react";
import type { IBoardDto, ICardDto } from "@/application/dto/board/common-board.dto";

interface TableauBoardProps {
  board: IBoardDto;
  onDeleteBoard: () => void;
}

function getStatusInfo(card: ICardDto, columnTitle: string) {
  if (card.isCompleted) return { label: "Terminé", color: "bg-green-100 text-green-700", icon: CheckCheck };
  if (columnTitle.toLowerCase().includes("attente")) return { label: "En attente", color: "bg-yellow-100 text-yellow-700", icon: Snail };
  if (columnTitle.toLowerCase().includes("cours")) return { label: "En cours", color: "bg-orange-100 text-orange-700", icon: Cookie };
  return { label: "À faire", color: "bg-blue-100 text-blue-700", icon: CheckCheck };
}

function getPriorityInfo(card: ICardDto) {
  if (card.progress >= 80) return { label: "Critique", color: "text-red-600" };
  if (card.progress >= 50) return { label: "Prioritaire", color: "text-orange-600" };
  return null;
}

export function TableauBoard({ board, onDeleteBoard }: TableauBoardProps) {
  const allCards = board.columns.flatMap((col) =>
    col.cards.map((card) => ({ ...card, columnTitle: col.title })),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{board.title}</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDeleteBoard}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-orange-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-orange-100 bg-orange-50/50">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-3 w-3" />Date</span>
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Pencil className="h-3 w-3" />Nom</span>
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Text className="h-3 w-3" />Texte</span>
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><CheckCheck className="h-3 w-3" />État</span>
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Timer className="h-3 w-3" />Priorité</span>
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><FileText className="h-3 w-3" />Fichiers</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {allCards.map((card) => {
              const status = getStatusInfo(card, card.columnTitle);
              const priority = getPriorityInfo(card);
              const StatusIcon = status.icon;
              return (
                <tr key={card.id} className="border-b border-orange-50 last:border-0">
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {card.dueDate ? new Date(card.dueDate).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-3 py-2 font-medium">{card.title}</td>
                  <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate">
                    {card.description ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="secondary" className={`gap-1 ${status.color}`}>
                      <StatusIcon className="h-3 w-3" />{status.label}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    {priority ? (
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${priority.color}`}>
                        {priority.label}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Link2 className="h-3 w-3" />0
                    </span>
                  </td>
                </tr>
              );
            })}
            {allCards.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Aucune tâche</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**Step 2: Create TableauView container**

```typescript
// tableau-view.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import type { IBoardDto } from "@/application/dto/board/common-board.dto";
import { TableauBoard } from "./tableau-board";

export function TableauView() {
  const [boards, setBoards] = useState<IBoardDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBoards = useCallback(async () => {
    try {
      const [todoRes, kanbanRes] = await Promise.all([
        fetch("/api/v1/boards?type=todo"),
        fetch("/api/v1/boards?type=kanban"),
      ]);
      const todoData = todoRes.ok ? await todoRes.json() : { boards: [] };
      const kanbanData = kanbanRes.ok ? await kanbanRes.json() : { boards: [] };
      setBoards([...todoData.boards, ...kanbanData.boards]);
    } catch {
      setBoards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBoards(); }, [fetchBoards]);

  if (loading) {
    return <div className="flex justify-center p-8"><p className="text-sm text-muted-foreground">Chargement...</p></div>;
  }

  if (boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-orange-200 p-12 text-center">
        <p className="text-muted-foreground">Aucun board. Créez des to-do lists ou des kanbans pour les voir ici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {boards.map((board) => (
        <TableauBoard key={board.id} board={board} onDeleteBoard={fetchBoards} />
      ))}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add apps/nextjs/app/(protected)/organization/_components/tableau-view.tsx apps/nextjs/app/(protected)/organization/_components/tableau-board.tsx
git commit -m "feat: add Tableau (table) view for organization"
```

---

## Task 7: Gantt Chart — Chronologie View

**Files:**
- Create: `apps/nextjs/app/(protected)/organization/_components/gantt-view.tsx`
- Create: `apps/nextjs/app/(protected)/organization/_components/gantt-chart.tsx`

**Step 1: Create GanttChart component**

Renders a horizontal Gantt chart. X-axis = time periods, Y-axis = tasks. Tasks shown as colored bars.

```typescript
// gantt-chart.tsx
"use client";

import { useMemo } from "react";
import type { IChronologyCardDto } from "@/application/dto/board/get-chronology.dto";

interface GanttChartProps {
  cards: IChronologyCardDto[];
  viewMode: "weeks" | "months";
}

const COLORS = [
  "bg-pink-400",
  "bg-orange-400",
  "bg-green-400",
  "bg-blue-400",
  "bg-purple-400",
  "bg-yellow-400",
];

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  return Math.ceil((date.getDate() + start.getDay()) / 7);
}

export function GanttChart({ cards, viewMode }: GanttChartProps) {
  const { columns, rows } = useMemo(() => {
    if (viewMode === "weeks") {
      const cols = ["Tâche", "Semaine 1", "Semaine 2", "Semaine 3", "Semaine 4"];
      const taskRows = cards.map((card, i) => ({
        id: card.id,
        title: card.title,
        color: COLORS[i % COLORS.length],
        column: card.dueDate ? getWeekNumber(new Date(card.dueDate)) : 1,
        span: 1,
      }));
      return { columns: cols, rows: taskRows };
    }

    const cols = ["Tâche", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin"];
    const taskRows = cards.map((card, i) => ({
      id: card.id,
      title: card.title,
      color: COLORS[i % COLORS.length],
      column: card.dueDate ? new Date(card.dueDate).getMonth() + 1 : 1,
      span: 1,
    }));
    return { columns: cols, rows: taskRows };
  }, [cards, viewMode]);

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-orange-200 p-8">
        <p className="text-sm text-muted-foreground">
          Ajoutez des dates à vos tâches pour les voir sur la timeline.
        </p>
      </div>
    );
  }

  const dataColCount = columns.length - 1;

  return (
    <div className="overflow-x-auto rounded-lg border border-orange-100">
      <div className="min-w-[600px]">
        {/* Header */}
        <div className="grid border-b border-orange-100 bg-orange-50/50" style={{ gridTemplateColumns: `140px repeat(${dataColCount}, 1fr)` }}>
          {columns.map((col) => (
            <div key={col} className="px-3 py-2 text-xs font-medium text-muted-foreground">
              {col}
            </div>
          ))}
        </div>
        {/* Rows */}
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid border-b border-orange-50 last:border-0"
            style={{ gridTemplateColumns: `140px repeat(${dataColCount}, 1fr)` }}
          >
            <div className="px-3 py-3 text-sm font-medium truncate">{row.title}</div>
            {Array.from({ length: dataColCount }, (_, i) => (
              <div key={`${row.id}-${i}`} className="px-1 py-3">
                {row.column === i + 1 && (
                  <div className={`h-6 rounded-full ${row.color}`} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Create GanttView container**

```typescript
// gantt-view.tsx
"use client";

import { Button } from "@packages/ui/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import type { IGetChronologyOutputDto } from "@/application/dto/board/get-chronology.dto";
import { GanttChart } from "./gantt-chart";

function formatMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function GanttView() {
  const [data, setData] = useState<IGetChronologyOutputDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"weeks" | "months">("weeks");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchData = useCallback(async (month: Date) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/boards/chronology?month=${formatMonth(month)}`);
      if (response.ok) {
        setData(await response.json());
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(currentMonth); }, [fetchData, currentMonth]);

  if (loading) {
    return <div className="flex justify-center p-8"><p className="text-sm text-muted-foreground">Chargement...</p></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "weeks" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("weeks")}
          >
            Semaines
          </Button>
          <Button
            variant={viewMode === "months" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("months")}
          >
            Mois
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const prev = new Date(currentMonth);
            prev.setMonth(prev.getMonth() - 1);
            setCurrentMonth(prev);
          }}>
            &lt;
          </Button>
          <span className="text-sm font-medium">
            {currentMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </span>
          <Button variant="outline" size="sm" onClick={() => {
            const next = new Date(currentMonth);
            next.setMonth(next.getMonth() + 1);
            setCurrentMonth(next);
          }}>
            &gt;
          </Button>
        </div>
      </div>
      <GanttChart cards={data?.cards ?? []} viewMode={viewMode} />
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add apps/nextjs/app/(protected)/organization/_components/gantt-view.tsx apps/nextjs/app/(protected)/organization/_components/gantt-chart.tsx
git commit -m "feat: add Gantt timeline view for chronologie"
```

---

## Task 8: Calendar View — Monthly Calendar with Events

**Files:**
- Create: `apps/nextjs/app/(protected)/organization/_components/calendar-view.tsx`
- Create: `apps/nextjs/app/(protected)/organization/_components/calendar-grid.tsx`

**Step 1: Create CalendarGrid component**

Full monthly calendar grid showing events directly on date cells.

```typescript
// calendar-grid.tsx
"use client";

import { useMemo } from "react";
import type { IChronologyCardDto } from "@/application/dto/board/get-chronology.dto";

interface CalendarGridProps {
  month: Date;
  cards: IChronologyCardDto[];
}

const COLORS = [
  "bg-pink-300",
  "bg-green-300",
  "bg-orange-300",
  "bg-blue-300",
  "bg-purple-300",
];

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  events: Array<{ id: string; title: string; color: string }>;
}

export function CalendarGrid({ month, cards }: CalendarGridProps) {
  const days = useMemo((): CalendarDay[] => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstDay = new Date(year, m, 1);
    const lastDay = new Date(year, m + 1, 0);

    // Monday-based offset
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const result: CalendarDay[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, m, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      result.push({ date: prevMonthLastDay - i, isCurrentMonth: false, events: [] });
    }

    // Build card-by-date map
    const cardsByDate = new Map<number, Array<{ id: string; title: string; color: string }>>();
    for (const card of cards) {
      if (!card.dueDate) continue;
      const d = new Date(card.dueDate);
      if (d.getMonth() === m && d.getFullYear() === year) {
        const day = d.getDate();
        if (!cardsByDate.has(day)) cardsByDate.set(day, []);
        const arr = cardsByDate.get(day)!;
        arr.push({
          id: card.id,
          title: card.title,
          color: COLORS[arr.length % COLORS.length] ?? COLORS[0]!,
        });
      }
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      result.push({
        date: d,
        isCurrentMonth: true,
        events: cardsByDate.get(d) ?? [],
      });
    }

    // Next month days (fill to complete grid)
    const remaining = 7 - (result.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        result.push({ date: i, isCurrentMonth: false, events: [] });
      }
    }

    return result;
  }, [month, cards]);

  return (
    <div className="rounded-lg border border-orange-100 overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-orange-100 bg-orange-50/50">
        {DAY_NAMES.map((name) => (
          <div key={name} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
            {name}
          </div>
        ))}
      </div>
      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => (
          <div
            key={`day-${i}`}
            className={`min-h-[100px] border-b border-r border-orange-50 p-2 ${
              day.isCurrentMonth ? "bg-white" : "bg-gray-50/50"
            }`}
          >
            <span className={`text-sm ${day.isCurrentMonth ? "font-medium" : "text-muted-foreground"}`}>
              {day.date}
            </span>
            <div className="mt-1 space-y-0.5">
              {day.events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className={`${event.color} rounded px-1.5 py-0.5 text-xs font-medium text-white truncate`}
                >
                  {event.title}
                </div>
              ))}
              {day.events.length > 3 && (
                <span className="text-xs text-muted-foreground">+{day.events.length - 3}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Create CalendarView container**

```typescript
// calendar-view.tsx
"use client";

import { Button } from "@packages/ui/components/ui/button";
import { FolderSync } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { IGetChronologyOutputDto } from "@/application/dto/board/get-chronology.dto";
import { CalendarGrid } from "./calendar-grid";

function formatMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function CalendarView() {
  const [data, setData] = useState<IGetChronologyOutputDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchData = useCallback(async (month: Date) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/boards/chronology?month=${formatMonth(month)}`);
      if (response.ok) {
        setData(await response.json());
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(currentMonth); }, [fetchData, currentMonth]);

  const monthLabel = currentMonth.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold capitalize">{monthLabel}</h3>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-1.5">
            <FolderSync className="h-4 w-4" />
            Lier un calendrier externe
          </Button>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => {
              const prev = new Date(currentMonth);
              prev.setMonth(prev.getMonth() - 1);
              setCurrentMonth(prev);
            }}>
              &lt;
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const next = new Date(currentMonth);
              next.setMonth(next.getMonth() + 1);
              setCurrentMonth(next);
            }}>
              &gt;
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      ) : (
        <CalendarGrid month={currentMonth} cards={data?.cards ?? []} />
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add apps/nextjs/app/(protected)/organization/_components/calendar-view.tsx apps/nextjs/app/(protected)/organization/_components/calendar-grid.tsx
git commit -m "feat: add monthly calendar view with events"
```

---

## Task 9: Badges Section

**Files:**
- Create: `apps/nextjs/app/(protected)/organization/_components/badges-section.tsx`

**Step 1: Create the badges component**

```typescript
// badges-section.tsx
"use client";

const BADGES = [
  { id: "7-days", label: "7 Jours", color: "bg-orange-400", textColor: "text-orange-400" },
  { id: "14-days", label: "14 Jours", color: "bg-pink-400", textColor: "text-pink-400" },
  { id: "1-month", label: "1 Mois", color: "bg-green-400", textColor: "text-green-400" },
];

export function BadgesSection() {
  return (
    <div>
      <h3 className="text-lg font-semibold">Badges</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Tous les badges que tu as obtenu en ayant une bonne organisation
      </p>
      <div className="mt-4 flex gap-4">
        {BADGES.map((badge) => (
          <div
            key={badge.id}
            className={`flex h-24 w-24 items-center justify-center rounded-2xl ${badge.color} text-white`}
          >
            <span className="text-2xl font-bold">{badge.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/nextjs/app/(protected)/organization/_components/badges-section.tsx
git commit -m "feat: add badges section component"
```

---

## Task 10: Main Dashboard — Orchestrator with DnD Sections

**Files:**
- Create: `apps/nextjs/app/(protected)/organization/_components/organisation-dashboard.tsx`

**Step 1: Create the main dashboard orchestrator**

This component pulls everything together: fetches layout config, renders sections in order with drag & drop reordering, handles collapse state.

```typescript
// organisation-dashboard.tsx
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
} from "@/(protected)/_hooks/use-dashboard-layout";
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

const DEFAULT_ORDER = ["todo-kanban", "tableau", "chronologie", "calendrier", "badges"];

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
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
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
        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
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
```

**Step 2: Commit**

```bash
git add apps/nextjs/app/(protected)/organization/_components/organisation-dashboard.tsx
git commit -m "feat: add OrganisationDashboard orchestrator with DnD sections"
```

---

## Task 11: Rewrite page.tsx + Polish Todo & Kanban Views

**Files:**
- Modify: `apps/nextjs/app/(protected)/organization/page.tsx`
- Modify: `apps/nextjs/app/(protected)/organization/_components/todo-list-view.tsx`
- Modify: `apps/nextjs/app/(protected)/organization/_components/kanban-list-view.tsx`

**Step 1: Rewrite page.tsx**

Replace the entire file — it becomes a thin server component wrapping the client dashboard.

```typescript
// page.tsx
import { OrganisationDashboard } from "./_components/organisation-dashboard";

export default function OrganizationPage() {
  return <OrganisationDashboard />;
}
```

Note: Auth is already handled in `layout.tsx` via `requireAuth()`.

**Step 2: Polish TodoListView**

Remove the max-width constraint. Adjust to fit as a sidebar panel. Remove the outer header — the section wrapper provides it. Adjust the "New List" button to be a full-width "+ Ajouter une Nouvelle To do list" button at the bottom.

Key changes:
- Remove outer `<div className="mx-auto max-w-2xl">` wrapper from page.tsx (already done)
- Change "New List" button to match Figma: full-width at bottom
- Remove "New List" top-right button
- Tweak visual style (rounded-2xl, orange-100 borders)

**Step 3: Polish KanbanListView**

- Remove grid selection view — directly show the first board's kanban
- If multiple boards, add a dropdown/selector at the top
- The back button and board title should integrate naturally into the section
- Match Figma column header styles (icon + label + count)

**Step 4: Run checks**

Run: `pnpm fix && pnpm type-check && pnpm check`

**Step 5: Commit**

```bash
git add apps/nextjs/app/(protected)/organization/
git commit -m "feat: rewrite organization page as dashboard layout"
```

---

## Task 12: Cleanup — Remove Old Chronology Components

**Files:**
- Delete: `apps/nextjs/app/(protected)/organization/_components/chronology-view.tsx`
- Delete: `apps/nextjs/app/(protected)/organization/_components/chronology-calendar.tsx`
- Delete: `apps/nextjs/app/(protected)/organization/_components/chronology-event-list.tsx`
- Delete: `apps/nextjs/app/(protected)/organization/_components/chronology-card-detail.tsx`

**Step 1: Delete old files**

```bash
rm apps/nextjs/app/(protected)/organization/_components/chronology-view.tsx
rm apps/nextjs/app/(protected)/organization/_components/chronology-calendar.tsx
rm apps/nextjs/app/(protected)/organization/_components/chronology-event-list.tsx
rm apps/nextjs/app/(protected)/organization/_components/chronology-card-detail.tsx
```

**Step 2: Verify no imports remain**

Run: `grep -r "chronology-" apps/nextjs/app/(protected)/organization/` — should return nothing.

**Step 3: Run full checks**

Run: `pnpm fix && pnpm type-check && pnpm check`

**Step 4: Commit**

```bash
git add -A apps/nextjs/app/(protected)/organization/
git commit -m "chore: remove old chronology components"
```

---

## Task 13: Final Verification + Visual Polish

**Step 1: Run full quality checks**

```bash
pnpm fix
pnpm type-check
pnpm check
pnpm test
```

**Step 2: Manual test in browser**

1. Navigate to `/organization`
2. Verify tab navigation scrolls to sections
3. Verify To-do + Kanban side by side
4. Verify Tableau shows table view
5. Verify Chronologie shows Gantt chart
6. Verify Calendrier shows monthly calendar
7. Verify Badges section
8. Verify drag & drop reordering of sections
9. Verify collapse/expand of sections
10. Refresh page — verify layout persists

**Step 3: Fix any remaining issues**

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete organization dashboard with all views"
```
