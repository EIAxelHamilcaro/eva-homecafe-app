# Story 11.2: Organisation — Todo, Kanban, Timeline (Mobile)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **mobile user**,
I want to manage my tasks through todo lists, kanban boards, and calendar from my phone,
So that I can organize my projects anywhere.

## Acceptance Criteria

1. **Given** an authenticated mobile user **When** they navigate to the organisation screen **Then** they see five view tabs (todolist, timings, kanban, chronologie, calendrier) with real data from `/api/v1/boards` and `/api/v1/boards/chronology`

2. **Given** an authenticated mobile user on the todolist tab **When** data loads **Then** they see their todo boards fetched via `GET /api/v1/boards?type=todo`, each rendered as a TodoList with checkable items

3. **Given** an authenticated mobile user on the todolist tab **When** they toggle a todo item **Then** the card completion toggles via `PUT /api/v1/boards/[boardId]` with `{ toggleCardIds: [cardId] }` and the UI updates optimistically

4. **Given** an authenticated mobile user on the todolist tab **When** they add a new item to a list **Then** the card is created via `PUT /api/v1/boards/[boardId]` with `{ addCards: [{ title }] }` and appears immediately

5. **Given** an authenticated mobile user on the kanban tab **When** data loads **Then** they see their kanban boards fetched via `GET /api/v1/boards?type=kanban`, with columns and draggable cards

6. **Given** an authenticated mobile user on the kanban tab **When** they drag a card between columns **Then** the card moves with 60fps animation (react-native-draggable-flatlist) and persists via `PUT /api/v1/boards/[boardId]/cards/[cardId]/move` with `{ toColumnId, newPosition }`

7. **Given** an authenticated mobile user on the calendrier tab **When** data loads **Then** they see a Calendar component with marked dates from `GET /api/v1/boards/chronology?month=YYYY-MM`, dots colored per board

8. **Given** an authenticated mobile user on the chronologie tab **When** data loads **Then** they see cards with due dates from the chronology API, listed as timeline events grouped by date

9. **Given** an authenticated mobile user on the dashboard **When** the todo widget loads **Then** it shows pending todo items from `GET /api/v1/boards?type=todo&limit=5` (or empty state with CTA)

10. **Given** the existing Expo organisation UI components **When** implementing this story **Then** replace all mock data (`MOCK_TODO_LISTS`, `MOCK_KANBAN_COLUMNS`, `MOCK_TIMELINE_EVENTS`, `MOCK_MARKED_DATES`) with TanStack Query hooks calling the boards API

## Tasks / Subtasks

