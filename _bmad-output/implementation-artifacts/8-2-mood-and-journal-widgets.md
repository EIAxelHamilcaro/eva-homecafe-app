# Story 8.2: Mood & Journal Widgets

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want mood summary and journal quick-compose widgets on my dashboard,
so that I can check in and write without navigating away.

## Acceptance Criteria

1. **Given** an authenticated user with mood entries **When** the mood summary widget loads **Then** it displays the weekly mood chart and current trend indicator (FR61)

2. **Given** an authenticated user with no mood entries **When** the mood widget loads **Then** it shows an empty state prompting a first mood check-in

3. **Given** an authenticated user on the dashboard **When** they use the journal quick-compose widget **Then** they can write a quick private post (journal entry) directly from the dashboard (FR67) **And** on submit, the post is created as private

## Tasks / Subtasks

- [x] Task 1: Fix and Enhance Mood Widget (AC: #1, #2)
  - [x] 1.1 **BUG FIX**: Remove `"use client"` directive from `mood-widget.tsx` — it currently has both `"use client"` AND `async function` with server-side query imports (`getMoodStats`, `getTodayMood`). This is invalid: async components must be Server Components. Remove the directive to make it a proper async Server Component.
  - [x] 1.2 Create `dashboard/_components/mood-mini-chart.tsx` — Client Component that receives `categoryDistribution` data as props and renders a horizontal bar chart via recharts `ChartContainer` + `BarChart` (same pattern as `mood/_components/mood-bar-chart.tsx` but compact)
  - [x] 1.3 Add trend indicator to `mood-widget.tsx` — display dominant mood with color dot + average intensity + total entries as concise trend summary (e.g., colored dot + "Bonheur · 7.2/10 avg · 5 entries")
  - [x] 1.4 Keep today's mood display at top of widget (emoji + category + intensity)
  - [x] 1.5 Verify empty state works when `stats.totalEntries === 0` (AC #2)

- [x] Task 2: Verify Journal Widget Compliance (AC: #3)
  - [x] 2.1 Verify `journal-widget.tsx` creates a private post on submit (`isPrivate: true`)
  - [x] 2.2 Verify error/success feedback works — already implemented in story 8.1
  - [x] 2.3 No code changes expected — journal widget already meets AC #3

- [x] Task 3: Quality Checks (AC: all)
  - [x] 3.1 Run `pnpm fix` — auto-fix formatting (1 file fixed)
  - [x] 3.2 Run `pnpm type-check` — 0 TypeScript errors
  - [x] 3.3 Run `pnpm test` — 349 tests pass across 41 files
  - [x] 3.4 Run `pnpm check` — 0 new Biome errors (49 pre-existing warnings only)

## Dev Notes

### This is a UI Enhancement Story — No Domain/Application Changes

Story 8.1 already created all 8 dashboard widgets. This story enhances the mood widget with a proper recharts chart + trend indicator, and verifies the journal widget meets AC #3. No new aggregates, use cases, DTOs, repositories, DI modules, or tests needed.

### Critical Bug Fix: mood-widget.tsx Has Invalid "use client" + async

The current `mood-widget.tsx` has `"use client"` at the top AND is an `async function` that calls server-only queries (`getMoodStats`, `getTodayMood` from Drizzle ORM). This is invalid — async components must be Server Components, and Drizzle queries cannot run on the client.

**Fix:** Remove the `"use client"` directive. The widget is already wrapped in `<Suspense>` on the dashboard page, so it works correctly as an async Server Component. Extract the recharts chart into a separate Client sub-component (`mood-mini-chart.tsx`) since recharts requires client-side rendering.

### Mood Widget Architecture

```
MoodWidget (async Server Component — NO "use client")
  ├─ Fetches data: getMoodStats(userId, "week") + getTodayMood(userId)
  ├─ Today's mood: emoji + category + intensity/10
  ├─ Trend indicator: color dot + dominant mood label + avg intensity + entry count
  └─ <MoodMiniChart data={categoryDistribution} />  (Client Component — "use client")
       └─ recharts BarChart via ChartContainer (horizontal, compact)
```

### Mood Mini Chart Implementation Pattern

Follow the exact pattern from `app/(protected)/mood/_components/mood-bar-chart.tsx` but compact for widget size:

```typescript
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@packages/ui/components/ui/chart";

interface MoodMiniChartProps {
  data: Array<{ category: string; count: number; percentage: number }>;
}

const chartConfig = {
  count: { label: "Count" },
} satisfies ChartConfig;

export function MoodMiniChart({ data }: MoodMiniChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-32 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 0 }}>
        <CartesianGrid horizontal={false} />
        <YAxis dataKey="category" type="category" width={75} tickLine={false} axisLine={false} />
        <XAxis type="number" hide />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
```

**Key differences from full mood-bar-chart:**
- Height: `h-32` (compact) instead of `h-64`
- No footer stats (the trend indicator handles that)
- Simpler margins
- Data passed as props (not fetched inside)

### Mood Colors — Reuse Existing Helper

Import `getMoodColor` from the mood legend component:

```typescript
import { getMoodColor, getMoodLabel } from "@/app/(protected)/mood/_components/mood-legend";
```

Mood categories and their colors:
| Category | Label | Color |
|----------|-------|-------|
| calme | Calme | #8EC8F0 |
| enervement | Énervement | #F28C82 |
| excitation | Excitation | #FFD166 |
| anxiete | Anxiété | #B794C0 |
| tristesse | Tristesse | #7BA7BC |
| bonheur | Bonheur | #81C784 |
| ennui | Ennui | #BDBDBD |
| nervosite | Nervosité | #FF8A65 |
| productivite | Productivité | #4DB6AC |

Apply colors per bar using the `fill` prop mapped from `getMoodColor(category)`.

### Query Return Types

**`getMoodStats(userId, "week")`** returns:
```typescript
{
  categoryDistribution: Array<{ category: string; count: number; percentage: number }>;
  averageIntensity: number;    // Rounded to 1 decimal
  totalEntries: number;
  dominantMood: string | null; // Most common category
}
```

**`getTodayMood(userId)`** returns:
```typescript
{
  id: string;
  category: string;
  intensity: number;
  createdAt: string;
} | null
```

### Journal Widget — Already Complete

The journal widget (`journal-widget.tsx`) already fully implements AC #3:
- `"use client"` Client Component with form interactivity
- Textarea for content entry
- Submit POSTs to `/api/v1/posts` with `{ content, isPrivate: true }`
- CreatePost input DTO expects: `{ content: string, isPrivate: boolean, images?: string[], userId: string }` — the `userId` is extracted by the controller from the auth session, not sent by the client
- Success: clears textarea, shows "Saved as journal entry!" for 3 seconds
- Error: displays API error message or "Network error" fallback
- Loading: button shows "Saving...", disabled during submission

**No changes needed** — verify manually only.

### Existing Code to Reuse (DO NOT Recreate)

| What | File | Usage |
|------|------|-------|
| Mood stats query | `src/adapters/queries/mood-stats.query.ts` | getMoodStats(userId, "week") |
| Today mood query | `src/adapters/queries/today-mood.query.ts` | getTodayMood(userId) |
| Chart component | `packages/ui/src/components/ui/chart.tsx` | ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig |
| Mood colors/labels | `app/(protected)/mood/_components/mood-legend.tsx` | getMoodColor(), getMoodLabel() |
| Mood bar chart reference | `app/(protected)/mood/_components/mood-bar-chart.tsx` | Pattern reference for recharts usage |
| Card component | `packages/ui/src/components/ui/card.tsx` | Card, CardHeader, CardTitle, CardContent |
| Widget empty state | `dashboard/_components/widget-empty-state.tsx` | WidgetEmptyState type="mood" |

### Import Paths

```typescript
// Chart (shadcn wrapper)
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@packages/ui/components/ui/chart";

// Recharts (direct)
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

// Queries (server-side only)
import { getMoodStats } from "@/adapters/queries/mood-stats.query";
import { getTodayMood } from "@/adapters/queries/today-mood.query";

// Mood helpers
import { getMoodColor, getMoodLabel } from "@/app/(protected)/mood/_components/mood-legend";

// UI
import { Card, CardHeader, CardTitle, CardContent } from "@packages/ui/components/ui/card";
```

### File Structure

```
# Files to MODIFY
apps/nextjs/app/(protected)/dashboard/_components/mood-widget.tsx  # Remove "use client", add chart + trend

# Files to CREATE
apps/nextjs/app/(protected)/dashboard/_components/mood-mini-chart.tsx  # Client Component for recharts

# Files UNCHANGED (verify only)
apps/nextjs/app/(protected)/dashboard/_components/journal-widget.tsx
apps/nextjs/app/(protected)/dashboard/page.tsx
```

### No DI Changes Required

All data comes from existing CQRS queries called directly. No new DI symbols, modules, or bindings.

### No New Tests Required

Pure UI enhancement. Existing queries are tested via their respective stories. Manual testing checklist covers all acceptance criteria.

### Testing Strategy

**Manual testing checklist:**
1. Visit `/dashboard` as authenticated user with mood entries → mood widget shows today's mood, weekly chart, and trend indicator
2. Visit `/dashboard` as user with NO mood entries → mood widget shows empty state with CTA to record mood
3. Mood mini chart renders horizontal bars with correct colors per category
4. Trend indicator displays dominant mood label with color dot + average intensity
5. Journal widget → type text, submit → private post created (check via journal page)
6. Journal widget → submit empty → button disabled, no submission
7. Journal widget → network error → error message displayed
8. Journal widget → success → textarea clears, "Saved as journal entry!" message shown

### Critical Anti-Patterns to Avoid

1. **Do NOT add `"use client"` to mood-widget.tsx** — it must be an async Server Component calling queries directly
2. **Do NOT fetch data client-side in mood-widget.tsx** — use server-side query imports, NOT useEffect + fetch
3. **Do NOT recreate the mood bar chart from scratch** — reuse the pattern from `mood/_components/mood-bar-chart.tsx`
4. **Do NOT create new queries or use cases** — all data sources already exist
5. **Do NOT modify journal-widget.tsx** — it already meets AC #3
6. **Do NOT add barrel index.ts files**
7. **Do NOT add comments** — self-documenting code

### Golden Reference Files

| Purpose | Source File | Adaptation |
|---------|------------|------------|
| Recharts bar chart pattern | `app/(protected)/mood/_components/mood-bar-chart.tsx` | Compact version as mood-mini-chart.tsx |
| Chart component API | `packages/ui/src/components/ui/chart.tsx` | ChartContainer + config |
| Mood color mapping | `app/(protected)/mood/_components/mood-legend.tsx` | getMoodColor() + getMoodLabel() |
| Server Component widget | `dashboard/_components/gallery-widget.tsx` | Pattern for async Server Component widget |
| Client Component widget | `dashboard/_components/journal-widget.tsx` | Pattern for "use client" widget |

### Project Structure Notes

- mood-mini-chart.tsx goes in `dashboard/_components/` (colocated with other widget components)
- Follows kebab-case naming convention
- No conflicts with existing structure

### Previous Story Intelligence (Story 8.1)

Key learnings from Story 8.1:
1. **Dashboard layout is done** — 8 widget slots in responsive grid with Suspense boundaries
2. **CQRS read pattern** — widgets call queries directly (no use cases for reads)
3. **WidgetEmptyState** is config-driven and handles all 8 types — reuse for mood empty state
4. **shadcn/ui imports** use `@packages/ui/components/ui/*` path
5. **Bug identified**: `mood-widget.tsx` has invalid `"use client"` + `async` combination — must fix
6. **Quality baseline**: 349 tests pass, 0 TypeScript errors, 0 Biome errors
7. **Biome formatting: spaces not tabs** — always run `pnpm fix` after writing files
8. **Code review fixes from 8.1**: `<img>` was replaced with `next/image`, error handling added to journal widget, calendar month filter added — all already done

### Git Intelligence

Recent commits:
- `d88b116` feat(nextjs): implement story 8.1 — dashboard layout and empty states with code review fixes
- `dee4a87` docs: complete epic 7 retrospective and mark epic as done
- `918513b` feat(nextjs): implement story 7.2 — browse sticker and badge collections with code review fixes

Files created in story 8.1 (relevant to this story):
- `dashboard/page.tsx` — dashboard page with 8 Suspense widgets
- `dashboard/_components/mood-widget.tsx` — to be MODIFIED
- `dashboard/_components/journal-widget.tsx` — verify only
- `dashboard/_components/widget-empty-state.tsx` — reuse
- `dashboard/_components/widget-skeleton.tsx` — unchanged

All quality checks pass on current main. 349 tests passing. Codebase is clean and stable.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 8.2: Mood & Journal Widgets]
- [Source: _bmad-output/planning-artifacts/architecture.md#Dashboard Widgets — Server Components with Suspense]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/implementation-artifacts/8-1-dashboard-layout-and-empty-states.md — previous story]
- [Source: apps/nextjs/app/(protected)/mood/_components/mood-bar-chart.tsx — recharts pattern]
- [Source: apps/nextjs/app/(protected)/mood/_components/mood-legend.tsx — mood colors/labels]
- [Source: apps/nextjs/src/adapters/queries/mood-stats.query.ts — getMoodStats return type]
- [Source: apps/nextjs/src/adapters/queries/today-mood.query.ts — getTodayMood return type]
- [Source: packages/ui/src/components/ui/chart.tsx — ChartContainer API]
- [Source: apps/nextjs/src/application/dto/post/create-post.dto.ts — CreatePost input schema]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — all quality checks passed on first attempt.

### Completion Notes List

- Fixed MOOD_EMOJI mapping: was using English keys (happy, sad, angry) that never matched the French categories (calme, bonheur, enervement). Replaced with MOOD_CONFIG using correct French category keys with proper labels, colors, and emojis.
- Created `mood-mini-chart.tsx` Client Component: compact horizontal bar chart (h-36) via recharts ChartContainer, receives pre-mapped data as props (category labels + fill colors).
- Enhanced mood-widget.tsx with trend indicator: colored dot + dominant mood label + average intensity + entry count.
- mood-widget.tsx confirmed as async Server Component (no "use client" directive) — queries called server-side via Promise.all().
- Journal widget verified: already fully implements AC #3 with isPrivate: true, error/success/loading handling. No changes needed.
- Quality: 0 TypeScript errors, 349/349 tests pass, 0 new Biome errors, 1 file formatted by pnpm fix.

### Code Review Fixes (AI)

- Extracted shared mood config into `mood-config.ts` (no "use client") to eliminate duplication between `mood-widget.tsx` MOOD_CONFIG and `mood-legend.tsx` MOOD_LEGEND. Updated 4 consumers.
- Added try/catch around `Promise.all([getMoodStats, getTodayMood])` in mood-widget.tsx — returns empty state on query failure instead of crashing dashboard.
- Quality post-review: 0 TypeScript errors, 349/349 tests pass, 2 files formatted by pnpm fix.

### File List

**New files (2):**
- `apps/nextjs/app/(protected)/dashboard/_components/mood-mini-chart.tsx`
- `apps/nextjs/app/(protected)/mood/_components/mood-config.ts`

**Modified files (4):**
- `apps/nextjs/app/(protected)/dashboard/_components/mood-widget.tsx`
- `apps/nextjs/app/(protected)/mood/_components/mood-legend.tsx`
- `apps/nextjs/app/(protected)/mood/_components/mood-bar-chart.tsx`
- `apps/nextjs/app/(protected)/mood/_components/mood-trend-chart.tsx`
- `apps/nextjs/app/(protected)/mood/_components/mood-week-view.tsx`

### Change Log

| Change | File | Reason |
|--------|------|--------|
| Fixed mood emoji mapping + added chart + trend | `mood-widget.tsx` | Task 1.1-1.4 — MOOD_CONFIG with correct French categories, MoodMiniChart integration, trend indicator with color dot |
| Created compact bar chart | `mood-mini-chart.tsx` | Task 1.2 — Client Component for recharts, receives data as props |
| Extracted shared mood config (review fix) | `mood-config.ts` | DRY — single source of truth for 9 mood categories with labels, colors, emojis, descriptions |
| Simplified to import from mood-config (review fix) | `mood-legend.tsx` | Removed duplicated MOOD_LEGEND data, now imports from mood-config |
| Updated import path (review fix) | `mood-bar-chart.tsx`, `mood-trend-chart.tsx`, `mood-week-view.tsx` | Import getMoodColor/getMoodLabel from mood-config instead of mood-legend |
| Added error handling (review fix) | `mood-widget.tsx` | try/catch around queries — graceful fallback to empty state on DB failure |
