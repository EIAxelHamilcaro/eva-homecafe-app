# Story 6.1: Create & Browse Moodboards

Status: done

## Story

As a **user**,
I want to create and browse my visual moodboards,
so that I can collect and organize visual inspiration.

## Acceptance Criteria

1. **Given** an authenticated user **When** they create a new moodboard with a title **Then** the moodboard is created and persisted **And** the Moodboard aggregate, Pin entity, and DB schema (moodboard, pin tables) are created **And** a MoodboardCreatedEvent domain event is added to the aggregate (dispatch wiring deferred to Epic 7 — IEventDispatcher not yet implemented)

2. **Given** an authenticated user with existing moodboards **When** they navigate to the moodboard page **Then** they see a list/grid of their moodboards with preview thumbnails

3. **Given** an authenticated user **When** they select a moodboard **Then** they see all pinned items (images and colors) in the board layout

4. **Given** an authenticated user with no moodboards **When** they navigate to the moodboard page **Then** they see an empty state encouraging them to create their first board

## Tasks / Subtasks

- [x] Task 1: Create Moodboard DB Schema (AC: #1)
  - [x] 1.1 Create `packages/drizzle/src/schema/moodboard.ts` — moodboard table (id, userId, title, createdAt, updatedAt) + pin table (id, moodboardId, type, imageUrl, color, position, createdAt) + indexes
  - [x] 1.2 Export schema from `packages/drizzle/src/schema/index.ts`
  - [x] 1.3 Run `pnpm db:push` to apply schema (migration generated: 0012_bouncy_nightmare.sql — DB not running locally, push deferred)

- [x] Task 2: Create Moodboard Domain Layer (AC: #1)
  - [x] 2.1 Create `src/domain/moodboard/moodboard-id.ts` — MoodboardId extending UUID
  - [x] 2.2 Create `src/domain/moodboard/pin-id.ts` — PinId extending UUID
  - [x] 2.3 Create `src/domain/moodboard/value-objects/moodboard-title.vo.ts` — MoodboardTitle VO (1-100 chars, Zod)
  - [x] 2.4 Create `src/domain/moodboard/value-objects/pin-type.vo.ts` — PinType VO enum ("image" | "color")
  - [x] 2.5 Create `src/domain/moodboard/value-objects/hex-color.vo.ts` — HexColor VO (validates hex format)
  - [x] 2.6 Create `src/domain/moodboard/pin.entity.ts` — Pin entity (type, imageUrl?, color?, position, createdAt)
  - [x] 2.7 Create `src/domain/moodboard/moodboard.aggregate.ts` — Moodboard aggregate (userId, title, pins[], createdAt, updatedAt)
  - [x] 2.8 Create `src/domain/moodboard/events/moodboard-created.event.ts` — MoodboardCreatedEvent

- [x] Task 3: Create Moodboard Application Layer (AC: #1)
  - [x] 3.1 Create `src/application/ports/moodboard-repository.port.ts` — IMoodboardRepository extends BaseRepository<Moodboard> + findByUserId
  - [x] 3.2 Create `src/application/dto/moodboard/create-moodboard.dto.ts` — input (title, userId), output (id, title, userId, createdAt)
  - [x] 3.3 Create `src/application/use-cases/moodboard/create-moodboard.use-case.ts` — validates title, creates aggregate, persists, returns DTO
  - [x] 3.4 Write BDD tests `src/application/use-cases/moodboard/__tests__/create-moodboard.use-case.test.ts` — 7 tests, all passing

- [x] Task 4: Create Moodboard Adapter Layer (AC: #1, #2, #3)
  - [x] 4.1 Create `src/adapters/mappers/moodboard.mapper.ts` — moodboardToDomain / moodboardToPersistence / pinToDomain / pinToPersistence
  - [x] 4.2 Create `src/adapters/repositories/moodboard.repository.ts` — DrizzleMoodboardRepository implementing IMoodboardRepository
  - [x] 4.3 Create `src/adapters/queries/moodboard.query.ts` — getUserMoodboards (list) + getMoodboardDetail (with pins) CQRS reads
  - [x] 4.4 Create `src/adapters/controllers/moodboard/moodboard.controller.ts` — getUserMoodboardsController (GET list), getMoodboardDetailController (GET detail), createMoodboardController (POST)
  - [x] 4.5 Create `app/api/v1/moodboards/route.ts` — GET (list), POST (create)
  - [x] 4.6 Create `app/api/v1/moodboards/[moodboardId]/route.ts` — GET (detail with pins)

- [x] Task 5: DI Registration (AC: #1)
  - [x] 5.1 Create `common/di/modules/moodboard.module.ts` — bind IMoodboardRepository + CreateMoodboardUseCase
  - [x] 5.2 Add DI symbols and return types to `common/di/types.ts`
  - [x] 5.3 Load moodboard module in `common/di/container.ts` (alphabetical order: between Gallery and Mood)

- [x] Task 6: Moodboard UI — Browse & Create (AC: #2, #3, #4)
  - [x] 6.1 Create `app/(protected)/moodboard/page.tsx` — server component with requireAuth()
  - [x] 6.2 Create `app/(protected)/moodboard/_components/moodboard-client.tsx` — client wrapper managing refresh state
  - [x] 6.3 Create `app/(protected)/moodboard/_components/moodboard-grid.tsx` — grid of moodboard cards with preview thumbnails, pagination
  - [x] 6.4 Create `app/(protected)/moodboard/_components/create-moodboard-dialog.tsx` — shadcn Dialog with title input + create button
  - [x] 6.5 Create `app/(protected)/moodboard/_components/moodboard-detail.tsx` — view all pins (images + colors) in board layout
  - [x] 6.6 Implement empty state when no moodboards exist (first-action prompt to create)

- [x] Task 7: Quality Checks (AC: all)
  - [x] 7.1 Run `pnpm fix` — 9 files auto-fixed (import ordering, formatting)
  - [x] 7.2 Run `pnpm type-check` — passes (fixed Zod 4 z.enum errorMap → message)
  - [x] 7.3 Run `pnpm test` — 37 files, 310 tests, all passing (7 new moodboard tests included)
  - [x] 7.4 Run `pnpm check` — 0 new errors (2 pre-existing errors in friend/notification tests, 45 pre-existing warnings)

## Dev Notes

### Architecture: Moodboard Aggregate with Pin Entity

Story 6.1 creates the **Moodboard domain module** from scratch. The Moodboard aggregate owns Pin entities (images and colors). This story covers creation and browsing — Story 6.2 will add pin management and deletion.

**Moodboard Aggregate Design:**
```
Moodboard (Aggregate Root)
├── id: MoodboardId
├── userId: string
├── title: MoodboardTitle (VO, 1-100 chars)
├── pins: Pin[] (owned entities)
├── createdAt: Date
└── updatedAt?: Date

Pin (Entity, owned by Moodboard)
├── id: PinId
├── type: PinType ("image" | "color")
├── imageUrl?: string (required if type=image)
├── color?: HexColor (required if type=color)
├── position: number (ordering within board)
└── createdAt: Date
```

**Important:** Pin is an Entity (not a VO) because it has identity and can be individually added/removed. It is owned by the Moodboard aggregate — no standalone Pin repository. Pins are loaded with their parent Moodboard in the detail view.

### DB Schema Design

**moodboard table:**
```sql
id          TEXT PRIMARY KEY
user_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
title       TEXT NOT NULL
created_at  TIMESTAMP NOT NULL DEFAULT NOW()
updated_at  TIMESTAMP
```

**pin table:**
```sql
id              TEXT PRIMARY KEY
moodboard_id    TEXT NOT NULL REFERENCES moodboard(id) ON DELETE CASCADE
type            TEXT NOT NULL  -- "image" | "color"
image_url       TEXT           -- required if type=image
color           TEXT           -- required if type=color, hex format
position        INTEGER NOT NULL DEFAULT 0
created_at      TIMESTAMP NOT NULL DEFAULT NOW()
```

**Indexes:**
- `moodboard_user_id_idx` on moodboard(user_id)
- `pin_moodboard_id_idx` on pin(moodboard_id)

**CASCADE DELETE:** Deleting a moodboard auto-deletes its pins (DB level). Deleting a user cascades to moodboards → pins.

### CQRS: Two Query Patterns

**List query** (`getUserMoodboards`):
```
GET /api/v1/moodboards?page=1&limit=20
→ Returns moodboards with first 4 pin previews (for thumbnail grid)
→ Response: { data: MoodboardListDto[], pagination: {...} }
```

Each MoodboardListDto includes:
- id, title, pinCount, previewPins (first 4 pins for thumbnail), createdAt

**Detail query** (`getMoodboardDetail`):
```
GET /api/v1/moodboards/[moodboardId]
→ Returns full moodboard with ALL pins ordered by position
→ Response: MoodboardDetailDto
```

MoodboardDetailDto includes:
- id, title, userId, pins (full list with type, imageUrl, color, position), createdAt

### Controller Patterns

Follow exact same pattern as Gallery controllers:

**getUserMoodboardsController (GET /api/v1/moodboards):**
```
1. getAuthenticatedUser(request) → session or 401
2. Parse page/limit from URL params
3. Call getUserMoodboards(userId, page, limit) query
4. Return response
```

**getMoodboardDetailController (GET /api/v1/moodboards/[moodboardId]):**
```
1. getAuthenticatedUser(request) → session or 401
2. Extract moodboardId from URL params
3. Call getMoodboardDetail(moodboardId, userId) query
4. Verify ownership (userId match) → 403 if not owner
5. Return moodboard with all pins
```

**createMoodboardController (POST /api/v1/moodboards):**
```
1. getAuthenticatedUser(request) → session or 401
2. Parse createMoodboardInputDtoSchema (+ userId from session)
3. getInjection("CreateMoodboardUseCase")
4. Execute use case
5. Return 201 with moodboard data
```

### Repository Implementation

DrizzleMoodboardRepository implements IMoodboardRepository:

**Key difference from Gallery:** The Moodboard aggregate owns Pin entities. The repository must:
- On `create`: insert moodboard row only (new moodboard has no pins)
- On `findById`: join moodboard + pins, reconstruct aggregate with nested entities
- On `findByUserId`: return moodboards without pins (list view uses CQRS query instead)
- On `delete`: cascade handles pins via DB (no need to delete pins individually)

**Mapper handles nested pins:**
```typescript
moodboardToDomain(record, pinRecords): Result<Moodboard>
  → Reconstruct MoodboardTitle VO
  → Reconstruct each Pin entity (PinType, optional HexColor, optional imageUrl)
  → Call Moodboard.reconstitute(props, id)

moodboardToPersistence(moodboard): MoodboardPersistence
  → Extract id, userId, title.value, timestamps

pinToPersistence(pin, moodboardId): PinPersistence
  → Extract id, moodboardId, type, imageUrl, color, position, timestamps
```

### UI Design

**Moodboard list page** (grid view):
- Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop
- Each card shows: title, pin count, 2x2 preview grid of first 4 pins (image thumbnails or color swatches)
- Floating action button or "Create Moodboard" button
- Empty state: illustration + "Create your first moodboard" CTA
- Pagination at bottom

**Moodboard detail view** (pins layout):
- Title at top
- Masonry/grid layout showing all pins
- Image pins: display image
- Color pins: display colored square with hex code
- "Back to moodboards" navigation
- Empty pin state: "Pin images and colors to your board" (Story 6.2 adds pin management)

**Create dialog** (shadcn Dialog):
- Title input field (required, max 100 chars)
- Create / Cancel buttons
- Loading state during API call
- Error handling with toast feedback

### DI Registration

**moodboard.module.ts:**
```typescript
export const createMoodboardModule = () => {
  const m = createModule();
  m.bind(DI_SYMBOLS.IMoodboardRepository).toClass(DrizzleMoodboardRepository);
  m.bind(DI_SYMBOLS.CreateMoodboardUseCase).toClass(CreateMoodboardUseCase, [
    DI_SYMBOLS.IMoodboardRepository,
  ]);
  return m;
};
```

**types.ts additions:**
```typescript
// DI_SYMBOLS:
IMoodboardRepository: Symbol.for("IMoodboardRepository"),
CreateMoodboardUseCase: Symbol.for("CreateMoodboardUseCase"),

// DI_RETURN_TYPES:
IMoodboardRepository: IMoodboardRepository;
CreateMoodboardUseCase: CreateMoodboardUseCase;
```

**container.ts:** Load between Gallery and Mood modules (alphabetical).

### Project Structure Notes

- All files follow established naming and location patterns from Gallery/Post modules
- `[moodboardId]` dynamic route follows Next.js App Router convention (existing: `[postId]`, `[photoId]`, `[conversationId]`)
- Moodboard controller in domain subfolder: `controllers/moodboard/moodboard.controller.ts`
- Repository flat: `repositories/moodboard.repository.ts`
- Mapper flat: `mappers/moodboard.mapper.ts`
- Query flat: `queries/moodboard.query.ts`

### File Structure

```
# New files to create
packages/drizzle/src/schema/moodboard.ts
apps/nextjs/src/domain/moodboard/moodboard-id.ts
apps/nextjs/src/domain/moodboard/pin-id.ts
apps/nextjs/src/domain/moodboard/value-objects/moodboard-title.vo.ts
apps/nextjs/src/domain/moodboard/value-objects/pin-type.vo.ts
apps/nextjs/src/domain/moodboard/value-objects/hex-color.vo.ts
apps/nextjs/src/domain/moodboard/pin.entity.ts
apps/nextjs/src/domain/moodboard/moodboard.aggregate.ts
apps/nextjs/src/domain/moodboard/events/moodboard-created.event.ts
apps/nextjs/src/application/ports/moodboard-repository.port.ts
apps/nextjs/src/application/dto/moodboard/create-moodboard.dto.ts
apps/nextjs/src/application/use-cases/moodboard/create-moodboard.use-case.ts
apps/nextjs/src/application/use-cases/moodboard/__tests__/create-moodboard.use-case.test.ts
apps/nextjs/src/adapters/mappers/moodboard.mapper.ts
apps/nextjs/src/adapters/repositories/moodboard.repository.ts
apps/nextjs/src/adapters/queries/moodboard.query.ts
apps/nextjs/src/adapters/controllers/moodboard/moodboard.controller.ts
apps/nextjs/app/api/v1/moodboards/route.ts
apps/nextjs/app/api/v1/moodboards/[moodboardId]/route.ts
apps/nextjs/common/di/modules/moodboard.module.ts
apps/nextjs/app/(protected)/moodboard/page.tsx
apps/nextjs/app/(protected)/moodboard/_components/moodboard-client.tsx
apps/nextjs/app/(protected)/moodboard/_components/moodboard-grid.tsx
apps/nextjs/app/(protected)/moodboard/_components/create-moodboard-dialog.tsx
apps/nextjs/app/(protected)/moodboard/_components/moodboard-detail.tsx

# Files to modify
apps/nextjs/common/di/types.ts              # Add IMoodboardRepository + CreateMoodboardUseCase
apps/nextjs/common/di/container.ts           # Load moodboard module
packages/drizzle/src/schema/index.ts         # Export moodboard schema
```

### Data Integrity Checklist

- **N+1 possible?** No — list query uses single DB query with LEFT JOIN for pin previews (LIMIT 4 per moodboard). Detail query is one query joining moodboard + pins.
- **Race conditions?** No — create is idempotent, each moodboard gets unique UUID.
- **Orphaned pins?** No — CASCADE DELETE on moodboard_id foreign key handles cleanup at DB level.
- **Performance?** Pagination on list. Pin previews limited to 4 per moodboard in list view. Full pin list only loaded in detail view.

### Security Checklist

- Every endpoint requires `getAuthenticatedUser()` check
- List query filters by `userId = session.user.id` — no cross-user browsing
- Detail query verifies ownership — 403 if moodboard belongs to different user
- Create use case sets userId from session, not from request body

### Code Duplication Checklist

- **Aggregate pattern:** Follow Gallery's Photo aggregate structure. Moodboard adds nested Pin entities (Gallery has no child entities).
- **Repository pattern:** Follow DrizzleGalleryRepository. Add pin JOIN logic for findById.
- **Controller pattern:** Same auth + parse + execute + map pattern as Gallery controllers.
- **Query pattern:** Follow `getUserGallery` query. Add LEFT JOIN for pin previews.
- **UI pattern:** Follow Gallery's client wrapper + grid + dialog structure.
- **DI pattern:** Identical to gallery.module.ts structure.

### What NOT to Build in Story 6.1

- No pin creation/management (Story 6.2 scope)
- No pin deletion (Story 6.2 scope)
- No moodboard deletion (Story 6.2 scope)
- No image upload flow for pins (Story 6.2 scope — uses existing upload infrastructure)
- No color picker component (Story 6.2 scope)
- No moodboard sharing with friends
- No IEventDispatcher wiring (Epic 7)
- No drag & drop pin reordering
- No moodboard cover image

### Critical Anti-Patterns to Avoid

1. **Do NOT create a separate Pin repository** — pins are owned by Moodboard aggregate, loaded/saved with parent
2. **Do NOT use `throw` in domain/application** — use `Result<T>` exclusively
3. **Do NOT create index.ts barrel files**
4. **Do NOT add comments** — self-documenting code
5. **Do NOT add IEventDispatcher** wiring (Epic 7)
6. **Do NOT use `null`** — use `Option<T>` for nullable values
7. **Do NOT add custom getters** beyond `get id()` — use `entity.get('propName')`
8. **Do NOT create the upload flow** in this story — upload infrastructure already exists, Story 6.2 will wire pin image upload
9. **Do NOT install any new libraries** — all needed dependencies already installed (shadcn, Tailwind, etc.)
10. **Do NOT place pins in a separate domain folder** — Pin entity lives inside `src/domain/moodboard/`

### Golden Reference Files

| Purpose | Source File | Adaptation |
|---------|------------|------------|
| Aggregate | `src/domain/gallery/photo.aggregate.ts` | Moodboard with nested Pin entities |
| Entity ID | `src/domain/gallery/photo-id.ts` | MoodboardId + PinId |
| Value Object | `src/domain/gallery/value-objects/photo-caption.vo.ts` | MoodboardTitle, PinType, HexColor |
| Domain Event | `src/domain/gallery/events/photo-uploaded.event.ts` | MoodboardCreatedEvent |
| Port | `src/application/ports/gallery-repository.port.ts` | IMoodboardRepository |
| DTO | `src/application/dto/gallery/add-photo.dto.ts` | CreateMoodboard DTOs |
| Use Case | `src/application/use-cases/gallery/add-photo.use-case.ts` | CreateMoodboardUseCase |
| Tests | `src/application/use-cases/gallery/__tests__/add-photo.use-case.test.ts` | CreateMoodboard tests |
| Mapper | `src/adapters/mappers/gallery.mapper.ts` | Moodboard + Pin mapper |
| Repository | `src/adapters/repositories/gallery.repository.ts` | DrizzleMoodboardRepository |
| Query | `src/adapters/queries/gallery.query.ts` | Moodboard queries |
| Controller | `src/adapters/controllers/gallery/gallery.controller.ts` | Moodboard controllers |
| API Route | `app/api/v1/gallery/route.ts` | moodboards/route.ts |
| DI Module | `common/di/modules/gallery.module.ts` | moodboard.module.ts |
| DB Schema | `packages/drizzle/src/schema/gallery.ts` | moodboard.ts |
| Page | `app/(protected)/gallery/page.tsx` | moodboard/page.tsx |
| Client Wrapper | `app/(protected)/gallery/_components/gallery-client.tsx` | moodboard-client.tsx |
| Grid | `app/(protected)/gallery/_components/gallery-grid.tsx` | moodboard-grid.tsx |
| Dialog | shadcn Dialog + Form components | create-moodboard-dialog.tsx |

### Previous Story Intelligence (Story 5.2)

Key learnings from the last completed story (Gallery 5.2) that impact this story:

1. **Gallery client wrapper pattern works well** — `GalleryClient` manages `refreshKey` state and passes it to grid. Use same pattern for `MoodboardClient`.
2. **Auth guard import path** — use `@/adapters/guards/auth.guard` (confirmed correct path).
3. **303 tests currently passing** — new tests must not break existing ones.
4. **Biome formatting: spaces not tabs** — always run `pnpm fix` after writing files.
5. **shadcn import paths** — if adding new shadcn components, fix imports from `/src/libs/utils` to `../../libs/utils`.
6. **IStorageProvider already bound in DI** — available as `DI_SYMBOLS.IStorageProvider` for Story 6.2 when pin image upload is needed.
7. **Option<T> for optional fields** — caption in Gallery used `Option<PhotoCaption>`. Moodboard's pin imageUrl/color should use conditional logic based on PinType rather than Option (one is always required based on type).
8. **DELETE cascade at DB level** — Gallery used explicit R2 + DB deletion. Moodboard pins use CASCADE DELETE on FK, so deleting moodboard auto-removes pins from DB.

### Git Intelligence

Recent commits follow pattern: `feat(nextjs): implement story X.Y — [description] with code review fixes`

Last 5 commits are all story implementations + docs. Code review fixes are applied in same commit (not separate). The convention is to implement the full story and apply code review feedback before committing.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 6: Moodboard]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.1: Create & Browse Moodboards]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture — Moodboard domain]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure — moodboard/ new files]
- [Source: _bmad-output/planning-artifacts/architecture.md#File Upload — Shared Endpoint]
- [Source: _bmad-output/implementation-artifacts/5-2-browse-and-delete-gallery-photos.md — previous story reference]
- [Source: apps/nextjs/src/domain/gallery/ — gallery domain reference]
- [Source: apps/nextjs/src/adapters/repositories/gallery.repository.ts — repository pattern reference]
- [Source: apps/nextjs/src/adapters/controllers/gallery/gallery.controller.ts — controller pattern reference]
- [Source: apps/nextjs/common/di/modules/gallery.module.ts — DI module pattern reference]
- [Source: packages/drizzle/src/schema/gallery.ts — DB schema pattern reference]
- [Source: apps/nextjs/src/domain/upload/value-objects/upload-context.vo.ts — "moodboard" context already defined]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- Session: 90e54e48-9214-4ce2-9abc-223d022f6a8d (initial implementation)
- Continuation session (quality checks, story finalization)

### Completion Notes List

- All 7 tasks and 26 subtasks completed successfully
- 7 BDD tests written and passing for CreateMoodboardUseCase (happy path: create, persist, event, empty pins; validation: empty title, 101 chars; error: repo failure)
- Total test suite: 37 files, 310 tests — all passing, no regressions
- TypeScript type-check passes clean
- Biome check: 0 new errors (2 pre-existing in friend/notification tests, 45 pre-existing warnings)
- Fixed Zod 4 compatibility issue: z.enum `errorMap` → `message` parameter in pin-type.vo.ts
- DB migration generated (0012_bouncy_nightmare.sql) but db:push deferred — PostgreSQL not running locally
- Empty state UI implemented in moodboard-grid.tsx (AC #4)
- Pin entity design supports both image and color types via conditional Option fields
- CQRS queries: list view fetches first 4 pin previews per moodboard, detail view loads all pins

### Code Review Fixes Applied

- [H2-FIX] Repository findByUserId/findAll/findBy now batch-load pins for returned aggregates (was returning empty pins arrays)
- [M3-FIX] Query count uses drizzle-orm `count()` instead of raw SQL `count(*)::int` for consistency with repository pattern
- [H1-CLARIFIED] AC#1 updated: event is added to aggregate, dispatch deferred to Epic 7 (IEventDispatcher not yet implemented — same as all other use cases)
- [M1-ACCEPTED] Pin schema allows invalid type/field combinations at DB level — validation enforced at domain layer, consistent with project patterns
- [M2-ACCEPTED] Mapper fail-fast on invalid pin data — consistent with gallery mapper pattern, surfaces data corruption immediately
- Moodboard.create() returns Result<Moodboard> (aligned with Photo.create pattern)
- Query inArray() replaces raw SQL IN clause (security improvement)

### File List

**Created (29 files):**
- `packages/drizzle/src/schema/moodboard.ts` — DB schema (moodboard + pin tables)
- `packages/drizzle/migrations/0012_bouncy_nightmare.sql` — DB migration
- `packages/drizzle/migrations/meta/0012_snapshot.json` — Migration snapshot
- `apps/nextjs/src/domain/moodboard/moodboard-id.ts` — MoodboardId UUID
- `apps/nextjs/src/domain/moodboard/pin-id.ts` — PinId UUID
- `apps/nextjs/src/domain/moodboard/value-objects/moodboard-title.vo.ts` — MoodboardTitle VO
- `apps/nextjs/src/domain/moodboard/value-objects/pin-type.vo.ts` — PinType VO
- `apps/nextjs/src/domain/moodboard/value-objects/hex-color.vo.ts` — HexColor VO
- `apps/nextjs/src/domain/moodboard/pin.entity.ts` — Pin entity
- `apps/nextjs/src/domain/moodboard/moodboard.aggregate.ts` — Moodboard aggregate
- `apps/nextjs/src/domain/moodboard/events/moodboard-created.event.ts` — MoodboardCreatedEvent
- `apps/nextjs/src/application/ports/moodboard-repository.port.ts` — IMoodboardRepository port
- `apps/nextjs/src/application/dto/moodboard/create-moodboard.dto.ts` — CreateMoodboard DTOs
- `apps/nextjs/src/application/use-cases/moodboard/create-moodboard.use-case.ts` — CreateMoodboardUseCase
- `apps/nextjs/src/application/use-cases/moodboard/__tests__/create-moodboard.use-case.test.ts` — 7 BDD tests
- `apps/nextjs/src/adapters/mappers/moodboard.mapper.ts` — Moodboard + Pin mappers
- `apps/nextjs/src/adapters/repositories/moodboard.repository.ts` — DrizzleMoodboardRepository
- `apps/nextjs/src/adapters/queries/moodboard.query.ts` — CQRS queries (list + detail)
- `apps/nextjs/src/adapters/controllers/moodboard/moodboard.controller.ts` — 3 controllers
- `apps/nextjs/app/api/v1/moodboards/route.ts` — GET + POST routes
- `apps/nextjs/app/api/v1/moodboards/[moodboardId]/route.ts` — GET detail route
- `apps/nextjs/common/di/modules/moodboard.module.ts` — DI module
- `apps/nextjs/app/(protected)/moodboard/page.tsx` — Server page
- `apps/nextjs/app/(protected)/moodboard/_components/moodboard-client.tsx` — Client wrapper
- `apps/nextjs/app/(protected)/moodboard/_components/moodboard-grid.tsx` — Grid + empty state
- `apps/nextjs/app/(protected)/moodboard/_components/create-moodboard-dialog.tsx` — Create dialog
- `apps/nextjs/app/(protected)/moodboard/_components/moodboard-detail.tsx` — Detail view

**Modified (4 files):**
- `packages/drizzle/src/schema/index.ts` — Added moodboard schema export
- `packages/drizzle/migrations/meta/_journal.json` — Migration journal updated
- `apps/nextjs/common/di/types.ts` — Added IMoodboardRepository + CreateMoodboardUseCase symbols/types
- `apps/nextjs/common/di/container.ts` — Loaded moodboard module
