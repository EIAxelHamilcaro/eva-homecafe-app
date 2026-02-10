# Story 8.4: Tasks & Calendar Widgets

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want task overview and calendar widgets on my dashboard,
so that I can see what needs to be done today and upcoming deadlines.

## Acceptance Criteria

1. **Given** an authenticated user with to-do items **When** the task overview widget loads **Then** it displays a quick view of pending to-do items with checkboxes (FR63)

2. **Given** an authenticated user with cards that have due dates **When** the calendar widget loads **Then** it displays a month view with colored event markers (FR66)

3. **Given** an authenticated user with no tasks or events **When** these widgets load **Then** they show contextual empty states

## Tasks / Subtasks

- [x] Task 1: Create Pending Tasks Query (AC: #1)
  - [x] 1.1 Create `src/adapters/queries/pending-tasks.query.ts` — direct Drizzle query that returns pending (not completed) cards across ALL the user's boards, regardless of dueDate. The existing `chronology.query.ts` only returns cards WITH dueDate in the current month — FR63 requires a "to-do list quick view" which includes items without due dates.
  - [x] 1.2 Query joins `card → board_column → board`, filters by `board.userId = userId` AND `card.isCompleted = false`, orders by `card.createdAt DESC`, limits to 5 items.
  - [x] 1.3 Return type: `IPendingTaskDto[]` — flat list with `id`, `title`, `isCompleted`, `dueDate` (nullable), `boardTitle`, `boardType`.

- [x] Task 2: Enhance Tasks Widget (AC: #1, #3)
  - [x] 2.1 Modify `dashboard/_components/tasks-widget.tsx` — replace `getChronology(userId)` with new `getPendingTasks(userId, 5)` query to show up to 5 pending items from ALL boards (todo AND kanban), not limited to cards with due dates.
  - [x] 2.2 Show visual checkbox indicators (empty square for pending) — keep as async Server Component (no interactivity, consistent with other widgets). Users click through to `/organization` for full interaction.
  - [x] 2.3 Display board name as subtle context label (e.g., "My Shopping List") below card title in muted text.
  - [x] 2.4 Show due date if present, with overdue highlighting (e.g., red text if dueDate < today).
  - [x] 2.5 Keep existing empty state via `<WidgetEmptyState type="tasks" />`.
  - [x] 2.6 Add try/catch for graceful error handling — fallback to empty state on query failure.

- [x] Task 3: Enhance Calendar Widget (AC: #2, #3)
  - [x] 3.1 Modify `dashboard/_components/calendar-widget.tsx` — add colored event markers per board type. Currently all events use `bg-primary/20`. Enhance to differentiate: todo items vs kanban items using distinct colors (e.g., `bg-blue-200` for todo, `bg-purple-200` for kanban), or completed vs pending (e.g., green vs blue).
  - [x] 3.2 Show event count tooltip on days with multiple events — display count badge on calendar day cells with >1 event.
  - [x] 3.3 Keep existing month grid layout, Su-Sa headers, and today highlight.
  - [x] 3.4 Add try/catch for graceful error handling — fallback to empty state on query failure.

- [x] Task 4: Quality Checks (AC: all)
  - [x] 4.1 Run `pnpm fix` — 0 new errors (49 pre-existing warnings)
  - [x] 4.2 Run `pnpm type-check` — 0 TypeScript errors
  - [x] 4.3 Run `pnpm test` — 360/360 tests pass across 42 files
  - [x] 4.4 Run `pnpm check` — 0 new Biome errors

## Dev Notes

### This is a UI Enhancement + 1 New Query Story

Story 8.1 already created both `tasks-widget.tsx` and `calendar-widget.tsx` with basic implementations. This story enhances them to fully meet the acceptance criteria. No new domain aggregates, use cases, or DI modules needed.

### Critical Issue: Tasks Widget Uses Wrong Query

The current `tasks-widget.tsx` calls `getChronology(userId)` which ONLY returns cards where `dueDate IS NOT NULL` AND within the current month's date range. This is wrong for FR63:

- A user with 10 todo items but NO due dates set sees **nothing** in the tasks widget
- A user with items due next month also sees **nothing**

FR63 specifies "Dashboard displays task overview widget (to-do list quick view)" — this needs ALL pending items, not just those with due dates in the current month.

### New Query: `pending-tasks.query.ts`

```typescript
import { board, boardColumn, card, db } from "@packages/drizzle";
import { desc, eq, and } from "drizzle-orm";

interface IPendingTaskDto {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string | null;
  boardTitle: string;
  boardType: "todo" | "kanban";
}

export async function getPendingTasks(
  userId: string,
  limit = 5,
): Promise<IPendingTaskDto[]> {
  const records = await db
    .select({
      id: card.id,
      title: card.title,
      isCompleted: card.isCompleted,
      dueDate: card.dueDate,
      boardTitle: board.title,
      boardType: board.type,
    })
    .from(card)
    .innerJoin(boardColumn, eq(card.columnId, boardColumn.id))
    .innerJoin(board, eq(boardColumn.boardId, board.id))
    .where(
      and(
        eq(board.userId, userId),
        eq(card.isCompleted, false),
      ),
    )
    .orderBy(desc(card.createdAt))
    .limit(limit);

  return records.map((r) => ({
    id: r.id,
    title: r.title,
    isCompleted: r.isCompleted,
    dueDate: r.dueDate,
    boardTitle: r.boardTitle,
    boardType: r.boardType,
  }));
}
```

Follow the exact Drizzle join pattern from `chronology.query.ts` (card → boardColumn → board). No pagination metadata needed for the widget (just fetches top N).

### Calendar Widget Enhancement: Colored Event Markers

The current calendar uses a single color (`bg-primary/20`) for ALL event days. To meet "colored event markers" (FR66), enhance the eventDates processing:

**Approach**: Add board type info to the eventDateSet so calendar can color-code:
- Days with only todo events: one color class (e.g., `bg-blue-200 dark:bg-blue-800/30`)
- Days with only kanban events: another color class (e.g., `bg-purple-200 dark:bg-purple-800/30`)
- Days with mixed events: a third/combined style (e.g., `bg-primary/20`)

The `getChronology()` already returns `boardType` per card. Process the `eventDates` map to track which board types have events on each day, then apply colors accordingly in the grid render.

### Existing Code to Reuse (DO NOT Recreate)

| What | File | Usage |
|------|------|-------|
| Tasks widget (base) | `dashboard/_components/tasks-widget.tsx` | MODIFY — replace query, add board context |
| Calendar widget (base) | `dashboard/_components/calendar-widget.tsx` | MODIFY — add colored markers, try/catch |
| Widget empty state | `dashboard/_components/widget-empty-state.tsx` | REUSE — already configured for "tasks" and "calendar" |
| Widget skeleton | `dashboard/_components/widget-skeleton.tsx` | REUSE — Suspense fallback |
| Chronology query | `src/adapters/queries/chronology.query.ts` | KEEP for calendar widget (correct for due-date cards) |
| Board schema | `packages/drizzle/src/schema/board.ts` | REFERENCE — board, board_column, card tables |
| Card component | `packages/ui/src/components/ui/card.tsx` | REUSE |
| Dashboard page | `dashboard/page.tsx` | UNCHANGED — already composes both widgets |
| DI container | `src/common/di/container.ts` | NOT NEEDED — CQRS reads only |

### Import Paths

```typescript
// New query (to create)
import { getPendingTasks } from "@/adapters/queries/pending-tasks.query";

// Existing (unchanged)
import { getChronology } from "@/adapters/queries/chronology.query";
import { Card, CardContent, CardHeader, CardTitle } from "@packages/ui/components/ui/card";
import { WidgetEmptyState } from "./widget-empty-state";
import Link from "next/link";
```

### File Structure

```
# Files to CREATE
apps/nextjs/src/adapters/queries/pending-tasks.query.ts    # New: pending cards across all boards

# Files to MODIFY
apps/nextjs/app/(protected)/dashboard/_components/tasks-widget.tsx     # Replace query, add board context + overdue
apps/nextjs/app/(protected)/dashboard/_components/calendar-widget.tsx  # Add colored markers, try/catch

# Files UNCHANGED (verify only)
apps/nextjs/app/(protected)/dashboard/_components/widget-empty-state.tsx
apps/nextjs/app/(protected)/dashboard/page.tsx
apps/nextjs/src/adapters/queries/chronology.query.ts
```

### No DI Changes Required

New query is a direct Drizzle call (CQRS read). The calendar widget continues using `getChronology()`. No new DI symbols or modules needed.

### No New Tests Required for Widget UI

Pure UI enhancement + 1 simple CQRS read query. No business logic to test. Existing board use case tests cover domain logic. Manual testing covers all acceptance criteria.

### Testing Strategy

**Manual testing checklist:**
1. Visit `/dashboard` as user with todo items (some with due dates, some without) -> tasks widget shows up to 5 pending items
2. Tasks widget shows items from both todo AND kanban boards
3. Tasks widget shows board name in muted text below card title
4. Tasks widget shows due date if present, with red text for overdue
5. Tasks widget shows visual checkbox (empty square) for each item
6. Visit `/dashboard` as user with NO boards/cards -> tasks widget shows empty state with "Create Task" CTA
7. Visit `/dashboard` as user with all tasks completed -> tasks widget shows "All tasks completed!" message
8. Visit `/dashboard` as user with cards that have due dates -> calendar widget shows month view
9. Calendar widget shows colored event markers (different colors for todo vs kanban)
10. Calendar widget highlights today with `ring-1 ring-primary`
11. Calendar widget shows event count summary below grid
12. Visit `/dashboard` as user with NO cards with due dates -> calendar widget shows empty state
13. All widgets load independently via Suspense (skeleton shown during load)
14. No TypeScript errors, all existing 360+ tests still pass

### Critical Anti-Patterns to Avoid

1. **Do NOT use `getChronology` for the tasks widget** — it only returns cards with due dates in the current month. Create `pending-tasks.query.ts` instead.
2. **Do NOT add `"use client"` to tasks-widget or calendar-widget** — they must remain async Server Components. Story 8.2 lesson: `"use client"` + `async` is invalid.
3. **Do NOT create new use cases or DI modules** — this is CQRS read + UI only.
4. **Do NOT create barrel index.ts files**.
5. **Do NOT add comments** — self-documenting code.
6. **Do NOT break existing tests** — no domain/application layer changes.
7. **Do NOT make checkboxes interactive** — keep as Server Component. The dashboard is a quick view; full interaction is at `/organization`.
8. **Do NOT remove existing `getChronology` usage from calendar-widget** — it correctly provides cards with due dates for the calendar view.

### Golden Reference Files

| Purpose | Source File | Adaptation |
|---------|------------|------------|
| New query join pattern | `src/adapters/queries/chronology.query.ts` | pending-tasks.query.ts (remove dueDate filter, remove month range) |
| Posts query pattern | `src/adapters/queries/user-posts.query.ts` | Simple Drizzle select + limit pattern |
| Tasks widget current impl | `dashboard/_components/tasks-widget.tsx` | Enhance with new query |
| Calendar widget current impl | `dashboard/_components/calendar-widget.tsx` | Add colored markers |
| Mood widget (Server Component) | `dashboard/_components/mood-widget.tsx` | async Server Component with try/catch |
| Posts widget (enhanced in 8.3) | `dashboard/_components/posts-widget.tsx` | Try/catch + type inference pattern |
| Board schema | `packages/drizzle/src/schema/board.ts` | Table columns for joins |

### Previous Story Intelligence (Stories 8.1 + 8.2 + 8.3)

Key learnings from previous dashboard stories:
1. **Dashboard layout is done** — 8 widget slots in responsive grid with Suspense boundaries, no layout changes needed
2. **Server Components pattern** — all widgets (except JournalWidget) are async Server Components calling queries directly
3. **Bug fix in 8.2**: `mood-widget.tsx` had invalid `"use client"` + `async` — do NOT add `"use client"` to widget Server Components
4. **Code review fix in 8.1**: `<img>` was replaced with `next/image` — use `Image` from `next/image` for any image display
5. **Code review fix in 8.2**: Extracted shared config to avoid duplication — extract any reusable utility to standalone file
6. **Error handling in 8.2 + 8.3**: Added try/catch around queries — ALL widgets MUST wrap data fetching in try/catch with empty state fallback
7. **Code review fix in 8.3**: `toPostDto` was extracted to shared export to eliminate duplication — if new query duplicates mapping logic from chronology.query.ts, import/export shared mapper
8. **CQRS pattern** — widgets call queries directly for reads, use cases via DI only when no query exists
9. **Quality baseline**: 360 tests pass (42 files), 0 TypeScript errors, 0 new Biome errors
10. **Biome formatting: spaces not tabs** — always run `pnpm fix` after writing files
11. **Type inference pattern from 8.3**: Use `Awaited<ReturnType<typeof queryFunction>>` for let declarations

### Git Intelligence

Recent commits:
- `bc7aaee` feat(nextjs): implement story 8.3 — posts and messaging widgets with code review fixes
- `25ae564` feat(nextjs): implement story 8.2 — mood and journal widgets with code review fixes
- `d88b116` feat(nextjs): implement story 8.1 — dashboard layout and empty states with code review fixes

Files created in stories 8.1-8.3 (relevant to this story):
- `dashboard/_components/tasks-widget.tsx` — to be MODIFIED (replace query)
- `dashboard/_components/calendar-widget.tsx` — to be MODIFIED (add colored markers)
- `dashboard/_components/widget-empty-state.tsx` — REUSE (already configured for "tasks" + "calendar")
- `dashboard/page.tsx` — UNCHANGED
- `src/adapters/queries/chronology.query.ts` — KEEP for calendar (reference for new query pattern)
- `src/adapters/queries/user-posts.query.ts` — REFERENCE for simple query pattern
- `src/adapters/queries/profile-names.query.ts` — REFERENCE for batch query pattern

All quality checks pass on current main. 360 tests passing. Codebase is clean and stable.

### DB Schema Reference

**board table**: `id`, `userId` (FK user.id), `title`, `type` ("todo" | "kanban"), `createdAt`, `updatedAt`
**board_column table**: `id`, `boardId` (FK board.id), `title`, `position`, `createdAt`
**card table**: `id`, `columnId` (FK board_column.id), `title`, `description`, `isCompleted` (bool), `position`, `progress` (int 0-100), `dueDate` (date, nullable, mode: "string" YYYY-MM-DD), `createdAt`, `updatedAt`

Relationships: user -> board (1:N) -> board_column (1:N) -> card (1:N). All cascade delete.

Indexes: `board_user_id_idx`, `board_column_board_id_position_idx`, `card_column_id_position_idx`

### Project Structure Notes

- New query file goes in `src/adapters/queries/` (flat, kebab-case) — matches `chronology.query.ts`, `journal.query.ts`, `gallery.query.ts`, etc.
- Widget modifications stay in `dashboard/_components/` — colocated with other widgets
- No new folders needed
- No conflicts with existing structure

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 8.4: Tasks & Calendar Widgets]
- [Source: _bmad-output/planning-artifacts/prd.md#FR63 — Dashboard task overview widget]
- [Source: _bmad-output/planning-artifacts/prd.md#FR66 — Dashboard calendar widget]
- [Source: _bmad-output/planning-artifacts/architecture.md#Dashboard Widgets — Server Components with Suspense]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture — Organization — Unified Board Model]
- [Source: _bmad-output/implementation-artifacts/8-3-posts-and-messaging-widgets.md — previous story]
- [Source: apps/nextjs/src/adapters/queries/chronology.query.ts — Drizzle join pattern reference]
- [Source: apps/nextjs/src/adapters/queries/user-posts.query.ts — simple query pattern]
- [Source: apps/nextjs/app/(protected)/dashboard/_components/tasks-widget.tsx — current implementation]
- [Source: apps/nextjs/app/(protected)/dashboard/_components/calendar-widget.tsx — current implementation]
- [Source: apps/nextjs/app/(protected)/dashboard/_components/widget-empty-state.tsx — empty state config]
- [Source: packages/drizzle/src/schema/board.ts — board/column/card table schema]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- No errors encountered during implementation.

### Completion Notes List

- Created `pending-tasks.query.ts`: lightweight Drizzle query returning ALL pending (not completed) cards across the user's boards, regardless of dueDate. Replaces `getChronology` which only returned cards with due dates in current month (violating FR63).
- Enhanced `tasks-widget.tsx`: replaced chronology query with pending-tasks query (5 items), added board name as context label below card title, added overdue highlighting (red text for past-due dates via `isOverdue` helper), added try/catch error handling.
- Enhanced `calendar-widget.tsx`: added colored event markers per board type (blue for todo, purple for kanban, primary for mixed), added event count badge on days with >1 event, added try/catch error handling, used `Awaited<ReturnType>` type inference pattern.
- Both widgets remain async Server Components (no "use client") — consistent with dashboard architecture.
- Quality: 0 TypeScript errors, 360/360 tests pass (42 files), 0 new Biome errors.

### Code Review Fixes

- **M1**: Fixed `isOverdue` timezone bug — replaced `new Date().toISOString().slice(0, 10)` (UTC) with local date formatting via `getLocalDateString()`.
- **M2**: Restored "All tasks completed!" congratulatory state — added `getTotalCardCount()` query to distinguish "no cards ever created" vs "all tasks done". Shows positive feedback when all tasks are completed.
- **L1**: Removed redundant `isCompleted` field from `IPendingTaskDto` — always `false` due to query filter.
- **L2**: Merged duplicate imports from `pending-tasks.query` into single import statement.
- **L3**: Fixed calendar badge overflow — capped displayed count at "9+" and added `min-w` + `px` for proper sizing.

### File List

**New files (1):**
- `apps/nextjs/src/adapters/queries/pending-tasks.query.ts`

**Modified files (2):**
- `apps/nextjs/app/(protected)/dashboard/_components/tasks-widget.tsx`
- `apps/nextjs/app/(protected)/dashboard/_components/calendar-widget.tsx`

### Change Log

| Change | File | Reason |
|--------|------|--------|
| Created pending tasks query | `pending-tasks.query.ts` | Task 1 — fetch ALL pending cards (not limited to cards with due dates) |
| Enhanced tasks widget | `tasks-widget.tsx` | Task 2 — new query, board name context, overdue highlighting, error handling |
| Enhanced calendar widget | `calendar-widget.tsx` | Task 3 — colored markers per board type, event count badge, error handling |
