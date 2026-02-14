# Moodboard Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the pin-based `/moodboard` page with a mood tracking dashboard featuring a year-long calendar grid (31 days × 12 months), mood slider, weekly/monthly charts, and badges.

**Architecture:** Server component page fetches year mood data and renders a 3-column layout. The center column has an interactive CSS grid calendar (client component) with inline popover for mood selection. The sidebar reuses existing dashboard/journal widgets (MoodboardWidget slider, SuiviWeeklyWidget, MoodWidget monthly chart, JournalBadges). Left sidebar shows date card and legend.

**Tech Stack:** Next.js 16 Server/Client Components, Tailwind CSS grid, shadcn/ui Popover, Recharts (reused), Drizzle ORM queries

**Figma reference:** https://www.figma.com/design/qGgfEcuAxoD7y6jimjlVU8/DashBox--copie-?node-id=584-8756

---

### Task 1: Create `getMoodYearCalendar` query

**Files:**
- Create: `apps/nextjs/src/adapters/queries/mood-year-calendar.query.ts`

**Step 1: Create the query file**

```typescript
// apps/nextjs/src/adapters/queries/mood-year-calendar.query.ts
import { db } from "@packages/drizzle";
import { moodEntry } from "@packages/drizzle/schema";
import { and, asc, eq, gte, lt } from "drizzle-orm";

export interface MoodYearEntry {
  date: string;
  category: string;
}

export async function getMoodYearCalendar(
  userId: string,
  year: number,
): Promise<MoodYearEntry[]> {
  const startDate = `${year}-01-01`;
  const endDate = `${year + 1}-01-01`;

  const records = await db
    .select({
      moodDate: moodEntry.moodDate,
      moodCategory: moodEntry.moodCategory,
    })
    .from(moodEntry)
    .where(
      and(
        eq(moodEntry.userId, userId),
        gte(moodEntry.moodDate, startDate),
        lt(moodEntry.moodDate, endDate),
      ),
    )
    .orderBy(asc(moodEntry.moodDate));

  return records.map((r) => ({
    date: r.moodDate,
    category: r.moodCategory,
  }));
}
```

**Step 2: Run type-check**

Run: `pnpm type-check`
Expected: PASS (no type errors related to mood-year-calendar)

**Step 3: Commit**

```bash
git add apps/nextjs/src/adapters/queries/mood-year-calendar.query.ts
git commit -m "feat(moodboard): add getMoodYearCalendar query"
```

---

### Task 2: Update `recordMoodAction` to revalidate `/moodboard`

**Files:**
- Modify: `apps/nextjs/src/adapters/actions/mood.actions.ts:39-40`

**Step 1: Add revalidation**

After the existing `revalidatePath("/dashboard")` line, add:

```typescript
revalidatePath("/moodboard");
```

**Step 2: Commit**

```bash
git add apps/nextjs/src/adapters/actions/mood.actions.ts
git commit -m "fix(mood): revalidate /moodboard path after mood recording"
```

---

### Task 3: Delete old moodboard components

**Files:**
- Delete: `apps/nextjs/app/(protected)/moodboard/_components/moodboard-client.tsx`
- Delete: `apps/nextjs/app/(protected)/moodboard/_components/moodboard-grid.tsx`
- Delete: `apps/nextjs/app/(protected)/moodboard/_components/moodboard-detail.tsx`
- Delete: `apps/nextjs/app/(protected)/moodboard/_components/create-moodboard-dialog.tsx`
- Delete: `apps/nextjs/app/(protected)/moodboard/_components/add-pin-dialog.tsx`
- Delete: `apps/nextjs/app/(protected)/moodboard/_components/delete-moodboard-dialog.tsx`

**Step 1: Delete all old component files**

```bash
rm apps/nextjs/app/(protected)/moodboard/_components/*.tsx
```

