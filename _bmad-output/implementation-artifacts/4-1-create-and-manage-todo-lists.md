# Story 4.1: Create & Manage Todo Lists

Status: complete

## Story

As a **user**,
I want to create to-do lists with checkable items,
so that I can track simple tasks and daily goals.

## Acceptance Criteria

1. **Given** an authenticated user on the organization page **When** they select the "To-do" view tab **Then** they see their to-do lists with checkable items

2. **Given** an authenticated user **When** they create a new to-do list with a title and items **Then** the board is created with a single column (todo type) and card items **And** the Board aggregate, Column entity, Card entity, and DB schema (board, column, card tables) are created

3. **Given** an authenticated user with an existing to-do list **When** they check/uncheck an item **Then** the item status toggles and persists immediately

4. **Given** an authenticated user **When** they edit a to-do list title or item text **Then** the changes are saved

5. **Given** an authenticated user **When** they delete a to-do list **Then** the list and all its items are permanently removed

6. **Given** an authenticated user with no to-do lists **When** they view the to-do tab **Then** they see an empty state prompting them to create their first list

## Tasks / Subtasks

- [x] Task 1: Create Board DB Schema (AC: #2)
  - [x] 1.1 Create `packages/drizzle/src/schema/board.ts` with three tables: `board`, `board_column`, `card`
  - [x] 1.2 Board table: `id` (text PK), `userId` (text FK→user.id CASCADE), `title` (text NOT NULL), `type` (text NOT NULL, values: 'todo'|'kanban'), `createdAt` (timestamp), `updatedAt` (timestamp)
  - [x] 1.3 Column table (named `board_column` to avoid PG reserved word): `id` (text PK), `boardId` (text FK→board.id CASCADE), `title` (text NOT NULL), `position` (integer NOT NULL), `createdAt` (timestamp)
  - [x] 1.4 Card table: `id` (text PK), `columnId` (text FK→board_column.id CASCADE), `title` (text NOT NULL), `description` (text), `isCompleted` (boolean NOT NULL default false), `position` (integer NOT NULL), `progress` (integer default 0), `dueDate` (date mode string), `createdAt` (timestamp), `updatedAt` (timestamp)
  - [x] 1.5 Add indexes: `board_user_id_idx` on board.userId, `column_board_id_position_idx` on board_column(boardId, position), `card_column_id_position_idx` on card(columnId, position)
  - [x] 1.6 Export from `packages/drizzle/src/schema/index.ts`

- [x] Task 2: Create Board Domain Layer (AC: #2)
  - [x] 2.1 Create `src/domain/board/board-id.ts` — UUID-based ID
  - [x] 2.2 Create `src/domain/board/column-id.ts` — UUID-based ID
  - [x] 2.3 Create `src/domain/board/card-id.ts` — UUID-based ID
  - [x] 2.4 Create `src/domain/board/value-objects/board-title.vo.ts` — min 1, max 100 chars
  - [x] 2.5 Create `src/domain/board/value-objects/board-type.vo.ts` — enum: 'todo' | 'kanban' (uses z.string().refine() for Zod 4 compat)
  - [x] 2.6 Create `src/domain/board/value-objects/card-title.vo.ts` — min 1, max 200 chars
  - [x] 2.7 Create `src/domain/board/card.entity.ts` — Entity with title, description, isCompleted, position, progress, dueDate
  - [x] 2.8 Create `src/domain/board/column.entity.ts` — Entity with title, position, cards[]
  - [x] 2.9 Create `src/domain/board/board.aggregate.ts` — Aggregate with columns[], type, create/reconstitute/addCard/toggleCard/updateTitle/deleteCard methods
  - [x] 2.10 Create `src/domain/board/events/board-created.event.ts`

- [x] Task 3: Create Board Repository Port & Mapper (AC: #2)
  - [x] 3.1 Create `src/application/ports/board-repository.port.ts` — extends BaseRepository<Board> with findByUserId(userId, pagination?)
  - [x] 3.2 Create `src/adapters/mappers/board.mapper.ts` — boardToDomain (with columns and cards) and boardToPersistence functions

- [x] Task 4: Create Board Repository Implementation (AC: #2, #3, #4, #5)
  - [x] 4.1 Create `src/adapters/repositories/board.repository.ts` — DrizzleBoardRepository implementing IBoardRepository
  - [x] 4.2 Implement create() — insert board + column + cards in transaction
  - [x] 4.3 Implement findById() — 3 queries (board, columns, cards), group app-side
  - [x] 4.4 Implement findByUserId() — paginated with batch loading columns/cards
  - [x] 4.5 Implement update() — transaction with delete-and-reinsert pattern for columns/cards
  - [x] 4.6 Implement delete() — cascade deletion via FK

- [x] Task 5: Create Board DTOs (AC: #2, #3, #4, #5)
  - [x] 5.1 Create `src/application/dto/board/create-board.dto.ts` — input: { title, type, userId, items?: { title }[] }, output: { id, title, type, columns, createdAt }
  - [x] 5.2 Create `src/application/dto/board/get-boards.dto.ts` — output: paginated board list with type filter
  - [x] 5.3 Create `src/application/dto/board/update-board.dto.ts` — input: { boardId, userId, title?, addCards?, removeCardIds?, toggleCardIds? }
  - [x] 5.4 Create `src/application/dto/board/delete-board.dto.ts` — input: { boardId, userId }, output: { id }

- [x] Task 6: Create Board Use Cases (AC: #2, #3, #4, #5)
  - [x] 6.1 Create `src/application/use-cases/board/create-board.use-case.ts` — creates Board with single "Items" column for todo type, persists, returns DTO
  - [x] 6.2 Create `src/application/use-cases/board/get-user-boards.use-case.ts` — fetches user's boards with optional type filter, returns paginated DTOs
  - [x] 6.3 Create `src/application/use-cases/board/update-board.use-case.ts` — loads board, validates ownership, applies changes (toggle cards, add/remove cards, rename), persists
  - [x] 6.4 Create `src/application/use-cases/board/delete-board.use-case.ts` — validates ownership, deletes

- [x] Task 7: Register DI (AC: all)
  - [x] 7.1 Add `IBoardRepository`, `CreateBoardUseCase`, `GetUserBoardsUseCase`, `UpdateBoardUseCase`, `DeleteBoardUseCase` to `common/di/types.ts` (symbols + return types + imports)
  - [x] 7.2 Create `common/di/modules/board.module.ts` — bind repository and use cases
  - [x] 7.3 Load board module in `common/di/container.ts` (alphabetically between Auth and Chat)

- [x] Task 8: Create Board Controllers (AC: all)
  - [x] 8.1 Create `src/adapters/controllers/board/board.controller.ts` with:
    - `createBoardController` — POST, auth required, Zod validate, create use case
    - `getUserBoardsController` — GET, auth required, type filter + pagination params
    - `updateBoardController` — PUT, auth required, boardId from params, update use case
    - `deleteBoardController` — DELETE, auth required, boardId from params, delete use case

- [x] Task 9: Create API Routes (AC: all)
  - [x] 9.1 Create `app/api/v1/boards/route.ts` — GET (list), POST (create)
  - [x] 9.2 Create `app/api/v1/boards/[boardId]/route.ts` — PUT (update), DELETE

- [x] Task 10: Create Organization Page & Todo UI (AC: #1, #3, #6)
  - [x] 10.1 Create `app/(protected)/organization/page.tsx` — server component with tabs (Todo active, Kanban and Chronology disabled/coming soon)
  - [x] 10.2 Create `app/(protected)/organization/_components/todo-list-view.tsx` — client component: fetches boards of type 'todo', renders list of todo boards
  - [x] 10.3 Create `app/(protected)/organization/_components/todo-board-card.tsx` — renders single todo list with title, checkable items, add item form, delete confirmation
  - [x] 10.4 Create `app/(protected)/organization/_components/create-todo-dialog.tsx` — dialog for creating new todo list with title and dynamic items
  - [x] 10.5 Create `app/(protected)/organization/_components/organization-empty-state.tsx` — empty state encouraging first todo list creation

- [x] Task 11: Write BDD Tests (AC: all)
  - [x] 11.1 Create `src/application/use-cases/board/__tests__/create-board.use-case.test.ts` (11 tests)
  - [x] 11.2 Create `src/application/use-cases/board/__tests__/get-user-boards.use-case.test.ts` (6 tests)
  - [x] 11.3 Create `src/application/use-cases/board/__tests__/update-board.use-case.test.ts` (12 tests)
  - [x] 11.4 Create `src/application/use-cases/board/__tests__/delete-board.use-case.test.ts` (5 tests)

- [x] Task 12: Quality Checks
  - [x] 12.1 Run `pnpm fix` (Biome formatting) — 0 errors in new files
  - [x] 12.2 Run `pnpm type-check` — 0 errors
  - [x] 12.3 Run `pnpm test` — 229 tests pass (28 files), including 34 board tests
  - [x] 12.4 Run `pnpm check` — only pre-existing chart.tsx error + pre-existing warnings

## Dev Notes

### Architecture: Unified Board Model

This story implements the **first part** of the unified Board aggregate model defined in the architecture. The Board aggregate serves ALL three views (todo, kanban, chronology) using a single data model:

- **Todo list** = Board with `type: 'todo'`, single Column ("Items"), Card entities with `isCompleted` boolean
- **Kanban board** (Story 4.2) = Board with `type: 'kanban'`, multiple Columns, drag & drop
- **Chronology** (Story 4.3) = Calendar view on Cards with `dueDate` across all boards

**For this story (4.1 only):** Focus on todo-type boards. Create the full Board/Column/Card domain model but only expose todo CRUD in the UI. Kanban and chronology views are Story 4.2 and 4.3.

### Domain Model Design

```
Board (Aggregate Root)
├── type: BoardType ('todo' | 'kanban')
├── title: BoardTitle
├── userId: string
├── columns: Column[]
│   └── Column (Entity)
│       ├── title: string
│       ├── position: integer
│       └── cards: Card[]
│           └── Card (Entity)
│               ├── title: CardTitle
│               ├── description: string | null
│               ├── isCompleted: boolean
│               ├── position: integer
│               ├── progress: integer (0-100)
│               └── dueDate: string | null (YYYY-MM-DD)
```

**Key design decisions:**
- Board contains Column[] which contains Card[] — nested aggregate with cascade persistence
- Column and Card are **Entities** (not Value Objects) — they have identity and lifecycle
- `position` fields enable ordering (integer-based, reinsert with gaps for efficiency)
- `progress` and `dueDate` on Card are for Story 4.2/4.3 — include in schema now but don't expose in todo UI
- TodoList is simply a Board with one Column. No separate aggregate needed.

### DB Schema Design

```sql
-- board table
CREATE TABLE board (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'todo' | 'kanban'
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP
);
CREATE INDEX board_user_id_idx ON board(user_id);

-- column table
CREATE TABLE "column" (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX column_board_id_position_idx ON "column"(board_id, position);

-- card table
CREATE TABLE card (
  id TEXT PRIMARY KEY,
  column_id TEXT NOT NULL REFERENCES "column"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL,
  progress INTEGER DEFAULT 0,
  due_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP
);
CREATE INDEX card_column_id_position_idx ON card(column_id, position);
```

**CRITICAL: "column" is a PostgreSQL reserved word.** Use double quotes in raw SQL. Drizzle ORM handles this automatically with `pgTable("column", ...)` but be aware in tests and raw queries. Consider naming the table `board_column` to avoid issues entirely.

### Data Integrity / Performance Checklist (Epic 3 Retro Action #1)

- [ ] **Unique index needed?** No unique constraint needed beyond PKs. Multiple boards per user allowed, multiple cards per column allowed.
- [ ] **N+1 possible?** YES — loading boards with columns and cards requires joins. Use eager loading: Board → JOIN columns → JOIN cards in a single query. Do NOT load boards then loop-fetch columns then loop-fetch cards.
- [ ] **DB-side vs app-side aggregation?** DB-side: order by position in query. App-side: group cards by column after flat join result.
- [ ] **Position ordering strategy:** Use integer positions with gaps (0, 1000, 2000...) for efficient reordering. When inserting between positions, calculate midpoint. Full reindex only when gap < 1.

### Security Checklist (Epic 2 Retro Action #1)

- [ ] Every endpoint requires authentication (`getAuthenticatedUser()`)
- [ ] Users can only CRUD their OWN boards (filter by `userId` from session, NOT from request body/params for reads)
- [ ] Board ownership verified before update/delete (load board, check userId matches session)
- [ ] No access to other users' boards
- [ ] All input validated with Zod safeParse

### Critical Anti-Patterns to Avoid (Cumulative from Epics 1-3)

1. **Do NOT create separate TodoList aggregate** — Todo is a Board with `type: 'todo'` and single Column. Unified model per architecture.
2. **Do NOT throw in domain/application** — All methods return `Result<T>`.
3. **Do NOT create custom getters** beyond `get id()` — Use `entity.get('propName')`.
4. **Do NOT create dead code** — Don't create use cases for features in Story 4.2/4.3. Only create what 4.1 needs.
5. **Do NOT use `any` types** — Use proper typing for Drizzle join results.
6. **Do NOT skip ownership checks** — Every update/delete must verify userId.
7. **Challenge every file: "Is this needed for Story 4.1?"** — No kanban-specific code, no drag-drop, no calendar views.
8. **`getAuthenticatedUser()` duplication** — Continue existing copy-paste pattern per controller file (assessed as acceptable).

### Repository Pattern: Nested Aggregate Loading

The Board repository is more complex than Post or Mood because it loads a nested aggregate (Board → Column[] → Card[]). Follow this pattern:

```
findById(boardId):
  1. Query: SELECT * FROM board WHERE id = $1
  2. Query: SELECT * FROM "column" WHERE board_id = $1 ORDER BY position
  3. Query: SELECT * FROM card WHERE column_id IN ($columnIds) ORDER BY position
  4. Group cards by columnId (app-side)
  5. Map to domain: Board.reconstitute({ columns: [Column.reconstitute({ cards: [...] })] })

OR (preferred - single query with joins):
  1. SELECT b.*, c.*, ca.* FROM board b
     LEFT JOIN "column" c ON c.board_id = b.id
     LEFT JOIN card ca ON ca.column_id = c.id
     WHERE b.id = $1
     ORDER BY c.position, ca.position
  2. Group results app-side into Board → Column[] → Card[]
```

**create(board):**
```
Transaction:
  1. INSERT board
  2. INSERT columns (batch)
  3. INSERT cards (batch, per column)
```

### Entity Implementation Notes

Column and Card are **Entities** inside the Board aggregate. They use the Entity base class from ddd-kit, not Aggregate:

```typescript
// card.entity.ts
export class Card extends Entity<ICardProps> {
  get id(): CardId { return CardId.create(this._id); }

  toggleCompleted(): void {
    this._props.isCompleted = !this._props.isCompleted;
    this._props.updatedAt = new Date();
  }

  static create(props, id?): Card {
    return new Card({ ...props, isCompleted: false, createdAt: new Date() }, id ?? new UUID());
  }

  static reconstitute(props, id): Card {
    return new Card(props, id);
  }
}
```

**IMPORTANT:** Entities within an Aggregate are NOT managed by DI or their own repositories. They are always loaded/saved through the parent Aggregate (Board). No `IColumnRepository` or `ICardRepository` needed.

### Todo Creation Flow

When a user creates a todo list:
1. Controller receives: `{ title: "Groceries", items: [{ title: "Milk" }, { title: "Eggs" }] }`
2. Use case creates: `Board.create({ title, type: 'todo', userId, columns: [Column.create({ title: "Items", position: 0, cards: [Card.create({ title: "Milk", position: 0 }), Card.create({ title: "Eggs", position: 1000 })] })] })`
3. Repository persists Board + Column + Cards in a single transaction
4. Return DTO with full board structure

### Toggle Card (Check/Uncheck) Flow

This needs to be fast (<500ms per NFR5 equivalent).
1. Controller receives: `PUT /api/v1/boards/[boardId]` with `{ toggleCardIds: ["card-uuid"] }`
2. Use case loads Board (with columns and cards), finds card by ID, calls `card.toggleCompleted()`
3. Repository updates only the modified card(s) — NOT the entire board
4. Return updated board DTO

### UI Approach

For Story 4.1, the UI is straightforward CRUD — no drag-and-drop needed:
- Organization page with tabs (Todo tab active, Kanban/Chronology shown as "Coming Soon")
- List of todo boards (each board = a todo list)
- Each todo list shows title + checkable items
- Inline item adding (text input + enter to add)
- Click checkbox to toggle completion
- Edit list title inline
- Delete list with confirmation
- Empty state when no lists exist

### shadcn/ui Components to Use

- `Checkbox` — for todo item completion toggle
- `Card` — for wrapping each todo list
- `Input` — for title editing and item adding
- `Button` — for create/delete actions
- `Dialog` — for create new list dialog
- `Tabs` — for Todo/Kanban/Chronology view switching
- `AlertDialog` — for delete confirmation

**Install needed:** None expected — all components should already be available. Verify with `ls packages/ui/src/components/ui/`.

### Golden Reference Files

| Purpose | Source File | Adaptation |
|---|---|---|
| Aggregate pattern | `src/domain/post/post.aggregate.ts` | Board with nested Column/Card entities |
| Entity pattern | `packages/ddd-kit/src/entity.ts` | Card.entity.ts, Column.entity.ts |
| Value Object | `src/domain/post/value-objects/post-content.vo.ts` | BoardTitle, CardTitle VOs |
| Domain Event | `src/domain/post/events/post-created.event.ts` | BoardCreatedEvent |
| DB Schema | `packages/drizzle/src/schema/post.ts` | Three tables with FKs |
| Repository | `src/adapters/repositories/post.repository.ts` | Nested aggregate CRUD |
| Mapper | `src/adapters/mappers/post.mapper.ts` | Multi-table mapping |
| Port | `src/application/ports/post-repository.port.ts` | IBoardRepository |
| Use Case | `src/application/use-cases/post/create-post.use-case.ts` | CreateBoardUseCase |
| Controller | `src/adapters/controllers/post/post.controller.ts` | Board controllers |
| API Route | `app/api/v1/posts/route.ts` | Same re-export pattern |
| DTO | `src/application/dto/post/create-post.dto.ts` | Board DTOs |
| DI Module | `common/di/modules/post.module.ts` | Board module |
| DI Types | `common/di/types.ts` | Add board symbols |
| Tests | `src/application/use-cases/post/__tests__/create-post.use-case.test.ts` | Board use case tests |
| Page | `app/(protected)/mood/page.tsx` | Organization page layout |

### Project Structure Notes

```
# New files to create (Story 4.1 only)
packages/drizzle/src/schema/board.ts                               # DB schema

src/domain/board/board.aggregate.ts                                 # Aggregate
src/domain/board/board-id.ts                                        # ID
src/domain/board/column-id.ts                                       # ID
src/domain/board/card-id.ts                                         # ID
src/domain/board/column.entity.ts                                   # Entity
src/domain/board/card.entity.ts                                     # Entity
src/domain/board/value-objects/board-title.vo.ts                    # VO
src/domain/board/value-objects/board-type.vo.ts                     # VO
src/domain/board/value-objects/card-title.vo.ts                     # VO
src/domain/board/events/board-created.event.ts                      # Event

src/application/ports/board-repository.port.ts                      # Port
src/application/dto/board/create-board.dto.ts                       # DTO
src/application/dto/board/get-boards.dto.ts                         # DTO
src/application/dto/board/update-board.dto.ts                       # DTO
src/application/dto/board/delete-board.dto.ts                       # DTO
src/application/use-cases/board/create-board.use-case.ts            # UC
src/application/use-cases/board/get-user-boards.use-case.ts         # UC
src/application/use-cases/board/update-board.use-case.ts            # UC
src/application/use-cases/board/delete-board.use-case.ts            # UC
src/application/use-cases/board/__tests__/create-board.use-case.test.ts
src/application/use-cases/board/__tests__/get-user-boards.use-case.test.ts
src/application/use-cases/board/__tests__/update-board.use-case.test.ts
src/application/use-cases/board/__tests__/delete-board.use-case.test.ts

src/adapters/mappers/board.mapper.ts                                # Mapper
src/adapters/repositories/board.repository.ts                       # Repo
src/adapters/controllers/board/board.controller.ts                  # Controller

common/di/modules/board.module.ts                                   # DI module

app/api/v1/boards/route.ts                                          # API route
app/api/v1/boards/[boardId]/route.ts                                # API route

app/(protected)/organization/page.tsx                               # Page
app/(protected)/organization/_components/todo-list-view.tsx         # UI
app/(protected)/organization/_components/todo-board-card.tsx        # UI
app/(protected)/organization/_components/create-todo-dialog.tsx     # UI
app/(protected)/organization/_components/organization-empty-state.tsx # UI

# Files to modify
packages/drizzle/src/schema/index.ts                                # Export board schema
common/di/types.ts                                                  # Add DI symbols
common/di/container.ts                                              # Load board module
```

### Known Risks

1. **"column" is a PostgreSQL reserved word** — Consider `board_column` as table name instead. Test early.
2. **Nested aggregate persistence complexity** — Board with columns and cards needs transactional inserts/updates. More complex than flat Post/Mood repositories.
3. **Position ordering edge cases** — Integer gaps strategy works well initially but needs full reindex when gaps shrink to 0. Implement simple sequential ordering first (0, 1, 2...) and optimize if needed.

### What NOT to Build in Story 4.1

- No drag & drop (Story 4.2)
- No multiple columns per board UI (Story 4.2)
- No kanban board creation UI (Story 4.2)
- No calendar/chronology view (Story 4.3)
- No card progress tracking UI (Story 4.2)
- No card due date UI (Story 4.3)
- No IEventDispatcher wiring (Epic 7 — events are added via addEvent() but not dispatched yet)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.1]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 4]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture - Organization]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Conventions]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md#FR36-FR42]
- [Source: _bmad-output/implementation-artifacts/3-2-view-mood-history-and-charts.md#Dev Notes]
- [Source: _bmad-output/implementation-artifacts/epic-3-retro-2026-02-08.md#Action Items]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- Session required context continuation due to compaction (large story with 12 tasks)

### Completion Notes List

- Used `board_column` table name instead of `column` to avoid PostgreSQL reserved word
- BoardType VO uses `z.string().refine()` pattern (not `z.enum()`) for Zod 4 compatibility
- Tests use `CreateBoardUseCase` to create test boards indirectly (avoids ValueObject generic type inference issues)
- `update-board.use-case.ts` uses `input.title !== undefined` (not `input.title`) to properly validate empty string titles
- Repository uses 3-query pattern for findById (board, columns, cards) with app-side grouping
- Repository uses delete-and-reinsert pattern for update (simpler than diffing columns/cards)
- shadcn components (tabs, dialog, alert-dialog) installed; fixed absolute import paths to relative
- Pre-existing Biome error in chart.tsx (dangerouslySetInnerHTML) and warnings in friend/notification tests are unrelated

### Code Review Fixes Applied

**HIGH severity (6 fixes):**
- H1: Moved type filter from in-memory to DB-level (`findByUserId` with `and()` WHERE clause) — fixes pagination corruption
- H2: Added `response.ok` checks and error state feedback to all fetch handlers in `todo-board-card.tsx`
- H3: Changed `Column.findCard()` return from `Card | undefined` to `Option<Card>` per DDD rules
- H4: Removed redundant no-op card deletion in `update()` — already handled by CASCADE
- H5: Added `pgEnum('board_type')` for `board.type` column in schema
- H6: Fixed false-positive test — type filter test now verifies repo called with type param

**MEDIUM severity (12 fixes):**
- M7: Extracted shared Zod schemas to `common-board.dto.ts` (cardDtoSchema, columnDtoSchema, boardDtoSchema)
- M8: Extracted shared `boardToDto()` mapper for use case deduplication
- M9: Create board output now includes `updatedAt` field via shared schema
- M10: Extracted `hydrateBoards()` helper to eliminate ~80 lines of repository duplication
- M11: Controller `getUserBoards` now uses `getBoardsInputDtoSchema.safeParse()` instead of inline parseInt
- M12: Changed `Column.removeCard()` from `boolean` to `Result<void>`
- M13: Replaced duplicated `BoardDto`/`CardDto`/`ColumnDto` interfaces with `IBoardDto` import from shared DTOs
- M14: Replaced native HTML `<button>`/`<input>` with shadcn `<Button>`/`<Input>` across 5 UI files
- M15: Added form state reset (`resetForm()` + `handleOpenChange()`) in `CreateTodoDialog` when closed
- M16: Added `aria-label="Remove item"` to "x" buttons for accessibility
- M17: Removed unused `Option` import in get-user-boards test
- M18: Removed unused `BoardId` import in delete-board test

### File List

**Created:**
- `packages/drizzle/src/schema/board.ts` — DB schema (board, board_column, card tables)
- `apps/nextjs/src/domain/board/board-id.ts` — UUID-based ID
- `apps/nextjs/src/domain/board/column-id.ts` — UUID-based ID
- `apps/nextjs/src/domain/board/card-id.ts` — UUID-based ID
- `apps/nextjs/src/domain/board/value-objects/board-title.vo.ts` — min 1, max 100 chars
- `apps/nextjs/src/domain/board/value-objects/board-type.vo.ts` — 'todo' | 'kanban' enum VO
- `apps/nextjs/src/domain/board/value-objects/card-title.vo.ts` — min 1, max 200 chars
- `apps/nextjs/src/domain/board/card.entity.ts` — Card entity
- `apps/nextjs/src/domain/board/column.entity.ts` — Column entity
- `apps/nextjs/src/domain/board/board.aggregate.ts` — Board aggregate root
- `apps/nextjs/src/domain/board/events/board-created.event.ts` — Domain event
- `apps/nextjs/src/application/ports/board-repository.port.ts` — Repository port
- `apps/nextjs/src/adapters/mappers/board.mapper.ts` — Domain ↔ DB mapper
- `apps/nextjs/src/adapters/repositories/board.repository.ts` — Drizzle repository
- `apps/nextjs/src/application/dto/board/create-board.dto.ts` — Create board DTO
- `apps/nextjs/src/application/dto/board/get-boards.dto.ts` — Get boards DTO
- `apps/nextjs/src/application/dto/board/update-board.dto.ts` — Update board DTO
- `apps/nextjs/src/application/dto/board/delete-board.dto.ts` — Delete board DTO
- `apps/nextjs/src/application/use-cases/board/create-board.use-case.ts` — Create board UC
- `apps/nextjs/src/application/use-cases/board/get-user-boards.use-case.ts` — Get user boards UC
- `apps/nextjs/src/application/use-cases/board/update-board.use-case.ts` — Update board UC
- `apps/nextjs/src/application/use-cases/board/delete-board.use-case.ts` — Delete board UC
- `apps/nextjs/src/application/use-cases/board/__tests__/create-board.use-case.test.ts` — 11 tests
- `apps/nextjs/src/application/use-cases/board/__tests__/get-user-boards.use-case.test.ts` — 6 tests
- `apps/nextjs/src/application/use-cases/board/__tests__/update-board.use-case.test.ts` — 12 tests
- `apps/nextjs/src/application/use-cases/board/__tests__/delete-board.use-case.test.ts` — 5 tests
- `apps/nextjs/src/adapters/controllers/board/board.controller.ts` — 4 controllers
- `apps/nextjs/common/di/modules/board.module.ts` — DI module
- `apps/nextjs/app/api/v1/boards/route.ts` — GET + POST routes
- `apps/nextjs/app/api/v1/boards/[boardId]/route.ts` — PUT + DELETE routes
- `apps/nextjs/app/(protected)/organization/page.tsx` — Organization page
- `apps/nextjs/app/(protected)/organization/_components/todo-list-view.tsx` — Todo list view
- `apps/nextjs/app/(protected)/organization/_components/todo-board-card.tsx` — Todo board card
- `apps/nextjs/app/(protected)/organization/_components/create-todo-dialog.tsx` — Create dialog
- `apps/nextjs/app/(protected)/organization/_components/organization-empty-state.tsx` — Empty state

**Created (code review):**
- `apps/nextjs/src/application/dto/board/common-board.dto.ts` — Shared card/column/board Zod schemas + types
- `apps/nextjs/src/application/dto/board/board-dto.mapper.ts` — Shared board-to-DTO mapping function

**Modified:**
- `packages/drizzle/src/schema/index.ts` — Added board schema exports
- `packages/drizzle/src/schema/board.ts` — Added pgEnum for board type (code review fix)
- `apps/nextjs/common/di/types.ts` — Added board DI symbols + return types
- `apps/nextjs/common/di/container.ts` — Loaded board module
- `apps/nextjs/src/domain/board/column.entity.ts` — findCard→Option, removeCard→Result (code review fix)
- `apps/nextjs/src/domain/board/board.aggregate.ts` — Updated for Option/Result patterns (code review fix)
- `apps/nextjs/src/application/ports/board-repository.port.ts` — Added type param to findByUserId (code review fix)
- `apps/nextjs/src/adapters/mappers/board.mapper.ts` — Type casts for pgEnum (code review fix)
- `apps/nextjs/src/adapters/repositories/board.repository.ts` — DB-level type filter, hydrateBoards, cascade fix (code review fix)
- `apps/nextjs/src/adapters/controllers/board/board.controller.ts` — safeParse for getUserBoards (code review fix)
- `apps/nextjs/src/application/dto/board/create-board.dto.ts` — Uses shared schemas (code review fix)
- `apps/nextjs/src/application/dto/board/get-boards.dto.ts` — Uses shared schemas (code review fix)
- `apps/nextjs/src/application/dto/board/update-board.dto.ts` — Uses shared schemas (code review fix)
- `apps/nextjs/src/application/use-cases/board/create-board.use-case.ts` — Uses boardToDto mapper (code review fix)
- `apps/nextjs/src/application/use-cases/board/get-user-boards.use-case.ts` — DB-level type filter (code review fix)
- `apps/nextjs/src/application/use-cases/board/update-board.use-case.ts` — Uses boardToDto mapper (code review fix)
- `apps/nextjs/src/application/use-cases/board/__tests__/get-user-boards.use-case.test.ts` — Fixed type filter test (code review fix)
- `apps/nextjs/src/application/use-cases/board/__tests__/delete-board.use-case.test.ts` — Removed unused imports (code review fix)
- `packages/ui/src/components/ui/alert-dialog.tsx` — Fixed import paths
- `packages/ui/src/components/ui/dialog.tsx` — Fixed import paths
- `packages/ui/src/components/ui/tabs.tsx` — Fixed import paths
- `packages/ui/src/components/ui/button.tsx` — Fixed import paths
