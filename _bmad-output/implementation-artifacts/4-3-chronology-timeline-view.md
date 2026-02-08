# Story 4.3: Chronology / Timeline View

Status: done

## Story

As a **user**,
I want to view my tasks and events on a calendar timeline,
so that I can see deadlines and plan my schedule visually.

## Acceptance Criteria

1. **Given** an authenticated user on the organization page **When** they select the "Chronology" view tab **Then** they see a calendar/timeline view showing all cards with due dates

2. **Given** cards with due dates across multiple boards **When** the user views the chronology **Then** events appear on the correct dates with color coding per board

3. **Given** an authenticated user **When** they tap/click an event on the timeline **Then** they see the card detail (title, description, progress, source board)

4. **Given** an authenticated user with no cards with due dates **When** they view the chronology **Then** they see an empty calendar with a prompt to add due dates to their tasks

5. **Given** the three view tabs (todo, kanban, chronology) **When** the user switches between them **Then** all views reflect the same underlying data (unified Board model)

## Tasks / Subtasks

- [x] Task 1: Create Chronology CQRS Query (AC: #1, #2)
  - [x] 1.1 Create `src/application/dto/board/get-chronology.dto.ts` (input + output Zod schemas)
  - [x] 1.2 Create `src/adapters/queries/chronology.query.ts` (JOIN card → boardColumn → board, filter by userId + dueDate IS NOT NULL, group by date)
  - [x] 1.3 Write tests `src/adapters/queries/__tests__/chronology.query.test.ts`

- [x] Task 2: Create Controller & API Route (AC: #1)
  - [x] 2.1 Add `getChronologyController` to `src/adapters/controllers/board/board.controller.ts`
  - [x] 2.2 Create `app/api/v1/boards/chronology/route.ts` (re-export GET)

- [x] Task 3: Install shadcn Calendar Component (AC: #1, #2)
  - [x] 3.1 Run `pnpm ui:add calendar` (installs react-day-picker based shadcn Calendar)
  - [x] 3.2 Verify react-day-picker is React 19 compatible (check peer deps)

- [x] Task 4: Build Chronology UI Components (AC: #1, #2, #3, #4)
  - [x] 4.1 Create `app/(protected)/organization/_components/chronology-view.tsx` (main container)
  - [x] 4.2 Create `app/(protected)/organization/_components/chronology-calendar.tsx` (shadcn Calendar with colored event dots per board)
  - [x] 4.3 Create `app/(protected)/organization/_components/chronology-event-list.tsx` (list of cards for selected date)
  - [x] 4.4 Create `app/(protected)/organization/_components/chronology-card-detail.tsx` (card detail popover/dialog)

- [x] Task 5: Enable Chronology Tab (AC: #5)
  - [x] 5.1 Update `app/(protected)/organization/page.tsx` — remove `disabled` from Chronology tab, render `<ChronologyView />`

- [x] Task 6: Quality Checks
  - [x] 6.1 Run `pnpm fix` — format
  - [x] 6.2 Run `pnpm type-check` — 0 new errors (also fixed pre-existing separator.tsx import)
  - [x] 6.3 Run `pnpm test` — 285 tests pass (6 new chronology tests)
  - [x] 6.4 Run `pnpm check` — no new errors in story 4.3 files

## Dev Notes

### Architecture: Chronology = Read-Only Calendar View on Unified Board Model

Story 4.3 is a **CQRS read** (query-only) on the existing Board/Column/Card data model. No new domain entities, aggregates, or use cases are needed. The chronology view queries cards with `dueDate` across ALL user boards (both todo and kanban types) and displays them on a calendar.

**Data Flow:**
```
Chronology Tab → fetch GET /api/v1/boards/chronology?month=2026-02
    → getChronologyController (auth + parse params)
    → getChronology() query (direct DB, no use case, no DI)
    → card INNER JOIN boardColumn INNER JOIN board WHERE userId + dueDate NOT NULL
    → group by dueDate → return ChronologyOutputDto
```

### CQRS Query Pattern (NOT Use Case)

This follows the **existing query pattern** established in journal, mood-stats, feed. Queries are:
- **NOT registered in DI** — called directly from controller
- **NOT returning Result<T>** — return DTO directly, error via try-catch in controller
- **Flat files** in `src/adapters/queries/chronology.query.ts`

**Reference queries to follow:**
- `src/adapters/queries/journal.query.ts` — pagination + date grouping in-memory (closest pattern)
- `src/adapters/queries/friend-feed.query.ts` — multi-table JOIN pattern
- `src/adapters/queries/mood-trends.query.ts` — date range filtering

### Database: Existing Schema Is Ready

No schema changes needed. The `card` table already has:
```sql
card.due_date  — date type, mode: "string" (YYYY-MM-DD), nullable
card.is_completed — boolean
card.progress — integer (0-100)
card.column_id → board_column.id → board.id → board.user_id
```

**Query joins:**
```
card INNER JOIN board_column ON card.column_id = board_column.id
     INNER JOIN board ON board_column.board_id = board.id
WHERE board.user_id = :userId AND card.due_date IS NOT NULL
```

### Chronology Query Design

**Input Parameters:**
- `userId` (from session — required)
- `month` (YYYY-MM format — optional, defaults to current month)
- `page` / `limit` (for paginated card list — optional)

**Output DTO:**
```typescript
interface IChronologyCardDto {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;           // YYYY-MM-DD
  isCompleted: boolean;
  progress: number;           // 0-100
  boardId: string;
  boardTitle: string;
  boardType: "todo" | "kanban";
  columnTitle: string;
}

interface IGetChronologyOutputDto {
  cards: IChronologyCardDto[];            // Flat list of all cards with dueDate for the month
  eventDates: Record<string, {            // Map of date → metadata for calendar dot rendering
    count: number;
    boards: { id: string; title: string }[];
  }>;
}
```

**Why flat list + eventDates map (not grouped):**
- Calendar component needs `eventDates` to render colored dots on dates
- Event list component filters by selected date client-side from the flat `cards` array
- One API call fetches the entire month — client handles date selection interactively
- Avoids pagination complexity for calendar views (typical month has <100 cards with dates)

### Calendar UI: shadcn Calendar + Custom Day Rendering

**Library:** shadcn `calendar` component (wraps react-day-picker v9)
- Already the standard in this project (shadcn/ui ecosystem)
- React 19 compatible
- Lightweight, no heavy calendar framework needed
- Customizable day cells via `components={{ Day: CustomDay }}` prop

**UI Layout (two-panel):**
```
┌──────────────────────────────────────────────┐
│  Chronology                                  │
├───────────────────┬──────────────────────────┤
│                   │                          │
│   Calendar Grid   │   Event List for         │
│   (month view)    │   Selected Date          │
│                   │                          │
│   Mon Tue Wed ... │   ┌─ Card 1 ──────────┐ │
│    1   2   3      │   │ Fix login bug      │ │
│    •       ••     │   │ Board: Sprint 3    │ │
│    8   9  10      │   │ Progress: 60%      │ │
│        •          │   └────────────────────┘ │
│   15  16  17      │   ┌─ Card 2 ──────────┐ │
│       ••  •       │   │ Design review      │ │
│                   │   │ Board: Design      │ │
│  ← Feb 2026 →    │   │ Progress: 0%       │ │
│                   │   └────────────────────┘ │
├───────────────────┴──────────────────────────┤
│  (colored dots = events per board)           │
└──────────────────────────────────────────────┘
```

**Calendar Day Cells:**
- Render colored dots below the date number
- Each dot color corresponds to a board (assign colors from a palette based on board index)
- Click on a date → update right panel with cards for that date
- Today highlighted, overdue dates in red/destructive

**Event List Panel:**
- Shows cards for the selected date
- Each card displays: title, board name + badge, progress bar (if > 0), completion status
- Click card → detail dialog/popover showing full info (description, column, board)

### Color Coding Per Board

Assign board colors from a predefined palette (Tailwind colors):
```typescript
const BOARD_COLORS = [
  "bg-blue-500",    // Board 1
  "bg-green-500",   // Board 2
  "bg-purple-500",  // Board 3
  "bg-orange-500",  // Board 4
  "bg-pink-500",    // Board 5
  "bg-teal-500",    // Board 6
];

function getBoardColor(boardIndex: number): string {
  return BOARD_COLORS[boardIndex % BOARD_COLORS.length];
}
```

Board-to-color mapping determined client-side from the unique board IDs in the response. Consistent for the session.

### Empty State (AC #4)

When no cards have due dates, show:
- Empty calendar (standard shadcn Calendar, no dots)
- Message: "No events on your timeline yet"
- CTA: "Add due dates to your tasks in Todo or Kanban views to see them here"
- Link/button navigating to Todo or Kanban tab

### Existing Components to Reuse

| What | Where | How |
|------|-------|-----|
| Tab structure | `organization/page.tsx` | Enable chronology tab, add `<ChronologyView />` |
| Auth guard | `organization/layout.tsx` | Already requires `requireAuth()` — no changes |
| Card detail rendering | `kanban-card.tsx` | Overdue detection logic, dueDate display, Progress bar |
| Card edit dialog | `card-edit-dialog.tsx` | Can reuse for viewing/editing card from chronology |
| Data fetch pattern | `todo-list-view.tsx` | `fetch("/api/v1/boards/chronology?month=YYYY-MM")` |
| Empty state pattern | `todo-list-view.tsx` | Card + text + CTA button pattern |
| API route pattern | `app/api/v1/journal/route.ts` | `export const GET = controller;` |

### shadcn/ui Components Needed

**Already installed:** Button, Card, Dialog, Tabs, Badge, Progress, Label, Separator

**Must install:**
- `calendar` — react-day-picker based Calendar component

**Verify at install time:** Check if `calendar` is already available. If popover + calendar were installed in 4.2 for the date picker in card-edit-dialog, they may already be present.

### No Domain Changes

This story does NOT modify:
- Board aggregate (no new methods)
- Card entity (no new properties)
- Column entity
- Any existing use cases
- Any existing DTOs
- DI container (no new symbols)
- Database schema (no migrations)

### No New DI Registrations

The chronology query is a CQRS read — called directly from the controller, not through DI. The only new controller function is added to the existing `board.controller.ts` file.

### Data Integrity Checklist (Epic 3 Retro)

- **N+1 possible?** No — single JOIN query fetches all data in one round trip
- **Race conditions?** No — read-only query, no writes
- **Performance?** Calendar shows one month at a time. Typical user has <50 cards with dates per month. No pagination needed for calendar dots; list panel can use client-side filtering.
- **Stale data?** Acceptable — calendar refreshes when tab is selected. No real-time requirement for task views.

### Security Checklist (Epic 2 Retro)

- Every endpoint requires `getAuthenticatedUser()` check
- Query filters by `board.userId = session.user.id` — users only see their own cards
- No cross-user data exposure possible
- All input validated with Zod safeParse (month format)

### What NOT to Build in Story 4.3

- No drag & drop on the calendar (cards are read-only in chronology view)
- No creating cards from the calendar (use Todo/Kanban tabs for that)
- No recurring events or event types
- No week/day view (month view only, per Figma "calendar and colored events")
- No IEventDispatcher wiring (Epic 7)
- No card editing from chronology (view-only, click shows detail)
- No calendar export (iCal etc.)

### Critical Anti-Patterns to Avoid

1. **Do NOT create a new aggregate or entity** — Chronology is a VIEW on existing Board data. CQRS read only.
2. **Do NOT register the query in DI** — Queries are called directly, not injected.
3. **Do NOT fetch all boards then filter client-side** — Use a proper SQL JOIN query for efficiency.
4. **Do NOT install a heavy calendar library** (FullCalendar, react-big-calendar) — shadcn Calendar (react-day-picker) is sufficient and consistent with the project's UI toolkit.
5. **Do NOT modify the board aggregate or card entity** — No domain changes needed.
6. **Do NOT use Result<T> for query returns** — Queries return DTOs directly, errors via try-catch.
7. **Do NOT create index.ts barrel files**.
8. **Do NOT add IEventDispatcher wiring** (Epic 7).
9. **`getAuthenticatedUser()` duplication** — Continue existing copy-paste pattern per controller.

### Golden Reference Files

| Purpose | Source File | Adaptation |
|---------|------------|------------|
| Query (date grouping) | `src/adapters/queries/journal.query.ts` | Chronology query with JOIN + date grouping |
| Query (multi-table JOIN) | `src/adapters/queries/friend-feed.query.ts` | card → column → board JOIN pattern |
| Query test | `src/adapters/queries/__tests__/journal.query.test.ts` | Mock db chain for chronology query |
| Controller (query call) | `src/adapters/controllers/post/post.controller.ts:getJournalEntriesController` | Direct query call, try-catch error handling |
| DTO | `src/application/dto/journal/get-journal-entries.dto.ts` | Zod schema for chronology output |
| API route | `app/api/v1/journal/route.ts` | Simple `export const GET` pattern |
| Tab integration | `app/(protected)/organization/page.tsx` | Remove disabled, add ChronologyView |
| Empty state | `app/(protected)/organization/_components/todo-list-view.tsx` | Card + message + CTA pattern |
| Card styling | `app/(protected)/organization/_components/kanban-card.tsx` | Overdue detection, progress bar, date display |
| Card detail | `app/(protected)/organization/_components/card-edit-dialog.tsx` | Reusable card detail view (read-only mode) |

### Project Structure Notes

```
# New files to create (Story 4.3 only)
src/application/dto/board/get-chronology.dto.ts                     # DTO
src/adapters/queries/chronology.query.ts                             # CQRS Query
src/adapters/queries/__tests__/chronology.query.test.ts              # Query tests

app/api/v1/boards/chronology/route.ts                                # API route

app/(protected)/organization/_components/chronology-view.tsx         # UI container
app/(protected)/organization/_components/chronology-calendar.tsx     # Calendar with dots
app/(protected)/organization/_components/chronology-event-list.tsx   # Date event list
app/(protected)/organization/_components/chronology-card-detail.tsx  # Card detail popover

# Files to modify
src/adapters/controllers/board/board.controller.ts                   # Add getChronologyController
app/(protected)/organization/page.tsx                                 # Enable Chronology tab
```

### Previous Story Intelligence (4.2)

Key learnings from Story 4.2 that impact this story:

1. **Table naming:** `board_column` (not `column` — PostgreSQL reserved word). Use `boardColumn` in Drizzle queries.
2. **Card dueDate:** Stored as `date("due_date", { mode: "string" })` — returns `YYYY-MM-DD` strings. Use string comparison for date filtering in queries.
3. **Board type enum:** `boardTypeEnum("type")` — values are `"todo" | "kanban"`. Include in DTO so calendar can show board type.
4. **Repository delete-and-reinsert:** The board repository uses full rewrite on update. Chronology is read-only, so no concern.
5. **shadcn import path fix:** shadcn components may need import path correction (`../../libs/utils`). Check at install time.
6. **Card overdue detection:** Already implemented in `kanban-card.tsx`: `new Date(card.dueDate) < new Date() && card.progress < 100`. Reuse this logic.
7. **279 tests passing** — current test count baseline.
8. **@dnd-kit installed** — not needed for chronology (read-only view).
9. **Auth guard in layout.tsx** — organization page already protected.
10. **Code review finding H1 (4.2):** Auth guard must be in layout, not page. Already resolved — no action needed.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.3]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 4]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture - Organization]
- [Source: _bmad-output/planning-artifacts/architecture.md#CQRS Decision]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Conventions]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/prd.md#FR36, FR42]
- [Source: _bmad-output/implementation-artifacts/4-2-kanban-boards-with-drag-and-drop.md#Dev Notes]
- [Source: _bmad-output/implementation-artifacts/4-2-kanban-boards-with-drag-and-drop.md#Completion Notes]
- [Source: _bmad-output/implementation-artifacts/4-1-create-and-manage-todo-lists.md#Dev Notes]
- [Source: apps/nextjs/src/adapters/queries/journal.query.ts - CQRS query pattern]
- [Source: apps/nextjs/src/adapters/queries/friend-feed.query.ts - multi-table JOIN]
- [Source: apps/nextjs/packages/drizzle/src/schema/board.ts - DB schema]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- Pure CQRS read story — no domain changes, no DI registrations, no schema changes
- Chronology query uses single JOIN (card → boardColumn → board) filtered by userId + dueDate NOT NULL + month range
- shadcn Calendar installed (react-day-picker v9) with import path fixes for button.tsx and calendar.tsx
- Fixed pre-existing separator.tsx import path (`src/libs/utils` → `../../libs/utils`)
- Fixed non-null assertions in chronology tests to use optional chaining (Biome compliance)
- 287 total tests (8 for chronology query — 6 original + 2 added during code review)
- Two-panel UI: Calendar with colored dots per board + event list with card detail dialog
- Code review fixes applied: moved isOverdue outside component, added todayKey memoization + useCallback for formatDateKey, removed unused useMemo, allowed selecting any calendar date, added 2 query verification tests

### File List

**New files:**
- `apps/nextjs/src/application/dto/board/get-chronology.dto.ts`
- `apps/nextjs/src/adapters/queries/chronology.query.ts`
- `apps/nextjs/src/adapters/queries/__tests__/chronology.query.test.ts`
- `apps/nextjs/app/api/v1/boards/chronology/route.ts`
- `apps/nextjs/app/(protected)/organization/_components/chronology-view.tsx`
- `apps/nextjs/app/(protected)/organization/_components/chronology-calendar.tsx`
- `apps/nextjs/app/(protected)/organization/_components/chronology-event-list.tsx`
- `apps/nextjs/app/(protected)/organization/_components/chronology-card-detail.tsx`
- `packages/ui/src/components/ui/calendar.tsx`

**Modified files:**
- `apps/nextjs/src/adapters/controllers/board/board.controller.ts` — added getChronologyController
- `apps/nextjs/app/(protected)/organization/page.tsx` — enabled Chronology tab
- `packages/ui/src/components/ui/button.tsx` — fixed import path (shadcn overwrite)
- `packages/ui/src/components/ui/separator.tsx` — fixed pre-existing import path
- `packages/ui/package.json` — react-day-picker dependency added
- `pnpm-lock.yaml` — lockfile updated
