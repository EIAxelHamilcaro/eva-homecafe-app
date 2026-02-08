# Story 4.2: Kanban Boards with Drag & Drop

Status: done

## Story

As a **user**,
I want to create kanban boards with columns and drag cards between them,
so that I can visually organize projects and workflows.

## Acceptance Criteria

1. **Given** an authenticated user on the organization page **When** they select the "Kanban" view tab **Then** they see their kanban boards

2. **Given** an authenticated user **When** they create a new kanban board with a title and columns **Then** the board is created with multiple columns

3. **Given** an authenticated user **When** they create a card with title, description, progress percentage, and due date **Then** the card is added to the specified column

4. **Given** an authenticated user viewing a kanban board **When** they drag a card from one column to another **Then** the card moves to the target column and the change persists **And** the drag & drop interaction runs at 60fps (NFR6)

5. **Given** an authenticated user viewing a kanban board **When** they drag a card within the same column to reorder **Then** the card order updates and persists

6. **Given** an authenticated user **When** they update a card's progress percentage **Then** the progress indicator reflects the new value

7. **Given** an authenticated user **When** a card is completed (moved to done column or progress 100%) **Then** a CardCompletedEvent domain event is dispatched (for gamification)

## Tasks / Subtasks

- [x] Task 1: Extend Board Domain for Kanban Operations (AC: #2, #4, #5)
  - [x] 1.1 Add `moveCard(cardId, toColumnId, newPosition)` method to Board aggregate
  - [x] 1.2 Add `reorderCard(columnId, cardId, newPosition)` method to Board aggregate
  - [x] 1.3 Add `addColumn(title, position)` method to Board aggregate
  - [x] 1.4 Add `removeColumn(columnId)` method to Board aggregate
  - [x] 1.5 Add `updateCard(cardId, updates)` method to Board aggregate
  - [x] 1.6 Add `updateProgress()`, `updateDescription()`, `updateDueDate()`, `updatePosition()` methods to Card entity
  - [x] 1.7 Create `src/domain/board/value-objects/card-progress.vo.ts`
  - [x] 1.8 Create `src/domain/board/events/card-completed.event.ts`

- [x] Task 2: Create New DTOs for Kanban Operations (AC: #2, #3, #4, #5, #6)
  - [x] 2.1 Extend `cardDtoSchema` in `common-board.dto.ts`
  - [x] 2.2 Create `src/application/dto/board/move-card.dto.ts`
  - [x] 2.3 Create `src/application/dto/board/create-kanban-board.dto.ts`
  - [x] 2.4 Create `src/application/dto/board/add-column.dto.ts`
  - [x] 2.5 Create `src/application/dto/board/update-card.dto.ts`
  - [x] 2.6 Create `src/application/dto/board/add-card.dto.ts`

- [x] Task 3: Create New Use Cases (AC: #2, #3, #4, #5, #6, #7)
  - [x] 3.1 Create `create-kanban-board.use-case.ts`
  - [x] 3.2 Create `move-card.use-case.ts`
  - [x] 3.3 Create `add-column.use-case.ts`
  - [x] 3.4 Create `update-card.use-case.ts`
  - [x] 3.5 Create `add-card-to-column.use-case.ts`

- [x] Task 4: Register DI (AC: all)
  - [x] 4.1 Add 5 new use cases to `common/di/types.ts`
  - [x] 4.2 Update `common/di/modules/board.module.ts`

- [x] Task 5: Create New Controllers & API Routes (AC: all)
  - [x] 5.1 Create `src/adapters/controllers/board/kanban.controller.ts` (5 controllers)
  - [x] 5.2 Create `app/api/v1/boards/[boardId]/columns/route.ts`
  - [x] 5.3 Create `app/api/v1/boards/[boardId]/cards/route.ts`
  - [x] 5.4 Create `app/api/v1/boards/[boardId]/cards/[cardId]/route.ts`
  - [x] 5.5 Create `app/api/v1/boards/[boardId]/cards/[cardId]/move/route.ts`
  - [x] 5.6 Create `app/api/v1/boards/kanban/route.ts` (dedicated kanban creation)

- [x] Task 6: Install Dependencies & UI Components (AC: #4, #5)
  - [x] 6.1 Install `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
  - [x] 6.2 Install shadcn components: progress, textarea, dropdown-menu, popover

- [x] Task 7: Create Kanban Board UI (AC: #1, #2, #3, #4, #5, #6)
  - [x] 7.1 Update `page.tsx` — enable Kanban tab with shadcn Tabs
  - [x] 7.2 Create `kanban-list-view.tsx`
  - [x] 7.3 Create `kanban-board-view.tsx` (DndContext, DragOverlay, optimistic updates)
  - [x] 7.4 Create `kanban-column.tsx` (SortableContext, useDroppable)
  - [x] 7.5 Create `kanban-card.tsx` (useSortable, Progress bar, due date)
  - [x] 7.6 Create `create-kanban-dialog.tsx`
  - [x] 7.7 Create `card-edit-dialog.tsx` (title, description, progress slider, due date)
  - [x] 7.8 Create `add-column-form.tsx`

- [x] Task 8: Write BDD Tests (AC: all)
  - [x] 8.1 Create `create-kanban-board.use-case.test.ts` (9 tests)
  - [x] 8.2 Create `move-card.use-case.test.ts` (9 tests)
  - [x] 8.3 Create `add-column.use-case.test.ts` (7 tests)
  - [x] 8.4 Create `update-card.use-case.test.ts` (14 tests)
  - [x] 8.5 Create `add-card-to-column.use-case.test.ts` (11 tests)

- [x] Task 9: Quality Checks
  - [x] 9.1 Run `pnpm fix` — formatted, no new errors
  - [x] 9.2 Run `pnpm type-check` — 0 new errors
  - [x] 9.3 Run `pnpm test` — 279 tests pass (50 new)
  - [x] 9.4 Run `pnpm check` — no new errors (1 pre-existing XSS warning)

## Dev Notes

### Architecture: Kanban Extends Unified Board Model

Story 4.2 builds on the unified Board aggregate created in Story 4.1. The same Board/Column/Card model serves both todo lists and kanban boards:

- **Todo list** (4.1) = Board with `type: 'todo'`, single Column, Card entities with `isCompleted`
- **Kanban board** (4.2) = Board with `type: 'kanban'`, multiple Columns, drag & drop between columns
- **Chronology** (4.3) = Calendar view on Cards with `dueDate` across all boards

### Database Schema: Already Ready

The DB schema created in Story 4.1 already includes all kanban fields. No schema changes needed:
- `board` table has `type` column with `boardTypeEnum` ('todo' | 'kanban')
- `board_column` table supports multiple columns per board with `position` ordering
- `card` table has `progress` (integer, 0-100) and `dueDate` (date, nullable) fields

### Domain Model: Existing vs New

**Already exists (from 4.1):**
- Board aggregate with `userId`, `title`, `type`, `columns[]`
- Column entity with `title`, `position`, `cards[]`, `addCard()`, `removeCard()`, `findCard()`
- Card entity with `title`, `description`, `isCompleted`, `position`, `progress`, `dueDate`, `toggleCompleted()`, `updateTitle()`
- BoardTitle, BoardType, CardTitle VOs
- BoardCreatedEvent domain event
- IBoardRepository port with `findByUserId(userId, pagination, type?)`
- Full CRUD use cases: Create, GetUserBoards, Update, Delete
- API routes: GET/POST `/api/v1/boards`, PUT/DELETE `/api/v1/boards/[boardId]`

**Must add (for 4.2):**
- Board aggregate methods: `moveCard()`, `reorderCard()`, `addColumn()`, `removeColumn()`, `updateCard()`
- Card entity methods: `updateProgress()`, `updateDescription()`, `updateDueDate()`
- CardProgress VO (validates 0-100)
- CardCompletedEvent domain event
- New use cases: CreateKanbanBoard, MoveCard, AddColumn, UpdateCard, AddCardToColumn
- New API routes for column/card operations
- Kanban UI with @dnd-kit drag & drop

### Drag & Drop Library: @dnd-kit

**Decision:** Use `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` for web kanban drag & drop.

**Rationale:**
- Purpose-built for sortable lists and multi-column boards (exact kanban use case)
- Actively maintained, React 19 compatible, Next.js compatible
- Performance-optimized for 60fps drag interactions (NFR6)
- Modular: import only needed packages
- Built-in accessibility (WCAG)
- Framer Motion (already installed) is for animations, not complex multi-container DnD

**Key @dnd-kit patterns for kanban:**
```typescript
// DndContext wraps the entire board
<DndContext onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
  {columns.map(column => (
    <SortableContext items={column.cards} strategy={verticalListSortingStrategy}>
      <KanbanColumn column={column}>
        {column.cards.map(card => (
          <SortableCard key={card.id} card={card} />
        ))}
      </KanbanColumn>
    </SortableContext>
  ))}
  <DragOverlay>
    {activeCard && <KanbanCard card={activeCard} />}
  </DragOverlay>
</DndContext>
```

**`handleDragEnd` logic:**
1. Determine source column + target column
2. If same column → reorder (PATCH position)
3. If different column → move (PUT move endpoint)
4. Optimistic UI update: move card immediately, revert on API error

### API Design for Drag & Drop

**Move card endpoint:** `PUT /api/v1/boards/[boardId]/cards/[cardId]/move`
```json
{
  "toColumnId": "column-uuid",
  "newPosition": 2
}
```

**Why a dedicated move endpoint:**
- Drag & drop happens frequently — needs fast, atomic operation
- Moving a card changes both source and target column state
- Position recalculation must happen server-side for consistency
- Keeps the generic update endpoint (`PUT /boards/[boardId]`) simple

**Add card to column:** `POST /api/v1/boards/[boardId]/cards`
```json
{
  "columnId": "column-uuid",
  "title": "New card",
  "description": "Details",
  "progress": 0,
  "dueDate": "2026-03-01"
}
```

**Update card properties:** `PUT /api/v1/boards/[boardId]/cards/[cardId]`
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "progress": 50,
  "dueDate": "2026-03-15"
}
```

**Add column:** `POST /api/v1/boards/[boardId]/columns`
```json
{
  "title": "In Review"
}
```

### Position Management Strategy

Use **sequential integer positions** (0, 1, 2, 3...) with full recalculation on move:

1. When card is moved/reordered, update positions of ALL cards in affected column(s)
2. This is simple, correct, and avoids gap-management complexity
3. Performance is fine for typical kanban boards (<100 cards per column)
4. The repository's existing delete-and-reinsert strategy already works for this

### Card Completion Detection (AC #7)

A card is considered "completed" when:
1. Its `progress` reaches 100%, OR
2. It is moved to a column whose title is "Done" (case-insensitive)

When detected, the use case should add a `CardCompletedEvent` to the board's domain events. Note: IEventDispatcher is NOT wired yet (Epic 7), so events are added via `addEvent()` but not dispatched.

### Kanban Creation Flow

When user creates a kanban board:
1. User provides title + column titles (e.g., ["To Do", "In Progress", "Done"])
2. Use case creates Board with `type: 'kanban'` and multiple Columns
3. Each column gets sequential position (0, 1, 2...)
4. Board starts with empty columns (no initial cards)
5. Default columns if none provided: ["To Do", "In Progress", "Done"]

### Optimistic UI Pattern for Drag & Drop

For smooth 60fps drag & drop:
1. Use React state for immediate UI updates (optimistic)
2. On drag end, update local state immediately (card appears in new position)
3. Fire API call in background (`fetch` without `await` blocking UI)
4. On API success: no action needed (state already correct)
5. On API failure: revert local state to previous position + show error toast

### Data Integrity / Performance Checklist (Epic 3 Retro Action #1)

- [ ] **N+1 possible?** Same as 4.1 — board loading uses batch queries, no N+1
- [ ] **Race conditions?** Concurrent drag operations on same board could conflict. Use last-write-wins (acceptable for single-user boards). No multi-user collaboration.
- [ ] **Position gaps?** Full recalculation on every move eliminates gaps
- [ ] **Large boards?** Target <20 columns, <50 cards per column. Pagination not needed for typical kanban usage.

### Security Checklist (Epic 2 Retro Action #1)

- [ ] Every endpoint requires authentication (`getAuthenticatedUser()`)
- [ ] Board ownership verified on every operation (load board, check userId matches session)
- [ ] Card and column IDs validated against the loaded board (prevent cross-board manipulation)
- [ ] All input validated with Zod safeParse
- [ ] No access to other users' boards

### Critical Anti-Patterns to Avoid

1. **Do NOT create a separate Kanban aggregate** — Kanban is a Board with `type: 'kanban'`. Unified model per architecture.
2. **Do NOT throw in domain/application** — All methods return `Result<T>`.
3. **Do NOT re-implement the existing Board CRUD** — Extend with new methods for move/reorder/column operations.
4. **Do NOT add client-side position calculation** — All position management happens server-side for consistency.
5. **Do NOT skip optimistic updates** — Without optimistic UI, drag & drop will feel laggy (fails NFR6 60fps).
6. **Do NOT use react-beautiful-dnd** — Deprecated, no longer maintained, not React 19 compatible.
7. **Do NOT create card/column-level repositories** — Column and Card are entities within Board aggregate. All persistence goes through IBoardRepository.
8. **Do NOT add IEventDispatcher wiring** — Events added via `addEvent()` but dispatch not wired yet (Epic 7).
9. **`getAuthenticatedUser()` duplication** — Continue existing copy-paste pattern per controller file.

### UI Approach

**Organization page tabs:**
- Todo (existing from 4.1)
- **Kanban (new — this story)**
- Chronology (still "Coming Soon" until 4.3)

**Kanban tab shows:**
- List of user's kanban boards (grid/list)
- "Create Kanban Board" button
- Click board → expand to full kanban view

**Kanban board view:**
- Horizontal scrollable columns
- Each column: title, card count, add card button
- Cards: title, progress bar (if > 0), due date badge (if set)
- Click card → edit dialog (title, description, progress slider, due date)
- Drag card → move between columns or reorder within column
- Add column button at the end

### shadcn/ui Components to Use

**Already available:** Button, Card, Dialog, Input, Checkbox, Tabs, AlertDialog, Badge, Slider, Label, Separator, Form

**May need to install:**
- `progress` — for card progress bar display
- `textarea` — for card description editing
- `popover` + `calendar` — for due date picker (check if already installed)
- `dropdown-menu` — for card context menu (edit/delete)
- `select` — for column selection (optional)

Verify what's installed before running `pnpm ui:add`.

### Golden Reference Files

| Purpose | Source File | Adaptation |
|---|---|---|
| Board aggregate | `src/domain/board/board.aggregate.ts` | Add moveCard, reorderCard, addColumn, removeColumn, updateCard |
| Card entity | `src/domain/board/card.entity.ts` | Add updateProgress, updateDescription, updateDueDate |
| Value Object | `src/domain/board/value-objects/board-type.vo.ts` | CardProgress VO pattern |
| Domain Event | `src/domain/board/events/board-created.event.ts` | CardCompletedEvent |
| Use Case | `src/application/use-cases/board/create-board.use-case.ts` | CreateKanbanBoardUseCase |
| Use Case | `src/application/use-cases/board/update-board.use-case.ts` | MoveCardUseCase, UpdateCardUseCase |
| Controller | `src/adapters/controllers/board/board.controller.ts` | kanban.controller.ts |
| API Route | `app/api/v1/boards/route.ts` | Same re-export pattern for new routes |
| DTO | `src/application/dto/board/common-board.dto.ts` | Extend with kanban fields |
| DTO mapper | `src/application/dto/board/board-dto.mapper.ts` | Reuse for kanban DTOs |
| DI Module | `common/di/modules/board.module.ts` | Add new use case bindings |
| DI Types | `common/di/types.ts` | Add new use case symbols |
| Tests | `src/application/use-cases/board/__tests__/create-board.use-case.test.ts` | Pattern for new use case tests |
| Todo UI | `app/(protected)/organization/_components/todo-board-card.tsx` | Card/board component patterns |
| Create dialog | `app/(protected)/organization/_components/create-todo-dialog.tsx` | Create kanban dialog pattern |

### Project Structure Notes

```
# New files to create (Story 4.2 only)
src/domain/board/value-objects/card-progress.vo.ts                    # VO
src/domain/board/events/card-completed.event.ts                       # Event

src/application/dto/board/move-card.dto.ts                            # DTO
src/application/dto/board/create-kanban-board.dto.ts                  # DTO
src/application/dto/board/add-column.dto.ts                           # DTO
src/application/dto/board/update-card.dto.ts                          # DTO
src/application/dto/board/add-card.dto.ts                             # DTO
src/application/use-cases/board/create-kanban-board.use-case.ts       # UC
src/application/use-cases/board/move-card.use-case.ts                 # UC
src/application/use-cases/board/add-column.use-case.ts                # UC
src/application/use-cases/board/update-card.use-case.ts               # UC
src/application/use-cases/board/add-card-to-column.use-case.ts        # UC
src/application/use-cases/board/__tests__/create-kanban-board.use-case.test.ts
src/application/use-cases/board/__tests__/move-card.use-case.test.ts
src/application/use-cases/board/__tests__/add-column.use-case.test.ts
src/application/use-cases/board/__tests__/update-card.use-case.test.ts
src/application/use-cases/board/__tests__/add-card-to-column.use-case.test.ts

src/adapters/controllers/board/kanban.controller.ts                   # Controller

app/api/v1/boards/[boardId]/columns/route.ts                         # API route
app/api/v1/boards/[boardId]/cards/route.ts                            # API route
app/api/v1/boards/[boardId]/cards/[cardId]/route.ts                   # API route
app/api/v1/boards/[boardId]/cards/[cardId]/move/route.ts              # API route

app/(protected)/organization/_components/kanban-list-view.tsx          # UI
app/(protected)/organization/_components/kanban-board-view.tsx         # UI
app/(protected)/organization/_components/kanban-column.tsx             # UI
app/(protected)/organization/_components/kanban-card.tsx               # UI
app/(protected)/organization/_components/create-kanban-dialog.tsx      # UI
app/(protected)/organization/_components/card-edit-dialog.tsx          # UI
app/(protected)/organization/_components/add-column-form.tsx           # UI

# Files to modify
src/domain/board/board.aggregate.ts                                   # Add move/reorder/column methods
src/domain/board/card.entity.ts                                       # Add update methods
src/application/dto/board/common-board.dto.ts                         # Extend card DTO with kanban fields
common/di/types.ts                                                    # Add new DI symbols
common/di/modules/board.module.ts                                     # Bind new use cases
app/(protected)/organization/page.tsx                                  # Enable Kanban tab
app/(protected)/organization/_components/todo-list-view.tsx            # May need refactoring for tab sharing
```

### Previous Story Intelligence (4.1)

Key learnings from Story 4.1 that impact this story:

1. **Table naming:** `board_column` used instead of `column` (PostgreSQL reserved word). Use `boardColumn` in Drizzle.
2. **BoardType VO:** Uses `z.string().refine()` pattern, not `z.enum()` (Zod 4 compatibility).
3. **Repository strategy:** Delete-and-reinsert pattern for Board update. This works for kanban moves too — load full board, modify in-memory, persist entire board.
4. **3-query findById pattern:** Board, columns, cards loaded in 3 queries with app-side grouping. No changes needed.
5. **Column.findCard() returns Option<Card>**, Column.removeCard() returns Result<void> — patterns already established.
6. **Shared DTO schemas** in `common-board.dto.ts` with `boardToDto()` mapper in `board-dto.mapper.ts` — reuse and extend these.
7. **Code review fixes applied:** DB-level type filter, pgEnum for board type, Option/Result patterns in entities, shared DTO extraction.
8. **All 34 board tests passing** — 229 total tests across codebase.
9. **shadcn components installed:** tabs, dialog, alert-dialog, checkbox, button, input, card, badge, slider, label, separator, form.

### Known Risks

1. **@dnd-kit + React 19:** While widely used with React, verify the latest @dnd-kit version supports React 19 at install time. Check for peer dependency warnings.
2. **Optimistic update complexity:** Multi-column drag & drop with optimistic UI requires careful state management. Keep it simple — use useState + useCallback, no global state library.
3. **Repository perf on frequent drags:** The delete-and-reinsert strategy means every card move rewrites all columns and cards. Acceptable for typical kanban size (<200 cards total), but would need optimization for very large boards.
4. **DragOverlay z-index:** Ensure the drag overlay renders above all columns and cards. May need CSS z-index adjustments.

### What NOT to Build in Story 4.2

- No calendar/chronology view (Story 4.3)
- No column WIP (Work In Progress) limits
- No card labels/tags
- No card assignees (single-user app)
- No card comments
- No board sharing
- No IEventDispatcher wiring (Epic 7 — events added via addEvent() but not dispatched)
- No column deletion confirmation if cards exist (just prevent deletion of non-empty columns)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.2]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 4]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture - Organization]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Conventions]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture - NFR6 60fps]
- [Source: _bmad-output/planning-artifacts/prd.md#FR36-FR42]
- [Source: _bmad-output/implementation-artifacts/4-1-create-and-manage-todo-lists.md#Dev Notes]
- [Source: _bmad-output/implementation-artifacts/4-1-create-and-manage-todo-lists.md#Completion Notes]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- Fixed shadcn import path: `/src/libs/utils` -> `../../libs/utils` in 4 UI components (dropdown-menu, popover, progress, textarea)
- Fixed TypeScript strict array indexing in kanban-board-view.tsx (Object is possibly 'undefined')
- Fixed `BoardType.create("kanban")` type inference: cast to `"kanban" as string` to match ValueObject generic

### Completion Notes List

- All 9 tasks completed successfully
- 50 new BDD tests added (229 -> 279 total, all passing)
- No schema changes needed — existing DB schema from Story 4.1 already supports kanban
- @dnd-kit v6/v10 installed and working with React 19
- Optimistic drag & drop UI with server sync on drop
- CardCompletedEvent fires on progress=100% or move-to-Done column
- Dedicated `/api/v1/boards/kanban` route added for kanban board creation (separate from generic `/api/v1/boards` POST)

### File List

**Created (28 files):**
- `src/domain/board/value-objects/card-progress.vo.ts`
- `src/domain/board/events/card-completed.event.ts`
- `src/application/dto/board/move-card.dto.ts`
- `src/application/dto/board/create-kanban-board.dto.ts`
- `src/application/dto/board/add-column.dto.ts`
- `src/application/dto/board/update-card.dto.ts`
- `src/application/dto/board/add-card.dto.ts`
- `src/application/use-cases/board/create-kanban-board.use-case.ts`
- `src/application/use-cases/board/move-card.use-case.ts`
- `src/application/use-cases/board/add-column.use-case.ts`
- `src/application/use-cases/board/update-card.use-case.ts`
- `src/application/use-cases/board/add-card-to-column.use-case.ts`
- `src/application/use-cases/board/__tests__/create-kanban-board.use-case.test.ts`
- `src/application/use-cases/board/__tests__/move-card.use-case.test.ts`
- `src/application/use-cases/board/__tests__/add-column.use-case.test.ts`
- `src/application/use-cases/board/__tests__/update-card.use-case.test.ts`
- `src/application/use-cases/board/__tests__/add-card-to-column.use-case.test.ts`
- `src/adapters/controllers/board/kanban.controller.ts`
- `app/api/v1/boards/kanban/route.ts`
- `app/api/v1/boards/[boardId]/columns/route.ts`
- `app/api/v1/boards/[boardId]/cards/route.ts`
- `app/api/v1/boards/[boardId]/cards/[cardId]/route.ts`
- `app/api/v1/boards/[boardId]/cards/[cardId]/move/route.ts`
- `app/(protected)/organization/_components/kanban-list-view.tsx`
- `app/(protected)/organization/_components/kanban-board-view.tsx`
- `app/(protected)/organization/_components/kanban-column.tsx`
- `app/(protected)/organization/_components/kanban-card.tsx`
- `app/(protected)/organization/_components/create-kanban-dialog.tsx`
- `app/(protected)/organization/_components/card-edit-dialog.tsx`
- `app/(protected)/organization/_components/add-column-form.tsx`
- `app/(protected)/organization/layout.tsx`

**Modified (10 files):**
- `src/domain/board/board.aggregate.ts` — Added moveCard, reorderCard, addColumn, removeColumn, updateCard
- `src/domain/board/card.entity.ts` — Added updateDescription, updateProgress, updateDueDate, updatePosition
- `src/domain/board/column.entity.ts` — Added insertCardAtPosition, recalculatePositions
- `src/application/dto/board/common-board.dto.ts` — Extended cardDtoSchema
- `src/application/dto/board/board-dto.mapper.ts` — Map new card fields
- `common/di/types.ts` — 5 new DI symbols + return types
- `common/di/modules/board.module.ts` — 5 new use case bindings
- `app/(protected)/organization/page.tsx` — Tabs with Kanban view
- `apps/nextjs/package.json` — Added @dnd-kit dependencies
- `pnpm-lock.yaml` — Lock file updated for @dnd-kit

**Fixed (4 shadcn files):**
- `packages/ui/src/components/ui/dropdown-menu.tsx` — Import path fix
- `packages/ui/src/components/ui/popover.tsx` — Import path fix
- `packages/ui/src/components/ui/progress.tsx` — Import path fix
- `packages/ui/src/components/ui/textarea.tsx` — Import path fix

### Code Review Fixes Applied

- **[H1] Security: Auth guard restored** — Created `app/(protected)/organization/layout.tsx` with `requireAuth()`. Page was converted to client component losing the guard; all other protected pages use it.
- **[H2] Performance: Eliminated full-board-list refetch** — Replaced `syncBoard()` (fetched ALL kanban boards) with `applyBoardResponse()` that uses API response data directly. Each move/add/update operation already returns the full board DTO.
- **[M1] Dead code: Removed unused variable** — Removed `const card = cardOption.unwrap()` in `move-card.use-case.ts:39`.
- **[M2] UX: Added delete confirmation** — Added `AlertDialog` to `kanban-board-view.tsx` before board deletion, matching the existing pattern in `todo-board-card.tsx`.
- **[M3] React: Fixed stale closure** — Moved index-finding logic inside `setColumns` callback in `handleDragOver` to prevent stale `columns` reference during rapid drags. Removed `[columns]` dependency.
- **[M4] Documentation: Updated File List** — Added `package.json`, `pnpm-lock.yaml`, and `layout.tsx` to the story File List.
- **[CardEditDialog] Updated `onUpdated` callback** — Now passes `IBoardDto` response data instead of requiring a separate refetch.
