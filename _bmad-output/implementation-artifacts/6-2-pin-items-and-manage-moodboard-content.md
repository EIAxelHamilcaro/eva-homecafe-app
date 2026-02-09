# Story 6.2: Pin Items & Manage Moodboard Content

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to pin images and colors to my moodboards and remove items,
so that I can curate my visual inspiration freely.

## Acceptance Criteria

1. **Given** an authenticated user viewing a moodboard **When** they pin an image (uploaded via shared upload endpoint, context: moodboard) **Then** the image pin is added to the moodboard and displayed

2. **Given** an authenticated user viewing a moodboard **When** they pin a color (via color picker) **Then** the color pin is added to the moodboard and displayed

3. **Given** an authenticated user viewing a moodboard **When** they delete a pin (image or color) **Then** the pin is removed from the board

4. **Given** an authenticated user **When** they delete an entire moodboard **Then** the moodboard and all its pins are permanently removed

5. **Given** an authenticated user **When** they attempt to modify another user's moodboard **Then** the system returns a 403 Forbidden error

## Tasks / Subtasks

- [x] Task 1: Extend Moodboard Aggregate with Pin Management (AC: #1, #2, #3, #4)
  - [x] 1.1 Add `addPin(pin: Pin): Result<void>` method to Moodboard aggregate — appends pin, validates duplicates and max limit (50), sets updatedAt, adds PinAddedEvent
  - [x] 1.2 Add `removePin(pinId: PinId): Result<void>` method — removes pin by ID, recalculates positions, sets updatedAt, adds PinRemovedEvent. Returns Result.fail if pin not found
  - [x] 1.3 Create `src/domain/moodboard/events/pin-added.event.ts` — PinAddedEvent with moodboardId, pinId, pinType
  - [x] 1.4 Create `src/domain/moodboard/events/pin-removed.event.ts` — PinRemovedEvent with moodboardId, pinId
  - [x] 1.5 Create `src/domain/moodboard/events/moodboard-deleted.event.ts` — MoodboardDeletedEvent with moodboardId, userId

- [x] Task 2: Create Add Pin Use Case (AC: #1, #2, #5)
  - [x] 2.1 Create `src/application/dto/moodboard/add-pin.dto.ts` — discriminatedUnion input (moodboardId, userId, type, imageUrl/color), output (id, type, imageUrl?, color?, position, createdAt)
  - [x] 2.2 Create `src/application/use-cases/moodboard/add-pin.use-case.ts` — validates input, verifies moodboard ownership, creates Pin entity, calls aggregate.addPin(), persists via repository.update(), returns DTO
  - [x] 2.3 Write BDD tests `src/application/use-cases/moodboard/__tests__/add-pin.use-case.test.ts` (9 tests)

- [x] Task 3: Create Delete Pin Use Case (AC: #3, #5)
  - [x] 3.1 Create `src/application/dto/moodboard/delete-pin.dto.ts` — input (moodboardId, pinId, userId), output (id)
  - [x] 3.2 Create `src/application/use-cases/moodboard/delete-pin.use-case.ts` — verifies ownership, calls aggregate.removePin(), persists FIRST, then handles best-effort R2 cleanup
  - [x] 3.3 Write BDD tests `src/application/use-cases/moodboard/__tests__/delete-pin.use-case.test.ts` (8 tests)

- [x] Task 4: Create Delete Moodboard Use Case (AC: #4, #5)
  - [x] 4.1 Create `src/application/dto/moodboard/delete-moodboard.dto.ts` — input (moodboardId, userId), output (id)
  - [x] 4.2 Create `src/application/use-cases/moodboard/delete-moodboard.use-case.ts` — verifies ownership, deletes moodboard FIRST (CASCADE removes pins), then best-effort R2 cleanup
  - [x] 4.3 Write BDD tests `src/application/use-cases/moodboard/__tests__/delete-moodboard.use-case.test.ts` (7 tests)

- [x] Task 5: Extend Moodboard Repository for Pin Operations (AC: #1, #2, #3)
  - [x] 5.1 Repository update() uses full-sync approach: delete-all pins + re-insert within transaction
  - [x] 5.2 Transaction wrapping: update() uses db.transaction() when no trx provided (follows board.repository pattern)
  - [x] 5.3 Ensure `update()` properly handles aggregate updatedAt changes

- [x] Task 6: Create Controllers & API Routes (AC: #1, #2, #3, #4, #5)
  - [x] 6.1 Add `addPinController` to `src/adapters/controllers/moodboard/moodboard.controller.ts` — POST /moodboards/[moodboardId]/pins
  - [x] 6.2 Add `deletePinController` to moodboard.controller.ts — DELETE /moodboards/[moodboardId]/pins/[pinId]
  - [x] 6.3 Add `deleteMoodboardController` to moodboard.controller.ts — DELETE /moodboards/[moodboardId]
  - [x] 6.4 Create `app/api/v1/moodboards/[moodboardId]/pins/route.ts` (POST) and `pins/[pinId]/route.ts` (DELETE)
  - [x] 6.5 Update `app/api/v1/moodboards/[moodboardId]/route.ts` — add DELETE method export

- [x] Task 7: DI Registration (AC: all)
  - [x] 7.1 Add DI symbols for AddPinUseCase, DeletePinUseCase, DeleteMoodboardUseCase to `common/di/types.ts`
  - [x] 7.2 Add DI return types for all 3 new use cases
  - [x] 7.3 Bind new use cases in `common/di/modules/moodboard.module.ts` with dependencies (IMoodboardRepository, IStorageProvider for delete use cases)

- [x] Task 8: Moodboard Detail UI — Pin Management (AC: #1, #2, #3, #4)
  - [x] 8.1 Create `app/(protected)/moodboard/_components/add-pin-dialog.tsx` — Dialog with two tabs: "Image" (upload via shared upload endpoint) and "Color" (color picker input)
  - [x] 8.2 Create `app/(protected)/moodboard/_components/delete-moodboard-dialog.tsx` — Confirmation dialog for moodboard deletion
  - [x] 8.3 Update `moodboard-detail.tsx` — Add "Add Pin" button, delete button per pin, delete moodboard button, refresh after mutations
  - [x] 8.4 Implement color picker input (native HTML color input or hex text input with preview)
  - [x] 8.5 Implement image upload flow using existing upload endpoint (POST /api/v1/upload with context: "moodboard") + direct R2 upload

- [x] Task 9: Quality Checks (AC: all)
  - [x] 9.1 Run `pnpm fix` — auto-fix formatting
  - [x] 9.2 Run `pnpm type-check` — TypeScript passes (0 errors)
  - [x] 9.3 Run `pnpm test` — all 334 tests pass (310 existing + 24 new)
  - [x] 9.4 Run `pnpm check` — 0 new Biome errors

## Dev Notes

### Architecture: Extending the Moodboard Aggregate

Story 6.2 extends the existing Moodboard domain module created in Story 6.1. The core Moodboard aggregate, Pin entity, value objects, DB schema, repository, mappers, and queries are all **already in place**. This story adds:
- Aggregate behavior (add/remove pins)
- New use cases (AddPin, DeletePin, DeleteMoodboard)
- New controllers and API routes
- UI for pin management

### What Already Exists (DO NOT Recreate)

**Domain:**
- `Moodboard` aggregate with `userId`, `title`, `pins[]`, `createdAt`, `updatedAt`
- `Pin` entity with `type` (PinType), `imageUrl` (Option<string>), `color` (Option<HexColor>), `position`, `createdAt`
- Value Objects: `MoodboardTitle` (1-100 chars), `PinType` ("image" | "color"), `HexColor` (validates hex)
- `MoodboardCreatedEvent`
- `MoodboardId`, `PinId` (both extend UUID)

**Application:**
- `IMoodboardRepository` extends BaseRepository<Moodboard> + `findByUserId()`
- `CreateMoodboardUseCase` + DTOs

**Adapters:**
- `DrizzleMoodboardRepository` — FULLY IMPLEMENTED with create, update, delete, findById (with pins JOIN), findByUserId
- `moodboard.mapper.ts` — moodboardToDomain/toPersistence + pinToDomain/toPersistence
- `moodboard.query.ts` — getUserMoodboards (list with 4 pin previews) + getMoodboardDetail (full pins)
- Controllers: getUserMoodboardsController, getMoodboardDetailController, createMoodboardController

**DB Schema:** moodboard table + pin table with CASCADE DELETE on foreign key. No schema changes needed.

**Upload:** `UploadContextEnum.MOODBOARD = "moodboard"` already supported. IStorageProvider already bound in DI.

**UI:** Page, client wrapper, grid, detail view, create dialog all exist.

### Pin Management Design

**Adding an Image Pin (AC #1):**
```
1. User clicks "Add Pin" → selects "Image" tab
2. Client calls POST /api/v1/upload { context: "moodboard", fileName, fileType, fileSize }
3. Server returns presigned R2 URL
4. Client uploads image directly to R2
5. Client calls POST /api/v1/moodboards/[moodboardId]/pins { type: "image", imageUrl: r2Url }
6. Server: AddPinUseCase validates ownership → creates Pin entity → Moodboard.addPin() → repo.update() + repo.addPin()
7. Response: 201 with pin data
```

**Adding a Color Pin (AC #2):**
```
1. User clicks "Add Pin" → selects "Color" tab
2. User picks color via color input or enters hex code
3. Client calls POST /api/v1/moodboards/[moodboardId]/pins { type: "color", color: "#FF5733" }
4. Server: AddPinUseCase validates → creates Pin → addPin() → persist
5. Response: 201 with pin data
```

**Deleting a Pin (AC #3):**
```
1. User clicks delete icon on a pin
2. Client calls DELETE /api/v1/moodboards/[moodboardId]/pins with body { pinId: "..." }
3. Server: DeletePinUseCase loads moodboard → verifies ownership → checks if pin is image type
4. If image pin: extract R2 key from imageUrl → delete from R2 via IStorageProvider
5. Call aggregate.removePin(pinId) → repo.deletePin() → repo.update() (updatedAt)
6. Response: 200 success
```

**Deleting a Moodboard (AC #4):**
```
1. User clicks "Delete Moodboard" → confirmation dialog
2. Client calls DELETE /api/v1/moodboards/[moodboardId]
3. Server: DeleteMoodboardUseCase loads moodboard → verifies ownership
4. For each image pin: delete from R2 storage
5. Delete moodboard from repo → CASCADE deletes all pins from DB
6. Response: 200 success
7. Client redirects to moodboard list
```

### Repository Strategy for Pins

The existing `DrizzleMoodboardRepository.update()` only updates moodboard table fields (title, updatedAt). For pin operations, add **dedicated methods** to the repository:

```typescript
// Add to DrizzleMoodboardRepository
async addPin(moodboardId: string, pinData: PinPersistence): Promise<Result<void>>
  → INSERT INTO pin table

async deletePin(pinId: string): Promise<Result<void>>
  → DELETE FROM pin WHERE id = pinId
```

This follows the pattern where aggregate root repository manages child entities at the persistence level, while domain logic stays in the aggregate.

### Pin Position Calculation

When adding a new pin, position should be auto-calculated:
```typescript
// In Moodboard.addPin():
const nextPosition = this._props.pins.length; // 0-indexed, appends to end
pin._props.position = nextPosition;
this._props.pins.push(pin);
```

No drag & drop pin reordering in this story (not in acceptance criteria).

### R2 Storage Cleanup on Delete

Follow the Gallery's `DeletePhotoUseCase` pattern for R2 cleanup:

```typescript
// Extract R2 key from full URL
// Example URL: https://pub-xxx.r2.dev/moodboard/userId/filename.jpg
// R2 key: moodboard/userId/filename.jpg
const r2Key = extractKeyFromUrl(pin.get('imageUrl').unwrap());
await this.storageProvider.deleteFile(r2Key);
```

Reference: `src/application/use-cases/gallery/delete-photo.use-case.ts` for exact URL-to-key extraction pattern.

### Ownership Verification Pattern

All operations MUST verify moodboard ownership:
```typescript
// In every use case:
const moodboardResult = await this.repo.findById(moodboardId);
if (moodboardResult.isFailure) return Result.fail(moodboardResult.getError());

const moodboardOption = moodboardResult.getValue();
if (moodboardOption.isNone()) return Result.fail("Moodboard not found");

const moodboard = moodboardOption.unwrap();
if (moodboard.get('userId') !== userId) return Result.fail("Forbidden");
```

### Controller Error Mapping

Follow the established pattern:
```typescript
if (result.isFailure) {
  const error = result.getError();
  if (error.includes("not found")) return NextResponse.json({ error }, { status: 404 });
  if (error.includes("Forbidden")) return NextResponse.json({ error }, { status: 403 });
  if (error.includes("Invalid") || error.includes("required")) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ error }, { status: 500 });
}
```

### Project Structure Notes

- All files follow established naming and location patterns from Story 6.1
- New events go in existing `src/domain/moodboard/events/` folder
- New use cases go in existing `src/application/use-cases/moodboard/` folder
- New DTOs go in existing `src/application/dto/moodboard/` folder
- Controllers extend existing `src/adapters/controllers/moodboard/moodboard.controller.ts` file
- API route for pins: `app/api/v1/moodboards/[moodboardId]/pins/route.ts` (new)
- API route for delete moodboard: add DELETE export to existing `app/api/v1/moodboards/[moodboardId]/route.ts`
- No DB migration needed — schema already supports pins

### File Structure

```
# New files to create
apps/nextjs/src/domain/moodboard/events/pin-added.event.ts
apps/nextjs/src/domain/moodboard/events/pin-removed.event.ts
apps/nextjs/src/domain/moodboard/events/moodboard-deleted.event.ts
apps/nextjs/src/application/dto/moodboard/add-pin.dto.ts
apps/nextjs/src/application/dto/moodboard/delete-pin.dto.ts
apps/nextjs/src/application/dto/moodboard/delete-moodboard.dto.ts
apps/nextjs/src/application/use-cases/moodboard/add-pin.use-case.ts
apps/nextjs/src/application/use-cases/moodboard/delete-pin.use-case.ts
apps/nextjs/src/application/use-cases/moodboard/delete-moodboard.use-case.ts
apps/nextjs/src/application/use-cases/moodboard/__tests__/add-pin.use-case.test.ts
apps/nextjs/src/application/use-cases/moodboard/__tests__/delete-pin.use-case.test.ts
apps/nextjs/src/application/use-cases/moodboard/__tests__/delete-moodboard.use-case.test.ts
apps/nextjs/app/api/v1/moodboards/[moodboardId]/pins/route.ts
apps/nextjs/app/(protected)/moodboard/_components/add-pin-dialog.tsx
apps/nextjs/app/(protected)/moodboard/_components/delete-moodboard-dialog.tsx

# Files to modify
apps/nextjs/src/domain/moodboard/moodboard.aggregate.ts          # Add addPin(), removePin() methods
apps/nextjs/src/adapters/repositories/moodboard.repository.ts     # Add addPin(), deletePin() methods
apps/nextjs/src/adapters/controllers/moodboard/moodboard.controller.ts  # Add 3 new controllers
apps/nextjs/app/api/v1/moodboards/[moodboardId]/route.ts         # Add DELETE export
apps/nextjs/common/di/types.ts                                    # Add 3 new use case symbols + types
apps/nextjs/common/di/modules/moodboard.module.ts                 # Bind 3 new use cases
apps/nextjs/app/(protected)/moodboard/_components/moodboard-detail.tsx  # Add pin management UI
```

### DI Registration

**types.ts additions:**
```typescript
// DI_SYMBOLS:
AddPinUseCase: Symbol.for("AddPinUseCase"),
DeletePinUseCase: Symbol.for("DeletePinUseCase"),
DeleteMoodboardUseCase: Symbol.for("DeleteMoodboardUseCase"),

// DI_RETURN_TYPES:
AddPinUseCase: AddPinUseCase;
DeletePinUseCase: DeletePinUseCase;
DeleteMoodboardUseCase: DeleteMoodboardUseCase;
```

**moodboard.module.ts additions:**
```typescript
m.bind(DI_SYMBOLS.AddPinUseCase).toClass(AddPinUseCase, [
  DI_SYMBOLS.IMoodboardRepository,
]);
m.bind(DI_SYMBOLS.DeletePinUseCase).toClass(DeletePinUseCase, [
  DI_SYMBOLS.IMoodboardRepository,
  DI_SYMBOLS.IStorageProvider,
]);
m.bind(DI_SYMBOLS.DeleteMoodboardUseCase).toClass(DeleteMoodboardUseCase, [
  DI_SYMBOLS.IMoodboardRepository,
  DI_SYMBOLS.IStorageProvider,
]);
```

### Testing Strategy

BDD tests for each use case, mock at repository + storage provider level:

**AddPinUseCase tests (~8 tests):**
- Happy path: add image pin successfully
- Happy path: add color pin successfully
- Validation: fail when type is image but no imageUrl provided
- Validation: fail when type is color but no color provided
- Validation: fail when invalid hex color format
- Ownership: fail when moodboard belongs to different user (403)
- Not found: fail when moodboard doesn't exist
- Error: fail when repository returns error

**DeletePinUseCase tests (~7 tests):**
- Happy path: delete color pin (no R2 cleanup needed)
- Happy path: delete image pin (R2 cleanup called)
- Ownership: fail when moodboard belongs to different user
- Not found: fail when moodboard doesn't exist
- Not found: fail when pin doesn't exist in moodboard
- Error: fail when repository returns error
- Error: continue even if R2 cleanup fails (best-effort)

**DeleteMoodboardUseCase tests (~6 tests):**
- Happy path: delete moodboard with no pins
- Happy path: delete moodboard with mixed pins (R2 cleanup for image pins only)
- Ownership: fail when moodboard belongs to different user
- Not found: fail when moodboard doesn't exist
- Error: fail when repository returns error
- Error: continue even if R2 cleanup fails (best-effort)

### Data Integrity Checklist

- **N+1 possible?** No — moodboard loaded once with all pins via findById JOIN query
- **Race conditions?** No — UUID-based pin IDs are unique, no concurrent concerns for solo user
- **Orphaned pins?** No — CASCADE DELETE on moodboard_id FK. Individual pin deletes go through repository
- **Orphaned R2 files?** Mitigated — use cases clean up R2 on delete. Best-effort: if R2 delete fails, pin is still removed from DB (acceptable for solo app)
- **Position gaps after delete?** Acceptable — positions may have gaps after pin deletion. No visual impact since layout is grid-based, not position-sensitive

### Security Checklist

- Every endpoint requires `getAuthenticatedUser()` check
- All use cases verify moodboard ownership (userId match) before any mutation
- userId comes from session, never from request body
- R2 presigned URLs are time-limited (existing upload infrastructure)
- 403 Forbidden returned for unauthorized access attempts

### Critical Anti-Patterns to Avoid

1. **Do NOT create a separate Pin repository** — Pin persistence methods live on MoodboardRepository (pins are owned entities)
2. **Do NOT create new DB migrations** — pin table already exists from Story 6.1, no schema changes needed
3. **Do NOT use `throw` in domain/application** — use `Result<T>` exclusively
4. **Do NOT create index.ts barrel files**
5. **Do NOT add comments** — self-documenting code
6. **Do NOT add IEventDispatcher** wiring (Epic 7)
7. **Do NOT use `null`** — use `Option<T>` for nullable values
8. **Do NOT add custom getters** beyond `get id()` — use `entity.get('propName')`
9. **Do NOT install new libraries** — all needed dependencies already installed (shadcn, Tailwind, etc.)
10. **Do NOT add pin drag & drop reordering** — not in acceptance criteria
11. **Do NOT recreate existing files** — extend Moodboard aggregate, repository, and controller files

### Golden Reference Files

| Purpose | Source File | Adaptation |
|---------|------------|------------|
| Delete use case | `src/application/use-cases/gallery/delete-photo.use-case.ts` | DeletePinUseCase, DeleteMoodboardUseCase (R2 cleanup pattern) |
| Delete controller | `src/adapters/controllers/gallery/gallery.controller.ts` | deleteMoodboardController, deletePinController |
| Add entity to aggregate | `src/domain/moodboard/moodboard.aggregate.ts` | addPin/removePin methods |
| Pin entity creation | `src/domain/moodboard/pin.entity.ts` | Pin.create() in AddPinUseCase |
| R2 key extraction | `src/application/use-cases/gallery/delete-photo.use-case.ts` | Extract key from imageUrl |
| Upload flow (client) | `app/(protected)/gallery/_components/gallery-client.tsx` | Image upload in add-pin-dialog |
| Confirm dialog | `app/(protected)/gallery/_components/gallery-grid.tsx` | Delete confirmation pattern |
| DI with IStorageProvider | `common/di/modules/gallery.module.ts` | DeletePin/DeleteMoodboard DI bindings |

### Previous Story Intelligence (Story 6.1)

Key learnings from Story 6.1 that impact this story:

1. **Moodboard.create() returns Result<Moodboard>** — aligned with Photo.create pattern. Keep consistent.
2. **Pin entity uses Option<string> for imageUrl and Option<HexColor> for color** — validation of which field is required based on type is NOT in the VO. Must be validated in the use case or aggregate method.
3. **Repository update() only updates title + updatedAt** — pin operations need dedicated addPin/deletePin methods on the repository.
4. **Repository already handles pin loading in findById** — no changes needed for read operations.
5. **CASCADE DELETE works at DB level** — deleting moodboard auto-removes pins from DB. But R2 cleanup still needed for image pins.
6. **Detail view (`moodboard-detail.tsx`) is read-only** — needs modification to add pin management buttons.
7. **Client wrapper (`moodboard-client.tsx`) already manages `refreshKey` state** — reuse this pattern for mutations.
8. **310 tests currently passing** — new tests must not break existing ones.
9. **Biome formatting: spaces not tabs** — always run `pnpm fix` after writing files.
10. **IEventDispatcher NOT wired** — add events to aggregate but do NOT attempt to dispatch them. Same pattern as all other modules.

### Git Intelligence

Recent commits follow pattern: `feat(nextjs): implement story X.Y — [description] with code review fixes`

All quality checks (type-check, test, Biome) pass on current main branch. 310 tests passing across 37 files. Code review fixes applied in same commit.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.2: Pin Items & Manage Moodboard Content]
- [Source: _bmad-output/planning-artifacts/architecture.md#File Upload — Shared Endpoint]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure — moodboard/ files]
- [Source: _bmad-output/implementation-artifacts/6-1-create-and-browse-moodboards.md — previous story reference]
- [Source: apps/nextjs/src/domain/moodboard/ — existing domain layer]
- [Source: apps/nextjs/src/adapters/repositories/moodboard.repository.ts — existing repository]
- [Source: apps/nextjs/src/adapters/controllers/moodboard/moodboard.controller.ts — existing controllers]
- [Source: apps/nextjs/src/application/use-cases/gallery/delete-photo.use-case.ts — R2 cleanup reference]
- [Source: apps/nextjs/src/domain/upload/value-objects/upload-context.vo.ts — "moodboard" context confirmed]
- [Source: apps/nextjs/common/di/modules/gallery.module.ts — IStorageProvider DI binding reference]

### Review Follow-ups (AI)

- [x] [AI-Review][MEDIUM] Task 8 (Moodboard Detail UI) not implemented — RESOLVED: implemented add-pin-dialog, delete-moodboard-dialog, updated moodboard-detail with pin management
- [x] [AI-Review][MEDIUM] getMoodboardDetailController query conflates 403/404 — intentional security pattern: GET returns 404 for info hiding, mutations return 403 for actionable feedback. No change needed.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- All tasks 1-9 completed. Task 8 (UI) implemented: add-pin-dialog with Image/Color tabs, delete-moodboard-dialog with AlertDialog confirmation, moodboard-detail updated with pin management (add, delete per pin, delete board, optimistic updates, refreshKey pattern).
- Code review fixes applied: transactional update(), DB-first then R2 cleanup, addPin invariants (duplicate check + 50 pin limit), removePin position recalculation, domain event tests, discriminatedUnion DTO, resilient error matching in controllers.
- Deviated from story spec: repository uses full-sync (delete-all + re-insert in transaction) instead of dedicated addPin/deletePin methods. Simpler and atomic.
- 335 tests passing (25 new: 10 add-pin, 8 delete-pin, 7 delete-moodboard).
- Code review #2 fixes applied: Pin.updatePosition() method (encapsulation fix), markForDeletion returns Result<void>, MAX_PINS=50 test coverage, DeleteMoodboardDialog e.preventDefault() on AlertDialogAction (auto-close bug fix).

### File List

**New files:**
- `apps/nextjs/src/domain/moodboard/events/pin-added.event.ts`
- `apps/nextjs/src/domain/moodboard/events/pin-removed.event.ts`
- `apps/nextjs/src/domain/moodboard/events/moodboard-deleted.event.ts`
- `apps/nextjs/src/application/dto/moodboard/add-pin.dto.ts`
- `apps/nextjs/src/application/dto/moodboard/delete-pin.dto.ts`
- `apps/nextjs/src/application/dto/moodboard/delete-moodboard.dto.ts`
- `apps/nextjs/src/application/use-cases/moodboard/add-pin.use-case.ts`
- `apps/nextjs/src/application/use-cases/moodboard/delete-pin.use-case.ts`
- `apps/nextjs/src/application/use-cases/moodboard/delete-moodboard.use-case.ts`
- `apps/nextjs/src/application/use-cases/moodboard/__tests__/add-pin.use-case.test.ts`
- `apps/nextjs/src/application/use-cases/moodboard/__tests__/delete-pin.use-case.test.ts`
- `apps/nextjs/src/application/use-cases/moodboard/__tests__/delete-moodboard.use-case.test.ts`
- `apps/nextjs/app/api/v1/moodboards/[moodboardId]/pins/route.ts`
- `apps/nextjs/app/api/v1/moodboards/[moodboardId]/pins/[pinId]/route.ts`
- `apps/nextjs/app/(protected)/moodboard/_components/add-pin-dialog.tsx`
- `apps/nextjs/app/(protected)/moodboard/_components/delete-moodboard-dialog.tsx`

**Modified files:**
- `apps/nextjs/src/domain/moodboard/pin.entity.ts` — added updatePosition() method
- `apps/nextjs/src/domain/moodboard/moodboard.aggregate.ts` — addPin() with Result<void> + invariants, removePin() with position recalculation via pin.updatePosition(), markForDeletion() returns Result<void>
- `apps/nextjs/src/adapters/repositories/moodboard.repository.ts` — update() uses transaction-wrapped full pin sync
- `apps/nextjs/src/adapters/controllers/moodboard/moodboard.controller.ts` — 3 new controllers with resilient error matching
- `apps/nextjs/app/api/v1/moodboards/[moodboardId]/route.ts` — added DELETE export
- `apps/nextjs/common/di/types.ts` — 3 new DI symbols + return types
- `apps/nextjs/common/di/modules/moodboard.module.ts` — 3 new use case bindings
- `apps/nextjs/app/(protected)/moodboard/_components/moodboard-detail.tsx` — pin management UI (add, delete per pin, delete board, optimistic delete, refreshKey)