Keep `loading.tsx` and `error.tsx` at the route level (they're outside `_components/`).

**Step 2: Commit**

```bash
git add -A apps/nextjs/app/(protected)/moodboard/_components/
git commit -m "refactor(moodboard): remove old pin-based moodboard components"
```

---

### Task 4: Create `date-sticker-card.tsx`

**Files:**
- Create: `apps/nextjs/app/(protected)/moodboard/_components/date-sticker-card.tsx`

**Step 1: Create the component**

This is a server component showing today's date in a green rounded card, matching the Figma (shows month name + day number). Below is a decorative stickers area.

```tsx
// apps/nextjs/app/(protected)/moodboard/_components/date-sticker-card.tsx
const MONTH_NAMES = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export function DateStickerCard() {
  const now = new Date();
  const day = now.getDate();
  const month = MONTH_NAMES[now.getMonth()] ?? "";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl bg-homecafe-green/20">
        <span className="text-xs font-medium text-homecafe-green">{month}</span>
        <span className="text-3xl font-bold text-homecafe-green">{day}</span>
      </div>
    </div>
  );
}
```

**Step 2: Run pnpm fix**

Run: `pnpm fix`

---

### Task 5: Create `mood-legend-card.tsx`

**Files:**
- Create: `apps/nextjs/app/(protected)/moodboard/_components/mood-legend-card.tsx`

**Step 1: Create the component**

Reuses `MOOD_CATEGORIES` from the existing mood config. Shows a card with "Légende" title and 9 colored dots with labels.

```tsx
// apps/nextjs/app/(protected)/moodboard/_components/mood-legend-card.tsx
import { Card, CardContent } from "@packages/ui/components/ui/card";
import { MOOD_CATEGORIES } from "@/app/(protected)/mood/_components/mood-config";

export function MoodLegendCard() {
  return (
    <Card className="border-0">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold">Légende</h3>
        <p className="text-xs text-muted-foreground">Palette d&apos;humeurs</p>
        <div className="mt-3 space-y-2">
          {MOOD_CATEGORIES.map((mood) => (
            <div key={mood.value} className="flex items-center gap-2">
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: mood.color }}
              />
              <span className="text-xs font-medium">{mood.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Run pnpm fix**

Run: `pnpm fix`

---

### Task 6: Create `mood-cell-popover.tsx`

**Files:**
- Create: `apps/nextjs/app/(protected)/moodboard/_components/mood-cell-popover.tsx`

**Step 1: Create the component**

A popover anchored to a calendar cell. Shows 9 colored circles. On click, calls `recordMoodAction` and reports the selected category back to the parent via callback.

```tsx
// apps/nextjs/app/(protected)/moodboard/_components/mood-cell-popover.tsx
"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@packages/ui/components/ui/popover";
import { type ReactNode, useState } from "react";
import { recordMoodAction } from "@/adapters/actions/mood.actions";
import { MOOD_CATEGORIES } from "@/app/(protected)/mood/_components/mood-config";

interface MoodCellPopoverProps {
  date: string;
  children: ReactNode;
  onMoodSelected: (date: string, category: string) => void;
}

export function MoodCellPopover({
  date,
  children,
  onMoodSelected,
}: MoodCellPopoverProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSelect(category: string) {
    if (submitting) return;
    setSubmitting(true);
    onMoodSelected(date, category);
    setOpen(false);
    await recordMoodAction({ category, intensity: 5, moodDate: date });
    setSubmitting(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-2" side="right" align="center">
        <div className="grid grid-cols-3 gap-1.5">
          {MOOD_CATEGORIES.map((mood) => (
            <button
              key={mood.value}
              type="button"
              title={mood.label}
              disabled={submitting}
              onClick={() => handleSelect(mood.value)}
              className="h-7 w-7 rounded-full transition-transform hover:scale-110 disabled:opacity-50"
              style={{ backgroundColor: mood.color }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**Step 2: Run pnpm fix**

Run: `pnpm fix`

---

### Task 7: Create `mood-year-calendar.tsx`

**Files:**
- Create: `apps/nextjs/app/(protected)/moodboard/_components/mood-year-calendar.tsx`

**Step 1: Create the component**

The core component. CSS grid with 12 columns (months) × 31 rows (days). Each cell is a colored button. Invalid dates (e.g., Feb 30) are invisible. Clicking a cell opens a MoodCellPopover.

```tsx
// apps/nextjs/app/(protected)/moodboard/_components/mood-year-calendar.tsx
"use client";

import { useCallback, useState } from "react";
import { getMoodColor } from "@/app/(protected)/mood/_components/mood-config";
import type { MoodYearEntry } from "@/adapters/queries/mood-year-calendar.query";
import { MoodCellPopover } from "./mood-cell-popover";

interface MoodYearCalendarProps {
  year: number;
  initialData: MoodYearEntry[];
}

const MONTH_HEADERS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function MoodYearCalendar({ year, initialData }: MoodYearCalendarProps) {
  const [moodMap, setMoodMap] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>();
    for (const entry of initialData) {
      map.set(entry.date, entry.category);
    }
    return map;
  });

  const handleMoodSelected = useCallback(
    (date: string, category: string) => {
      setMoodMap((prev) => {
        const next = new Map(prev);
        next.set(date, category);
        return next;
      });
    },
    [],
  );

  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="w-full overflow-x-auto">
      {/* Month headers */}
      <div className="grid grid-cols-[2.5rem_repeat(12,1fr)] gap-px">
        <div />
        {MONTH_HEADERS.map((label, i) => (
          <div
            key={`header-${i}`}
            className="py-1 text-center text-xs font-semibold text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day rows */}
      {Array.from({ length: 31 }, (_, dayIdx) => {
        const day = dayIdx + 1;
        return (
          <div key={day} className="grid grid-cols-[2.5rem_repeat(12,1fr)] gap-px">
            <div className="flex items-center justify-end pr-2 text-xs font-medium text-muted-foreground">
              {day}
            </div>
            {Array.from({ length: 12 }, (_, monthIdx) => {
              const maxDays = daysInMonth(monthIdx, year);
              if (day > maxDays) {
                return <div key={monthIdx} />;
              }

              const dateStr = formatDate(year, monthIdx, day);
              const category = moodMap.get(dateStr);
              const isFuture = dateStr > todayStr;
              const isToday = dateStr === todayStr;
              const bgColor = category ? getMoodColor(category) : undefined;

              return (
                <MoodCellPopover
                  key={monthIdx}
                  date={dateStr}
                  onMoodSelected={handleMoodSelected}
                >
                  <button
                    type="button"
                    className={`aspect-square w-full rounded-sm border transition-colors ${
                      isToday
                        ? "ring-2 ring-homecafe-pink ring-offset-1"
                        : ""
                    } ${
                      category
                        ? "border-transparent"
                        : isFuture
                          ? "border-muted bg-muted/30"
                          : "border-muted-foreground/20 bg-muted/50 hover:bg-muted"
                    }`}
                    style={bgColor ? { backgroundColor: bgColor } : undefined}
                  >
                    {!category && !isFuture && (
                      <span className="text-[8px] text-muted-foreground/50">›</span>
                    )}
                  </button>
                </MoodCellPopover>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
```

**Step 2: Run pnpm fix**

Run: `pnpm fix`

---

### Task 8: Create `suivi-monthly-card.tsx`

**Files:**
- Create: `apps/nextjs/app/(protected)/moodboard/_components/suivi-monthly-card.tsx`

**Step 1: Create the component**

Server component wrapper that calls `getMoodTrends()` and renders the existing `MonthlyMoodChart`. Replicates the pattern from `MoodWidget` in the dashboard but as a standalone card for the moodboard sidebar.

```tsx
// apps/nextjs/app/(protected)/moodboard/_components/suivi-monthly-card.tsx
import { Card, CardContent } from "@packages/ui/components/ui/card";
import { getMoodTrends } from "@/adapters/queries/mood-trends.query";
import { MonthlyMoodChart } from "@/app/(protected)/dashboard/_components/monthly-mood-chart";

interface SuiviMonthlyCardProps {
  userId: string;
}

const MONTH_LABELS: Record<string, string> = {
  "01": "janvier",
  "02": "février",
  "03": "mars",
  "04": "avril",
  "05": "mai",
  "06": "juin",
  "07": "juillet",
  "08": "août",
  "09": "septembre",
  "10": "octobre",
  "11": "novembre",
  "12": "décembre",
};

export async function SuiviMonthlyCard({ userId }: SuiviMonthlyCardProps) {
  let months: Awaited<ReturnType<typeof getMoodTrends>>["months"] = [];
  try {
    const trends = await getMoodTrends(userId);
    months = trends.months;
  } catch {
    /* empty */
  }

  if (months.length === 0) {
    return (
      <Card className="border-0">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold">Suivi</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Pas encore de donnees mensuelles
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = months.map((m) => {
    const monthNum = m.month.split("-")[1] ?? "01";
    return {
      month: MONTH_LABELS[monthNum] ?? monthNum,
      average: m.averageIntensity,
    };
  });

  const first = months[0];
  const last = months[months.length - 1];
  const firstLabel = first
    ? (MONTH_LABELS[first.month.split("-")[1] ?? "01"] ?? "")
    : "";
  const lastLabel = last
    ? (MONTH_LABELS[last.month.split("-")[1] ?? "01"] ?? "")
    : "";
  const yearLabel = last?.month.split("-")[0] ?? new Date().getFullYear();

  return (
    <Card className="border-0">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold">Suivi</h3>
        <p className="text-sm text-muted-foreground">
          Moodboard {firstLabel} &rarr; {lastLabel} {yearLabel}
        </p>
        <div className="mt-4">
          <MonthlyMoodChart data={chartData} />
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Run pnpm fix**

Run: `pnpm fix`

---

### Task 9: Rewrite `page.tsx`

**Files:**
- Modify: `apps/nextjs/app/(protected)/moodboard/page.tsx` (full rewrite)

**Step 1: Rewrite page.tsx**

The server component fetches year mood data and renders the 3-column layout. Left: date + legend. Center: calendar. Right: sidebar widgets (all with Suspense).

```tsx
// apps/nextjs/app/(protected)/moodboard/page.tsx
import { Suspense } from "react";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { getMoodYearCalendar } from "@/adapters/queries/mood-year-calendar.query";
import { MoodboardWidgetServer } from "@/app/(protected)/dashboard/_components/moodboard-widget-server";
import { SuiviWeeklyWidget } from "@/app/(protected)/dashboard/_components/suivi-weekly-widget";
import { JournalBadges } from "@/app/(protected)/journal/_components/journal-badges";
import { Footer } from "@/app/(protected)/_components/footer";
import { DateStickerCard } from "./_components/date-sticker-card";
import { MoodLegendCard } from "./_components/mood-legend-card";
import { MoodYearCalendar } from "./_components/mood-year-calendar";
import { SuiviMonthlyCard } from "./_components/suivi-monthly-card";

function getLocalToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function WidgetSkeleton() {
  return <div className="h-48 animate-pulse rounded-xl bg-muted" />;
}

export default async function MoodboardPage() {
  const session = await requireAuth();
  const userId = session.user.id;
  const year = new Date().getFullYear();
  const today = getLocalToday();

  let yearData: Awaited<ReturnType<typeof getMoodYearCalendar>> = [];
  try {
    yearData = await getMoodYearCalendar(userId, year);
  } catch {
    /* empty */
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left sidebar */}
        <div className="flex w-full flex-col gap-4 lg:w-36">
          <DateStickerCard />
          <MoodLegendCard />
        </div>

        {/* Center — Calendar */}
        <div className="flex-1">
          <h1 className="text-xl font-bold">Que ressens-tu aujourd&apos;hui ?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Colore la case du jour pour un suivi des émotions poussé !
          </p>
          <div className="mt-4">
            <MoodYearCalendar year={year} initialData={yearData} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex w-full flex-col gap-4 lg:w-80">
          <Suspense fallback={<WidgetSkeleton />}>
            <MoodboardWidgetServer userId={userId} selectedDate={today} />
          </Suspense>
          <Suspense fallback={<WidgetSkeleton />}>
            <SuiviWeeklyWidget userId={userId} />
          </Suspense>
          <Suspense fallback={<WidgetSkeleton />}>
            <SuiviMonthlyCard userId={userId} />
          </Suspense>
          <Suspense fallback={<WidgetSkeleton />}>
            <JournalBadges userId={userId} />
          </Suspense>
        </div>
      </div>

      <div className="mt-8">
        <Footer />
      </div>
    </div>
  );
}
```

**Step 2: Run pnpm fix**

Run: `pnpm fix`

---

### Task 10: Verify build and lint

**Step 1: Run type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 2: Run Biome lint/format**

Run: `pnpm fix && pnpm check`
Expected: PASS (or only pre-existing warnings)

**Step 3: Run tests**

Run: `pnpm test`
Expected: All existing tests pass (no backend changes that would break tests)

---

### Task 11: Final commit

**Step 1: Stage and commit all new files**

```bash
git add apps/nextjs/app/(protected)/moodboard/ apps/nextjs/src/adapters/queries/mood-year-calendar.query.ts apps/nextjs/src/adapters/actions/mood.actions.ts
git commit -m "feat(moodboard): replace pin-based page with mood year calendar dashboard

- Add getMoodYearCalendar query for full-year mood data
- Create MoodYearCalendar grid component (31 days × 12 months CSS grid)
- Create MoodCellPopover for inline mood selection
- Add DateStickerCard, MoodLegendCard, SuiviMonthlyCard
- Reuse dashboard widgets: MoodboardWidget, SuiviWeeklyWidget, MonthlyMoodChart
- Reuse journal badges: JournalBadges
- Remove old pin-based moodboard components
- 3-column responsive layout matching Figma design"
```