- [x] Task 1: Create board type definitions and query keys (AC: #1, #10)
  - [x] 1.1 Create `types/board.ts` with `BoardDto`, `ColumnDto`, `CardDto`, `CreateBoardInput`, `CreateKanbanBoardInput`, `UpdateBoardInput`, `AddCardInput`, `MoveCardInput`, `UpdateCardInput`, `GetBoardsResponse`, `ChronologyCard`, `ChronologyEventDate`, `ChronologyResponse` interfaces matching backend DTOs
  - [x] 1.2 Add `boardKeys` factory to `lib/api/hooks/query-keys.ts` with keys: `all`, `list(type?, page?, limit?)`, `detail(boardId)`, `chronology(month?)`

- [x] Task 2: Create TanStack Query hooks for board API (AC: #2, #3, #4, #5, #6, #7, #8)
  - [x] 2.1 Create `lib/api/hooks/use-boards.ts` with:
    - `useBoards(type?, page?, limit?)` — `useQuery` fetching `GET /api/v1/boards`
    - `useChronology(month?)` — `useQuery` fetching `GET /api/v1/boards/chronology`
    - `useCreateBoard()` — `useMutation` posting to `POST /api/v1/boards`
    - `useCreateKanbanBoard()` — `useMutation` posting to `POST /api/v1/boards/kanban`
    - `useUpdateBoard()` — `useMutation` putting to `PUT /api/v1/boards/[boardId]`
    - `useDeleteBoard()` — `useMutation` deleting `DELETE /api/v1/boards/[boardId]`
    - `useAddColumn()` — `useMutation` posting to `POST /api/v1/boards/[boardId]/columns`
    - `useAddCard()` — `useMutation` posting to `POST /api/v1/boards/[boardId]/cards`
    - `useUpdateCard()` — `useMutation` putting to `PUT /api/v1/boards/[boardId]/cards/[cardId]`
    - `useMoveCard()` — `useMutation` putting to `PUT /api/v1/boards/[boardId]/cards/[cardId]/move`
  - [x] 2.2 All mutations invalidate `boardKeys.all` on success

- [x] Task 3: Connect organisation screen to real API (AC: #1, #2, #3, #4, #5, #6, #7, #8, #10)
  - [x] 3.1 Replace `MOCK_TODO_LISTS` with `useBoards("todo")` data, mapping `BoardDto` → `TodoListProps` (board.columns[0].cards → TodoItemData[])
  - [x] 3.2 Replace `MOCK_KANBAN_COLUMNS` with `useBoards("kanban")` data, mapping `BoardDto.columns` → `KanbanColumnData[]`
  - [x] 3.3 Replace `MOCK_TIMELINE_EVENTS` with `useChronology()` cards, mapping `ChronologyCard[]` → `TimelineEvent[]` (dueDate → time display, boardType → color)
  - [x] 3.4 Replace `MOCK_MARKED_DATES` with `useChronology()` eventDates, mapping to `Record<string, MarkedDate>` with `createDot()` per board
  - [x] 3.5 Wire todo toggle (`onToggleItem`) to `useUpdateBoard()` mutation with `{ toggleCardIds: [cardId] }`
  - [x] 3.6 Wire todo add (`onAddItem`) to `useUpdateBoard()` mutation with `{ addCards: [{ title }] }`
  - [x] 3.7 Wire kanban card drag (`onCardReorder`) — for cross-column moves use `useMoveCard()` mutation with `{ toColumnId, newPosition }`
  - [x] 3.8 Add loading skeletons while data fetches, error states with retry
  - [x] 3.9 Add `RefreshControl` pull-to-refresh to refetch all board data

- [x] Task 4: Connect dashboard todo widget to real API (AC: #9)
  - [x] 4.1 Replace `MOCK_TODO_ITEMS` in `app/(protected)/(tabs)/_components/todo-widget.tsx` with `useBoards("todo")` data — show first few pending items across all todo boards
  - [x] 4.2 Show empty state with "Crée ta première liste" CTA linking to `/organisation` when no boards exist

## Dev Notes

### Backend API Contract (Existing — DO NOT modify backend)

The web backend API is fully implemented. The mobile app consumes these endpoints:

| Method | Endpoint | Purpose | Request Body | Response Shape |
|--------|----------|---------|-------------|----------------|
| GET | `/api/v1/boards` | List user's boards | Query: `?type=todo\|kanban&page=1&limit=20` | `{ boards: BoardDto[], pagination }` |
| POST | `/api/v1/boards` | Create todo board | `{ title, type: "todo", items?: [{ title }] }` | `BoardDto` (201) |
| POST | `/api/v1/boards/kanban` | Create kanban board | `{ title, columns?: [{ title }] }` | `BoardDto` (201) |
| PUT | `/api/v1/boards/[boardId]` | Update board | `{ title?, addCards?, removeCardIds?, toggleCardIds? }` | `BoardDto` |
| DELETE | `/api/v1/boards/[boardId]` | Delete board | — | `{ id }` |
| POST | `/api/v1/boards/[boardId]/columns` | Add column | `{ title }` | `BoardDto` (201) |
| POST | `/api/v1/boards/[boardId]/cards` | Add card to column | `{ columnId, title, description?, progress?, dueDate? }` | `BoardDto` (201) |
| PUT | `/api/v1/boards/[boardId]/cards/[cardId]` | Update card | `{ title?, description?, progress?, dueDate? }` | `BoardDto` |
| PUT | `/api/v1/boards/[boardId]/cards/[cardId]/move` | Move card | `{ toColumnId, newPosition }` | `BoardDto` |
| GET | `/api/v1/boards/chronology` | Get timeline data | Query: `?month=YYYY-MM` | `{ cards: ChronologyCard[], eventDates: Record<string, EventDateInfo> }` |

**BoardDto Structure:**
```typescript
{
  id: string;
  title: string;
  type: "todo" | "kanban";
  columns: [{
    id: string;
    title: string;
    position: number;
    cards: [{
      id: string;
      title: string;
      description: string | null;
      isCompleted: boolean;
      position: number;
      progress: number;        // 0-100
      dueDate: string | null;  // "YYYY-MM-DD"
    }]
  }];
  createdAt: string;
  updatedAt: string | null;
}
```

**ChronologyResponse Structure:**
```typescript
{
  cards: [{
    id: string;
    title: string;
    description: string | null;
    dueDate: string;           // "YYYY-MM-DD"
    isCompleted: boolean;
    progress: number;
    boardId: string;
    boardTitle: string;
    boardType: "todo" | "kanban";
    columnTitle: string;
  }];
  eventDates: Record<string, {
    count: number;
    boards: [{ id: string; title: string }];
  }>;
}
```

**Update Board — Special fields:**
- `toggleCardIds: string[]` — toggles `isCompleted` for each card ID
- `addCards: [{ title: string }]` — adds new cards to the first column
- `removeCardIds: string[]` — removes cards by ID

**Move Card behavior:** Moving a card to a column titled "Done" (case-insensitive match) or "Terminé" triggers a `CardCompletedEvent` domain event for gamification.

### Architecture Compliance

- **API Client**: Use existing `lib/api/client.ts` — NEVER create a new client
- **Auth Tokens**: Handled automatically by `ApiClient` (SecureStore + in-memory cache)
- **TanStack Query**: Follow patterns from `use-mood.ts`, `use-journal.ts`, and `use-posts.ts`
- **Query Keys**: Add `boardKeys` to existing `query-keys.ts` using factory pattern
- **Error Handling**: Use `ApiError` class, display via toast or inline error
- **NativeWind Styling**: All styles via Tailwind classNames, not StyleSheet
- **Type Everything**: No `any`, use proper TypeScript interfaces
- **SafeAreaView**: Import from `react-native-safe-area-context` (NOT from `react-native`)

### Existing Components to Reuse (DO NOT recreate)

| Component | Path | Purpose | What to Change |
|-----------|------|---------|----------------|
| `TodoList` | `components/organisation/todo-list.tsx` | Todo list with add item | Wire `onToggleItem`, `onAddItem` to API mutations |
| `TodoItem` | `components/organisation/todo-item.tsx` | Single checkable item | **No change needed** — pure presentational |
| `KanbanBoard` | `components/organisation/kanban-board.tsx` | Horizontal scrolling board | Wire `onCardReorder` to `useMoveCard()` |
| `KanbanColumn` | `components/organisation/kanban-column.tsx` | Draggable column | **No change needed** — drag already works |
| `KanbanCard` | `components/organisation/kanban-card.tsx` | Single kanban card | **No change needed** — pure presentational |
| `Timeline` | `components/organisation/timeline.tsx` | Timeline event list | Replace mock events with chronology API data |
| `Calendar` | `components/organisation/calendar.tsx` | Calendar with dots | Replace mock marked dates with chronology API data |

### Existing Screen to Modify (replace mock data)

| Screen | Path | Current State | Action |
|--------|------|---------------|--------|
| Organisation Main | `app/(protected)/organisation/index.tsx` | 4 mock data constants (`MOCK_TODO_LISTS`, `MOCK_KANBAN_COLUMNS`, `MOCK_TIMELINE_EVENTS`, `MOCK_MARKED_DATES`) | Replace all mock data with API hooks |
| Dashboard Todo Widget | `app/(protected)/(tabs)/_components/todo-widget.tsx` | `MOCK_TODO_ITEMS` from constants | Replace with `useBoards("todo")` data |
| Dashboard Calendar Widget | `app/(protected)/(tabs)/_components/calendar-widget.tsx` | Static date display | **Optional** — could connect to chronology for event count |
| Dashboard Suivi Widgets | `app/(protected)/(tabs)/_components/suivi-widgets.tsx` | `MOCK_MONTHLY_DATA`, `MOCK_WEEKLY_DATA` | **Out of scope** — no board stats API endpoint exists |

### Data Mapping: Backend DTO → Component Props

**BoardDto (todo) → TodoList:**
```typescript
// Backend: { id, title, type: "todo", columns: [{ cards: [{ id, title, isCompleted }] }] }
// Component expects: TodoListProps = { id, title, items: TodoItemData[] }
// TodoItemData = { id: string, label: string, completed: boolean }
const mapBoardToTodoList = (board: BoardDto) => ({
  id: board.id,
  title: board.title,
  items: (board.columns[0]?.cards ?? []).map(card => ({
    id: card.id,
    label: card.title,
    completed: card.isCompleted,
  })),
});
```

**BoardDto (kanban) → KanbanBoard:**
```typescript
// Backend: { columns: [{ id, title, cards: [{ id, title, progress }] }] }
// Component expects: KanbanColumnData[] = [{ id, title, cards: KanbanCardData[] }]
// KanbanCardData = { id, title, labels?, progress? }
const mapBoardToKanban = (board: BoardDto): KanbanColumnData[] =>
  board.columns.map(col => ({
    id: col.id,
    title: col.title,
    cards: col.cards.map(card => ({
      id: card.id,
      title: card.title,
      progress: card.progress > 0 ? card.progress : undefined,
    })),
  }));
```

**ChronologyResponse → Timeline:**
```typescript
// Backend: { cards: [{ id, title, dueDate, boardType, boardTitle, columnTitle }] }
// Component expects: TimelineEvent[] = [{ id, title, time, color? }]
// NOTE: Cards have date (YYYY-MM-DD) not time-of-day. Display date as "time" label.
const BOARD_COLORS: Record<string, TimelineEventColor> = {};
let colorIndex = 0;
const COLOR_CYCLE: TimelineEventColor[] = ["pink", "orange", "yellow", "green", "blue", "purple"];

const getBoardColor = (boardId: string): TimelineEventColor => {
  if (!BOARD_COLORS[boardId]) {
    BOARD_COLORS[boardId] = COLOR_CYCLE[colorIndex % COLOR_CYCLE.length];
    colorIndex++;
  }
  return BOARD_COLORS[boardId];
};

const mapChronologyToTimeline = (cards: ChronologyCard[]): TimelineEvent[] =>
  cards.map(card => ({
    id: card.id,
    title: `${card.title} (${card.boardTitle})`,
    time: new Date(card.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    color: getBoardColor(card.boardId),
  }));
```

**ChronologyResponse → Calendar marked dates:**
```typescript
// Backend: { eventDates: Record<"YYYY-MM-DD", { count, boards: [{ id, title }] }> }
// Component expects: Record<string, MarkedDate> where MarkedDate = { dots: Dot[] }
const mapChronologyToCalendar = (eventDates: Record<string, ChronologyEventDate>) =>
  Object.entries(eventDates).reduce((acc, [date, info]) => ({
    ...acc,
    [date]: {
      dots: info.boards.map(b => createDot(getBoardColor(b.id))),
    },
  }), {} as Record<string, MarkedDate>);
```

### New Files to Create

```
apps/expo/
├── types/
│   └── board.ts                          # Board type definitions
└── lib/api/hooks/
    └── use-boards.ts                     # All board TanStack Query hooks
```

Plus additions to existing:
- `lib/api/hooks/query-keys.ts` — add `boardKeys` factory

### Key Implementation Patterns (from story 11.1)

**Query key factory pattern:**
```typescript
export const boardKeys = {
  all: ["boards"] as const,
  list: (type?: string, page?: number, limit?: number) =>
    [...boardKeys.all, "list", { type, page, limit }] as const,
  detail: (boardId: string) => [...boardKeys.all, "detail", boardId] as const,
  chronology: (month?: string) => [...boardKeys.all, "chronology", { month }] as const,
};
```

**Query hook pattern (follow use-mood.ts):**
```typescript
export function useBoards(type?: "todo" | "kanban", page = 1, limit = 20) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  params.set("page", String(page));
  params.set("limit", String(limit));
  return useQuery({
    queryKey: boardKeys.list(type, page, limit),
    queryFn: () => api.get<GetBoardsResponse>(`/api/v1/boards?${params}`),
    staleTime: 1000 * 60,
  });
}
```

**Mutation hook pattern (follow use-posts.ts):**
```typescript
export function useUpdateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ boardId, ...data }: UpdateBoardInput & { boardId: string }) =>
      api.put<BoardDto>(`/api/v1/boards/${boardId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}
```

**Move card mutation:**
```typescript
export function useMoveCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ boardId, cardId, ...data }: MoveCardInput & { boardId: string; cardId: string }) =>
      api.put<BoardDto>(`/api/v1/boards/${boardId}/cards/${cardId}/move`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}
```

### Library Versions (Already Installed — DO NOT upgrade)

| Library | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | 5.67.3 | Server state management |
| `react-native-draggable-flatlist` | 4.0.3 | Kanban drag & drop |
| `react-native-calendars` | 1.1313.0 | Calendar views |
| `react-native-gesture-handler` | 2.25.0 | Gesture support |
| `react-native-reanimated` | 3.17.4 | 60fps animations |
| `expo-router` | 6.0.21 | File-based routing |
| `nativewind` | 4.1.23 | Tailwind CSS for RN |

### Critical Guardrails

1. **DO NOT modify any backend code** — all board APIs are implemented and working
2. **DO NOT recreate UI components** — reuse existing TodoList, KanbanBoard, KanbanColumn, KanbanCard, Timeline, Calendar components
3. **DO NOT install new libraries** — everything needed is already installed
4. **DO NOT use Redux or Zustand** — use TanStack Query for server state, useState for local UI state
5. **Follow NativeWind styling** — all styles via Tailwind classNames, not StyleSheet
6. **Type everything** — no `any`, use proper TypeScript interfaces
7. **Handle loading and error states** — skeleton loaders, empty states, toast on error
8. **Invalidate caches on mutations** — all board mutations must invalidate `boardKeys.all` on success
9. **SafeAreaView** — import from `react-native-safe-area-context` (NOT from `react-native`)
10. **SuiviWidgets stays mock** — no backend stats endpoint exists for board completion metrics; leave `suivi-widgets.tsx` as-is
11. **Calendar month navigation** — when user changes month on Calendar, re-fetch chronology with new `?month=YYYY-MM` param
12. **Optimistic UI for toggles** — todo item toggle should update UI immediately, then sync with server
13. **Kanban drag → useMoveCard** — the `onCardReorder` callback from KanbanColumn gives the new card order; extract the moved card and compute `toColumnId` + `newPosition` for the API call
14. **Board colors for calendar/timeline** — assign a consistent color per board (from the 6-color palette) and reuse across timeline events and calendar dots

### Project Structure Notes

- Alignment with monorepo: Mobile app at `apps/expo/`, shares no code with `apps/nextjs/` except `packages/`
- API hooks are mobile-specific — web uses Server Actions, mobile uses TanStack Query
- Navigation: Organisation screen is at `app/(protected)/organisation/index.tsx`
- Protected layout at `app/(protected)/_layout.tsx` handles auth guard
- Organisation components are in `components/organisation/` (7 files)
- Dashboard constants at `constants/dashboard-mock-data.ts` — `MOCK_TODO_ITEMS` needs replacement

### Previous Story Intelligence (11.1 — Mood Tracking Mobile)

**Key Learnings:**
- SafeAreaView MUST be imported from `react-native-safe-area-context`, NOT from `react-native`
- Mutation handlers must actually call the mutation (not just local state toggle) — H1 fix from 11.1
- All hooks should invalidate related keys on mutation success
- Add Alert.alert success feedback after significant mutations (mood recording → also good for board creation)
- Follow `useQuery` for single resources, but for paginated lists consider useInfiniteQuery if infinite scroll needed
- `pnpm fix` may show 2 pre-existing warnings (console + dangerouslySetInnerHTML) — these are expected
- Extract shared utilities, don't duplicate across screens (M1-M3 from 10.1/10.2)
- Make conditional UI elements (like add buttons) dependent on callback prop presence

**Code Review Patterns to Follow (avoid repeating 11.1 issues):**
- H1: Ensure mutations actually call the API, not just toggle local state
- H2: Add user feedback (Alert or toast) after create/update operations
- M1: Make optional UI elements conditional on callback props
- M2: Stabilize useCallback dependencies with extractable refs
- M3: Avoid unnecessary type casts — let TypeScript infer

### Git Intelligence (Recent Commits)

```
b5c5778 feat(expo): implement story 11.1 — mood tracking mobile with code review fixes
703e21d docs: add epic 10 retrospective and mark epic complete
ab0038f feat(expo): implement story 10.2 — social feed & reactions mobile with code review fixes
7b3c941 feat(expo): implement story 10.1 — journal & posts mobile with code review fixes
```

**Pattern**: All mobile stories follow same structure — create types, create hooks, connect screen, connect dashboard widget. Commit format: `feat(expo): implement story X.Y — description with code review fixes`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 11: Story 11.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture — Organization]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Client Strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/implementation-artifacts/11-1-mood-tracking-mobile.md — Previous story learnings]
- [Source: apps/nextjs/app/api/v1/boards/ — All board API routes]
- [Source: apps/nextjs/src/application/dto/board/ — All board DTOs]
- [Source: apps/nextjs/src/adapters/queries/chronology.query.ts — Chronology query]
- [Source: apps/nextjs/src/domain/board/ — Board aggregate, Column + Card entities]
- [Source: packages/drizzle/src/schema/board.ts — DB schema (board, board_column, card tables)]
- [Source: apps/expo/components/organisation/ — 7 presentational components]
- [Source: apps/expo/app/(protected)/organisation/index.tsx — Screen with mock data]
- [Source: apps/expo/app/(protected)/(tabs)/_components/todo-widget.tsx — Dashboard todo widget]
- [Source: apps/expo/app/(protected)/(tabs)/_components/calendar-widget.tsx — Dashboard calendar widget]
- [Source: apps/expo/lib/api/client.ts — Base API client]
- [Source: apps/expo/lib/api/hooks/query-keys.ts — Query key factory pattern]
- [Source: apps/expo/lib/api/hooks/use-mood.ts — Reference query hook pattern]
- [Source: apps/expo/lib/api/hooks/use-posts.ts — Reference mutation hook pattern]
- [Source: apps/expo/constants/dashboard-mock-data.ts — Mock data to replace]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed TypeScript strict index access errors (COLOR_CYCLE array access, newCards loop)
- Fixed Biome `noAccumulatingSpread` warning in `mapChronologyToCalendar` (replaced reduce+spread with for loop)
- Biome auto-fixed import ordering in organisation/index.tsx

### Completion Notes List

- **Task 1**: Created `types/board.ts` with 13 interfaces matching backend DTOs. Added `boardKeys` factory to `query-keys.ts` with `all`, `list`, `detail`, `chronology` keys.
- **Task 2**: Created `use-boards.ts` with 10 hooks (2 queries + 8 mutations). All mutations invalidate `boardKeys.all` on success. Follows existing patterns from `use-mood.ts` and `use-posts.ts`.
- **Task 3**: Rewrote `organisation/index.tsx` — replaced all 4 mock data constants with TanStack Query hooks. Wired todo toggle (optimistic via `queryClient.setQueryData`), todo add, and kanban card reorder (max-displacement algorithm) to API mutations. Added per-tab loading states, empty states, and `RefreshControl` pull-to-refresh on all scrollable tabs. Calendar month navigation re-fetches chronology. Board-to-color mapping provides consistent colors across timeline and calendar.
- **Task 4**: Rewrote `todo-widget.tsx` — replaced `MOCK_TODO_ITEMS` with `useBoards("todo", 1, 5)`, extracting first 5 cards across all todo boards. Added loading spinner and empty state with "Crée ta première liste" CTA linking to `/organisation`.

### Change Log

- 2026-02-10: Implemented story 11.2 — Organisation (Todo, Kanban, Timeline) mobile. Replaced all mock data with real API hooks. All 4 tasks completed. 0 regressions (389 tests pass). TypeScript and Biome clean.
- 2026-02-10: Code review — found 5 HIGH, 3 MEDIUM, 1 LOW issues. Fixed all 8 HIGH+MEDIUM issues in 2 passes. H1 fixed via tap-to-move Alert column picker. M1 fixed by differentiating Timings (upcoming/overdue + relative dates) vs Chronologie (full timeline + absolute dates). 389 tests pass. Biome + TypeScript clean.

### Senior Developer Review (AI)

**Reviewer:** Axel (AI-assisted) on 2026-02-10

**Issues Found:** 5 High, 3 Medium, 1 Low

**Fixed (6):**
- [H2] Kanban tab now renders ALL boards, not just the first one (AC#5 compliance)
- [H3] TodoWidget now filters only pending (incomplete) items (AC#9 compliance)
- [H4] Error states with retry button added on all 5 tabs (Task 3.8 compliance)
- [H5] Optimistic toggle rollback: onError invalidates cache + shows Alert (data consistency)
- [M2] Calendar dot key collision fixed: passing board ID as unique key to createDot
- [M3] Mutation error feedback: Alert.alert on all mutation errors (toggle, add, move)

**Fixed in second pass (2):**
- [H1][AC#6] Cross-column kanban card move via tap → Alert column picker → useMoveCard() API. Intra-column drag preserved via DraggableFlatList.
- [M1] Timings tab now shows upcoming/overdue incomplete events with relative dates ("Demain", "Dans 3j", "2j en retard"). Chronologie tab shows full timeline with absolute dates. Both tabs now serve distinct purposes.

**Low (not fixed):**
- [L1] TodoWidget Checkbox is non-interactive (read-only). By design for dashboard preview.

**Outcome:** Approved — all HIGH and MEDIUM issues fixed

### File List

- `apps/expo/types/board.ts` (new) — Board type definitions matching backend DTOs
- `apps/expo/lib/api/hooks/use-boards.ts` (new) — 10 TanStack Query hooks for boards API
- `apps/expo/lib/api/hooks/query-keys.ts` (modified) — Added `boardKeys` factory
- `apps/expo/app/(protected)/organisation/index.tsx` (modified) — Replaced all mock data with API hooks; code review fixes (multi-board kanban, error states, mutation error handling, dot key fix)
- `apps/expo/app/(protected)/(tabs)/_components/todo-widget.tsx` (modified) — Replaced mock data with API hook; code review fix (pending items filter)
