# Story 5.2: Browse & Delete Gallery Photos

Status: done

## Story

As a **user**,
I want to browse my photo collection and remove photos I no longer want,
so that I can manage my visual memories.

## Acceptance Criteria

1. **Given** an authenticated user with photos in their gallery **When** they navigate to the gallery page **Then** they see a photo grid with thumbnails, paginated

2. **Given** an authenticated user viewing their gallery **When** they select a photo **Then** they see the full-size image

3. **Given** an authenticated user **When** they choose to delete a photo and confirm **Then** the photo is removed from the gallery and from R2 storage

4. **Given** an authenticated user with no photos **When** they navigate to the gallery **Then** they see an empty state encouraging them to upload their first photo

5. **Given** an authenticated user **When** they attempt to access another user's gallery **Then** the system returns a 403 Forbidden error

## Tasks / Subtasks

- [x] Task 1: Create Delete Photo Domain Event (AC: #3)
  - [x] 1.1 Create `src/domain/gallery/events/photo-deleted.event.ts` — PhotoDeletedEvent with userId, photoId, url

- [x] Task 2: Create Delete Photo Application Layer (AC: #3, #5)
  - [x] 2.1 Create `src/application/dto/gallery/delete-photo.dto.ts` — input (photoId, userId), output (id)
  - [x] 2.2 Create `src/application/use-cases/gallery/delete-photo.use-case.ts` — verifies ownership, deletes from R2 via IStorageProvider.delete(), deletes from DB, adds PhotoDeletedEvent
  - [x] 2.3 Write BDD tests `src/application/use-cases/gallery/__tests__/delete-photo.use-case.test.ts`

- [x] Task 3: Create Delete Photo Adapter Layer (AC: #3, #5)
  - [x] 3.1 Add `deletePhotoController` to `src/adapters/controllers/gallery/gallery.controller.ts`
  - [x] 3.2 Create `app/api/v1/gallery/[photoId]/route.ts` — export DELETE = deletePhotoController

- [x] Task 4: DI Registration (AC: #3)
  - [x] 4.1 Add `DeletePhotoUseCase` to `common/di/modules/gallery.module.ts` with deps [IGalleryRepository, IStorageProvider]
  - [x] 4.2 Add DI symbols and return types to `common/di/types.ts`: DeletePhotoUseCase

- [x] Task 5: Enhance Gallery UI — Browse & Pagination (AC: #1, #4)
  - [x] 5.1 Refactor `gallery-upload.tsx` — extract photo grid into dedicated `gallery-grid.tsx` component
  - [x] 5.2 Create `app/(protected)/gallery/_components/gallery-grid.tsx` — responsive grid with pagination controls (page/limit query params)
  - [x] 5.3 Implement empty state when no photos exist (first-action prompt to upload)

- [x] Task 6: Enhance Gallery UI — View Full-Size & Delete (AC: #2, #3)
  - [x] 6.1 Create `app/(protected)/gallery/_components/photo-view-modal.tsx` — shadcn Dialog with full-size image, metadata, delete button
  - [x] 6.2 Add delete confirmation via shadcn AlertDialog before deletion
  - [x] 6.3 Wire delete API call with optimistic UI update (remove photo from grid on success)

- [x] Task 7: Quality Checks (AC: all)
  - [x] 7.1 Run `pnpm fix`
  - [x] 7.2 Run `pnpm type-check`
  - [x] 7.3 Run `pnpm test` — all existing + new tests pass
  - [x] 7.4 Run `pnpm check`

## Dev Notes

### Architecture: Delete Photo with R2 Cleanup

Story 5.2 extends the gallery module from Story 5.1 by adding **browse with pagination**, **full-size image viewing**, and **delete with R2 storage cleanup**.

**Delete Flow (two-step: R2 + DB):**
```
1. Authenticate user → verify ownership (photo.userId === session.userId)
2. Extract R2 key from photo URL → e.g., "gallery/{userId}/{uuid}.jpg"
3. Call IStorageProvider.delete(r2Key) → removes file from Cloudflare R2
4. Call IGalleryRepository.delete(photoId) → removes record from DB
5. Return success
```

**R2 Key Extraction Pattern:**
The photo URL format is `{R2_PUBLIC_URL}/{key}`. Extract the key by parsing the URL:
```typescript
const url = new URL(photo.get("url"));
const r2Key = url.pathname.slice(1); // Remove leading "/"
```

**IStorageProvider.delete() is already implemented** in `R2StorageService` using AWS SDK `DeleteObjectCommand`. No new infrastructure needed.

### Existing Gallery Infrastructure (Story 5.1 — REUSE, DO NOT RECREATE)

| Component | File | Status |
|-----------|------|--------|
| Photo Aggregate | `src/domain/gallery/photo.aggregate.ts` | Existing — userId, url, filename, mimeType, size, caption, createdAt |
| Photo ID | `src/domain/gallery/photo-id.ts` | Existing |
| PhotoCaption VO | `src/domain/gallery/value-objects/photo-caption.vo.ts` | Existing |
| PhotoUploadedEvent | `src/domain/gallery/events/photo-uploaded.event.ts` | Existing |
| Gallery Port | `src/application/ports/gallery-repository.port.ts` | Existing — IGalleryRepository extends BaseRepository<Photo> + findByUserId |
| AddPhoto DTO | `src/application/dto/gallery/add-photo.dto.ts` | Existing |
| AddPhotoUseCase | `src/application/use-cases/gallery/add-photo.use-case.ts` | Existing |
| Gallery Mapper | `src/adapters/mappers/gallery.mapper.ts` | Existing — photoToDomain / photoToPersistence |
| Gallery Repository | `src/adapters/repositories/gallery.repository.ts` | Existing — DrizzleGalleryRepository with CRUD + findByUserId + **delete already implemented** |
| Gallery Query | `src/adapters/queries/gallery.query.ts` | Existing — getUserGallery(userId, page, limit) CQRS read |
| Gallery Controller | `src/adapters/controllers/gallery/gallery.controller.ts` | Existing — getUserGalleryController (GET) + addPhotoController (POST) |
| API Route | `app/api/v1/gallery/route.ts` | Existing — GET + POST |
| Gallery Page | `app/(protected)/gallery/page.tsx` | Existing — server component with requireAuth() |
| Upload Component | `app/(protected)/gallery/_components/gallery-upload.tsx` | Existing — upload flow + basic photo grid |
| DI Module | `common/di/modules/gallery.module.ts` | Existing — IGalleryRepository + AddPhotoUseCase |
| DB Schema | `packages/drizzle/src/schema/gallery.ts` | Existing — photo table with userId index |
| Storage Port | `src/application/ports/storage.provider.port.ts` | Existing — IStorageProvider with delete(fileId) method |
| R2 Service | `src/adapters/services/storage/r2-storage.service.ts` | Existing — R2StorageService.delete() using DeleteObjectCommand |

### Delete Photo Use Case Design

```typescript
// DeletePhotoUseCase
constructor(
  private readonly galleryRepo: IGalleryRepository,
  private readonly storageProvider: IStorageProvider,
) {}

async execute(input: IDeletePhotoInputDto): Promise<Result<IDeletePhotoOutputDto>> {
  // 1. Find photo by ID
  const findResult = await this.galleryRepo.findById(new PhotoId(new UUID(input.photoId)));
  if (findResult.isFailure) return Result.fail(findResult.getError());

  // 2. Check photo exists
  const photoOption = findResult.getValue();
  if (photoOption.isNone()) return Result.fail("Photo not found");
  const photo = photoOption.unwrap();

  // 3. Verify ownership
  if (photo.get("userId") !== input.userId) return Result.fail("Forbidden");

  // 4. Extract R2 key from URL and delete from storage
  const r2Key = new URL(photo.get("url")).pathname.slice(1);
  const deleteStorageResult = await this.storageProvider.delete(r2Key);
  if (deleteStorageResult.isFailure) return Result.fail(deleteStorageResult.getError());

  // 5. Delete from DB
  const deleteResult = await this.galleryRepo.delete(photo.id);
  if (deleteResult.isFailure) return Result.fail(deleteResult.getError());

  return Result.ok({ id: input.photoId });
}
```

### Delete Controller Pattern

Follow the established controller flow:
```
1. getAuthenticatedUser(request) → session or 401
2. Extract photoId from URL params
3. getInjection("DeletePhotoUseCase")
4. useCase.execute({ photoId, userId: session.user.id })
5. Result mapping:
   - "Photo not found" → 404
   - "Forbidden" → 403
   - Other failure → 400
   - Success → 200 with { id }
```

### Gallery Grid UI Design

**Responsive grid layout** (matches existing `gallery-upload.tsx` pattern):
- Mobile: 2 columns
- Tablet: 3 columns
- Desktop: 4 columns

**Pagination** — use existing `getUserGallery` query which supports `page` and `limit` params:
```
GET /api/v1/gallery?page=1&limit=20
Response: { data: GalleryPhotoDto[], pagination: { page, limit, total, totalPages, hasNextPage, hasPreviousPage } }
```

**Empty state** — when `data.length === 0` and `page === 1`:
- Show encouraging message: "Your gallery is empty. Upload your first photo!"
- Display upload CTA button

### Photo View Modal Design

Use **shadcn Dialog** for the lightbox:
- Full-size image display (object-contain, max viewport dimensions)
- Photo metadata: filename, date (formatted), file size
- Delete button (red, with confirmation via AlertDialog)
- Close button (X or click outside)

**Delete confirmation** — use shadcn **AlertDialog**:
- Title: "Delete Photo"
- Description: "This action cannot be undone. The photo will be permanently removed."
- Cancel / Delete buttons

### DI Registration

**gallery.module.ts additions:**
```typescript
m.bind(DI_SYMBOLS.DeletePhotoUseCase).toClass(DeletePhotoUseCase, [
  DI_SYMBOLS.IGalleryRepository,
  DI_SYMBOLS.IStorageProvider,
]);
```

**types.ts additions:**
```typescript
// DI_SYMBOLS:
DeletePhotoUseCase: Symbol.for("DeletePhotoUseCase"),

// DI_RETURN_TYPES:
DeletePhotoUseCase: DeletePhotoUseCase;
```

### File Structure

```
# New files to create
apps/nextjs/src/domain/gallery/events/photo-deleted.event.ts
apps/nextjs/src/application/dto/gallery/delete-photo.dto.ts
apps/nextjs/src/application/use-cases/gallery/delete-photo.use-case.ts
apps/nextjs/src/application/use-cases/gallery/__tests__/delete-photo.use-case.test.ts
apps/nextjs/app/api/v1/gallery/[photoId]/route.ts
apps/nextjs/app/(protected)/gallery/_components/gallery-grid.tsx
apps/nextjs/app/(protected)/gallery/_components/photo-view-modal.tsx

# Files to modify
apps/nextjs/src/adapters/controllers/gallery/gallery.controller.ts  # Add deletePhotoController
apps/nextjs/common/di/modules/gallery.module.ts                      # Add DeletePhotoUseCase binding
apps/nextjs/common/di/types.ts                                       # Add DeletePhotoUseCase symbol + type
apps/nextjs/app/(protected)/gallery/_components/gallery-upload.tsx    # Extract grid, keep upload-only
apps/nextjs/app/(protected)/gallery/page.tsx                         # Compose grid + upload components
```

### Project Structure Notes

- All new files follow established naming and location patterns from Story 5.1
- `[photoId]` dynamic route segment follows Next.js App Router convention (existing pattern: `[postId]`, `[conversationId]`)
- Gallery controller file is extended (not a new file) — keeps all gallery controllers together per domain convention
- Gallery grid and modal are separate client components in `_components/` — follows page orchestration pattern

### Data Integrity Checklist

- **N+1 possible?** No — gallery query fetches paginated list in single query; delete is single findById + single delete
- **Race conditions?** No — delete is idempotent (if photo already deleted, findById returns None → 404)
- **Orphaned R2 files?** Mitigated — R2 delete happens BEFORE DB delete. If DB delete fails after R2 delete, the R2 file is already gone (acceptable data loss — the photo was being deleted anyway)
- **Performance?** Pagination prevents loading all photos. Grid uses thumbnail-size rendering. Full-size loaded only on modal open.

### Security Checklist

- Every endpoint requires `getAuthenticatedUser()` check
- Delete use case verifies `photo.userId === input.userId` — no cross-user deletion
- Gallery query filters by `userId = session.user.id` — no cross-user browsing
- R2 key extraction from URL is safe — URL is server-stored, not user-provided
- If the `IStorageProvider.delete()` call fails, the DB record is NOT deleted (fail-fast)

### Code Duplication Checklist

- **Delete use case pattern**: Follow `DeletePostUseCase` from Story 1.5. Gallery deletion also needs R2 cleanup (Post does not — post images are separate). Do NOT copy post delete verbatim — gallery delete has extra storageProvider.delete() step.
- **Controller pattern**: Same auth + parse + execute + map pattern. No new abstraction needed.
- **Grid component**: Extract from existing `gallery-upload.tsx` grid rendering. Do NOT duplicate the grid in two places.

### What NOT to Build in Story 5.2

- No photo editing/cropping
- No multi-select batch delete
- No caption editing after upload
- No photo reordering/sorting beyond date order
- No image optimization/resizing server-side
- No gallery sharing with friends
- No IEventDispatcher wiring (Epic 7)
- No "download photo" feature

### Critical Anti-Patterns to Avoid

1. **Do NOT create a new upload infrastructure** — upload is Story 5.1 scope, fully done
2. **Do NOT bypass R2 cleanup** — always delete from R2 BEFORE DB
3. **Do NOT use `<img>` without width/height** — prevent layout shift (use CSS aspect-ratio or fixed dimensions)
4. **Do NOT load full-size images in the grid** — grid should use thumbnail rendering (CSS `object-cover` on constrained dimensions)
5. **Do NOT create index.ts barrel files**
6. **Do NOT throw exceptions** in domain/application — use Result<T>
7. **Do NOT add IEventDispatcher** wiring (Epic 7)
8. **Do NOT install heavy lightbox/gallery libraries** — shadcn Dialog is sufficient
9. **Do NOT add comments** — self-documenting code

### Golden Reference Files

| Purpose | Source File | Adaptation |
|---------|------------|------------|
| Delete Use Case | `src/application/use-cases/post/delete-post.use-case.ts` | Add R2 cleanup step via IStorageProvider |
| Delete DTO | `src/application/dto/post/delete-post.dto.ts` | DeletePhoto DTOs |
| Delete Test | `src/application/use-cases/post/__tests__/delete-post.use-case.test.ts` | DeletePhoto tests + R2 mock |
| Delete Controller | `src/adapters/controllers/post/post.controller.ts` (deletePostController) | deletePhotoController |
| Dynamic Route | `app/api/v1/posts/[postId]/route.ts` | gallery/[photoId]/route.ts |
| Grid Component | `app/(protected)/gallery/_components/gallery-upload.tsx` (existing grid) | Extract to gallery-grid.tsx |
| Modal Pattern | shadcn Dialog + AlertDialog components | Photo view + delete confirm |
| Pagination | `src/adapters/queries/gallery.query.ts` (existing pagination) | Wire to UI controls |
| Storage Delete | `src/adapters/services/storage/r2-storage.service.ts` (delete method) | Already works, inject via DI |

### Previous Story Intelligence (Story 5.1)

Key learnings from Story 5.1 that impact this story:

1. **Gallery repository already has delete() method** — implemented in Story 5.1 as part of DrizzleGalleryRepository. Uses `db.delete(photo).where(eq(photo.id, id.value))`. Returns `Result<PhotoId>`.
2. **Gallery query returns `GalleryPhotoDto`** — includes `id`, `url`, `filename`, `mimeType`, `size`, `caption`, `createdAt`. Reuse this type for grid display.
3. **Auth guard import path is `@/adapters/guards/auth.guard`** — fixed in Story 5.1 (was wrong initially). Use correct path.
4. **Photo URL stores full R2 URL** — not just the key. Must parse URL to extract R2 key for deletion.
5. **Caption uses `Option<PhotoCaption>`** — display as optional metadata in view modal.
6. **293 tests currently passing** — new tests must not break existing ones.
7. **Biome formatting: spaces not tabs** — always run `pnpm fix` after writing files.
8. **IStorageProvider is already bound in DI** — via upload.module.ts. Available as `DI_SYMBOLS.IStorageProvider`.
9. **shadcn import paths** — if adding new shadcn components, fix imports from `/src/libs/utils` to `../../libs/utils` (recurring issue).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2: Browse & Delete Gallery Photos]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5: Photo Gallery]
- [Source: _bmad-output/planning-artifacts/architecture.md#File Upload — Shared Endpoint]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure — gallery/ new files]
- [Source: _bmad-output/implementation-artifacts/5-1-upload-photos-to-gallery.md — previous story reference]
- [Source: apps/nextjs/src/adapters/repositories/gallery.repository.ts — existing delete() method]
- [Source: apps/nextjs/src/adapters/queries/gallery.query.ts — existing pagination query]
- [Source: apps/nextjs/src/application/ports/storage.provider.port.ts — IStorageProvider.delete()]
- [Source: apps/nextjs/src/adapters/services/storage/r2-storage.service.ts — R2StorageService.delete()]
- [Source: apps/nextjs/src/adapters/controllers/gallery/gallery.controller.ts — existing GET + POST controllers]
- [Source: apps/nextjs/src/application/use-cases/post/delete-post.use-case.ts — delete pattern reference]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- All 7 tasks completed successfully with 10 BDD tests (303 total, 0 failures)
- Fixed `addEvent` protected access: added `markDeleted()` method to Photo aggregate instead of calling `addEvent` from the use case
- Delete flow: findById → verify ownership → extract R2 key from URL → delete from R2 → markDeleted() → delete from DB
- Gallery UI refactored: upload-only component + separate grid with pagination + photo view modal with delete confirmation
- Gallery refresh coordination via `gallery-client.tsx` wrapper with `refreshKey` state pattern

**Code Review Fixes (Claude Opus 4.6):**
- [HIGH] Wrapped `new URL()` in try/catch in DeletePhotoUseCase to prevent unhandled TypeError on malformed URLs
- [HIGH] Added error state + retry UI in GalleryGrid for failed fetch responses (was silently swallowed)
- [MEDIUM] Removed redundant `onPhotoDeleted` refresh trigger in GalleryClient (delete already handled optimistically)
- [MEDIUM] Replaced duplicated `GalleryData` interface with imported `GetUserGalleryOutputDto`
- [MEDIUM] Improved alt text accessibility: `photo.caption || photo.filename` in grid and modal
- [LOW] Added test for malformed URL edge case (10th test)
- [LOW] Enhanced PhotoDeletedEvent test to verify full payload (url field)

### File List

**New files created:**
- `apps/nextjs/src/domain/gallery/events/photo-deleted.event.ts`
- `apps/nextjs/src/application/dto/gallery/delete-photo.dto.ts`
- `apps/nextjs/src/application/use-cases/gallery/delete-photo.use-case.ts`
- `apps/nextjs/src/application/use-cases/gallery/__tests__/delete-photo.use-case.test.ts`
- `apps/nextjs/app/api/v1/gallery/[photoId]/route.ts`
- `apps/nextjs/app/(protected)/gallery/_components/gallery-grid.tsx`
- `apps/nextjs/app/(protected)/gallery/_components/photo-view-modal.tsx`
- `apps/nextjs/app/(protected)/gallery/_components/gallery-client.tsx`

**Files modified:**
- `apps/nextjs/src/domain/gallery/photo.aggregate.ts` — added markDeleted() method + PhotoDeletedEvent import
- `apps/nextjs/src/adapters/controllers/gallery/gallery.controller.ts` — added deletePhotoController
- `apps/nextjs/common/di/modules/gallery.module.ts` — added DeletePhotoUseCase binding
- `apps/nextjs/common/di/types.ts` — added DeletePhotoUseCase symbol + return type
- `apps/nextjs/app/(protected)/gallery/_components/gallery-upload.tsx` — refactored to upload-only
- `apps/nextjs/app/(protected)/gallery/page.tsx` — switched to GalleryClient wrapper
