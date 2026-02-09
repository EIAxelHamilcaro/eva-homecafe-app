# Story 5.1: Upload Photos to Gallery

Status: done

## Story

As a **user**,
I want to upload photos to my personal gallery,
so that I can keep a visual collection of my favorite moments.

## Acceptance Criteria

1. **Given** an authenticated user on the gallery page **When** they upload one or more photos **Then** the photos are uploaded via the shared upload endpoint (context: gallery) and added to their gallery **And** the Photo aggregate and DB schema (photo table) are created

2. **Given** an authenticated user uploading a photo **When** the upload completes **Then** a PhotoUploadedEvent domain event is dispatched (for gamification) **And** the upload completes within 5 seconds for files up to 10MB (NFR4)

3. **Given** an authenticated user uploading a file that is not an image **When** they submit **Then** the system returns a validation error

4. **Given** an authenticated user **When** the upload fails due to network error **Then** a clear error message is displayed with a retry option (NFR15)

## Tasks / Subtasks

- [x] Task 1: Create Photo Domain Layer (AC: #1, #2)
  - [x] 1.1 Create `src/domain/gallery/photo.aggregate.ts` — Photo aggregate with userId, url, filename, mimeType, size, caption (optional), createdAt
  - [x] 1.2 Create `src/domain/gallery/photo-id.ts` — PhotoId typed UUID
  - [x] 1.3 Create `src/domain/gallery/value-objects/photo-caption.vo.ts` — optional caption, max 500 chars
  - [x] 1.4 Create `src/domain/gallery/events/photo-uploaded.event.ts` — PhotoUploadedEvent with userId, photoId, url

- [x] Task 2: Create Database Schema (AC: #1)
  - [x] 2.1 Create `packages/drizzle/src/schema/gallery.ts` — `photo` table: id (text PK), userId (text FK→user), url (text), filename (text), mimeType (text), size (integer), caption (text nullable), createdAt (timestamp default now)
  - [x] 2.2 Add index on (userId, createdAt) for paginated gallery queries
  - [x] 2.3 Export from schema index

- [x] Task 3: Create Application Layer (AC: #1, #2, #3)
  - [x] 3.1 Create `src/application/ports/gallery-repository.port.ts` — IGalleryRepository extending BaseRepository<Photo> with findByUserId(userId, pagination)
  - [x] 3.2 Create `src/application/dto/gallery/add-photo.dto.ts` — input (url, filename, mimeType, size, caption?, userId) + output (id, url, filename, caption, createdAt)
  - [x] 3.3 Create `src/application/use-cases/gallery/add-photo.use-case.ts` — validates inputs, creates Photo aggregate, persists, returns DTO
  - [x] 3.4 Write BDD tests `src/application/use-cases/gallery/__tests__/add-photo.use-case.test.ts`

- [x] Task 4: Create Adapters Layer (AC: #1)
  - [x] 4.1 Create `src/adapters/mappers/gallery.mapper.ts` — photoToDomain / photoToPersistence
  - [x] 4.2 Create `src/adapters/repositories/gallery.repository.ts` — DrizzleGalleryRepository implementing IGalleryRepository
  - [x] 4.3 Create `src/adapters/controllers/gallery/gallery.controller.ts` — addPhotoController (POST: auth → validate → use case → 201)

- [x] Task 5: Create API Route & Page (AC: #1, #4)
  - [x] 5.1 Create `app/api/v1/gallery/route.ts` — export POST = addPhotoController
  - [x] 5.2 Create `app/(protected)/gallery/page.tsx` — gallery page (server component)
  - [x] 5.3 Create `app/(protected)/gallery/_components/gallery-upload.tsx` — client component with upload flow (presigned URL → R2 → add-photo API)
  - [x] 5.4 Implement retry logic on upload failure with clear error message (NFR15)

- [x] Task 6: DI Registration (AC: #1)
  - [x] 6.1 Create `common/di/modules/gallery.module.ts` — bind IGalleryRepository → DrizzleGalleryRepository, bind AddPhotoUseCase with [IGalleryRepository]
  - [x] 6.2 Add DI symbols and return types to `common/di/types.ts`: IGalleryRepository, AddPhotoUseCase
  - [x] 6.3 Load gallery module in `common/di/container.ts` (alphabetical order)

- [x] Task 7: Quality Checks (AC: all)
  - [x] 7.1 Run `pnpm fix` — 6 files auto-fixed
  - [x] 7.2 Run `pnpm type-check` — 0 new errors (fixed auth guard import path)
  - [x] 7.3 Run `pnpm test` — 35 files, 293 tests pass (287 existing + 6 new gallery tests)
  - [x] 7.4 Run `pnpm check` — 0 new Biome errors (2 pre-existing noDangerouslySetInnerHtml warnings)

## Dev Notes

### Architecture: Photo Aggregate — Simple Entity with Upload Integration

Story 5.1 creates the **Photo domain aggregate** and wires it to the existing shared upload infrastructure from Story 1.1. The Photo aggregate is intentionally simple: it represents a persisted gallery entry that stores the R2 file URL after a successful client-side upload.

**Upload Flow (two-step, client-driven):**
```
1. Client → POST /api/v1/upload { context: "gallery", filename, mimeType, size }
   → Server returns { uploadUrl, fileUrl, key, expiresAt }

2. Client → PUT uploadUrl (direct R2 upload with file binary)
   → R2 returns 200

3. Client → POST /api/v1/gallery { url: fileUrl, filename, mimeType, size, caption? }
   → Server creates Photo aggregate → persists → returns photo DTO (201)
```

The client must complete step 2 (upload to R2) BEFORE step 3 (register in gallery). The `url` field in step 3 is the `fileUrl` returned in step 1.

### Existing Upload Infrastructure (Story 1.1 — REUSE, DO NOT RECREATE)

The shared upload is fully implemented and ready:

| Component | File | Status |
|-----------|------|--------|
| Storage Port | `src/application/ports/storage.provider.port.ts` | Existing — IStorageProvider with generatePresignedUploadUrl |
| R2 Service | `src/adapters/services/storage/r2-storage.service.ts` | Existing — Cloudflare R2 presigned URL generation |
| Local Service | `src/adapters/services/storage/local-storage.service.ts` | Existing — mock for local dev |
| Upload Use Case | `src/application/use-cases/upload/generate-upload-url.use-case.ts` | Existing — GenerateUploadUrlUseCase |
| Upload Controller | `src/adapters/controllers/upload/upload.controller.ts` | Existing — generateUploadUrlController |
| API Route | `app/api/v1/upload/route.ts` | Existing — POST endpoint |
| Upload Context VO | `src/domain/upload/value-objects/upload-context.vo.ts` | Existing — already includes "gallery" |
| File Metadata VO | `src/domain/upload/value-objects/file-metadata.vo.ts` | Existing — validates JPEG/PNG/GIF/WEBP, max 10MB |
| DI Module | `common/di/modules/upload.module.ts` | Existing — IStorageProvider + GenerateUploadUrlUseCase bound |

**DO NOT** recreate or duplicate any upload logic. The gallery simply calls the existing `/api/v1/upload` endpoint with `context: "gallery"`.

### Database Schema Design

```sql
CREATE TABLE photo (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id),
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  caption TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX photo_user_id_created_at_idx ON photo (user_id, created_at);
```

**Drizzle schema pattern** — follow existing `post.ts` schema:
- Table name: singular `photo` (not `gallery_photo`)
- Column naming: camelCase in Drizzle → snake_case in SQL
- Foreign key to `user` table
- No `updatedAt` or `deletedAt` — photos are immutable (create or delete only)

### Photo Aggregate Design

```typescript
interface IPhotoProps {
  userId: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  caption: Option<string>;
  createdAt: Date;
}
```

**Key decisions:**
- `caption` uses `Option<string>` — optional, not required for upload
- No `updatedAt` — photos are immutable entities. Users can only add or delete.
- `url` stores the full R2 file URL (not the key) — consistent with Post.images pattern
- `size` stored as integer (bytes) — useful for quota calculations (future)
- `mimeType` stored — useful for rendering decisions and validation

**Photo.create() method:**
```
Photo.create(props) → Photo aggregate with PhotoUploadedEvent added via addEvent()
```

### Domain Event: PhotoUploadedEvent

```typescript
eventType: "photo.uploaded"
payload: { photoId: string, userId: string, url: string }
```

Added via `addEvent()` in the aggregate. IEventDispatcher is NOT wired yet (deferred to Epic 7). The event is created for future gamification hook.

### Controller Pattern

Follow the established controller flow exactly:
```
1. getAuthenticatedUser(request) → session or 401
2. request.json() in try/catch → parsed body or 400
3. addPhotoInputDtoSchema.safeParse(body) → validated input or 400
4. getInjection("AddPhotoUseCase") → use case instance
5. useCase.execute({ ...input, userId: session.user.id }) → Result
6. result.isFailure → NextResponse.json({ error }, { status: 400 })
7. result.isSuccess → NextResponse.json(result.getValue(), { status: 201 })
```

### Gallery Page UI (Minimal for 5.1)

Story 5.1 focuses on the **upload** capability. The full gallery browsing + deletion is Story 5.2.

For 5.1, create a minimal gallery page with:
- Upload button/area
- Upload progress indicator
- Success/error feedback
- Simple grid of uploaded photos (fetch via CQRS query or basic GET)

**Upload UX flow:**
1. User clicks "Upload Photo" or drops file
2. Validate file type/size client-side (JPEG/PNG/GIF/WEBP, max 10MB)
3. Call `/api/v1/upload` with `context: "gallery"` → get presigned URL
4. Upload file directly to R2 via PUT to presigned URL
5. On R2 success → call `/api/v1/gallery` with photo metadata
6. On success → show photo in grid + success toast
7. On failure (step 3, 4, or 5) → show error message + retry button (NFR15)

### Mapper Pattern

Follow `src/adapters/mappers/post.mapper.ts` as reference:

```typescript
export function photoToDomain(record: typeof photo.$inferSelect): Photo {
  return Photo.reconstitute({
    userId: record.userId,
    url: record.url,
    filename: record.filename,
    mimeType: record.mimeType,
    size: record.size,
    caption: Option.fromNullable(record.caption),
    createdAt: record.createdAt,
  }, new UUID(record.id));
}

export function photoToPersistence(entity: Photo): typeof photo.$inferInsert {
  return {
    id: entity.id.value,
    userId: entity.get("userId"),
    url: entity.get("url"),
    filename: entity.get("filename"),
    mimeType: entity.get("mimeType"),
    size: entity.get("size"),
    caption: entity.get("caption").isSome() ? entity.get("caption").unwrap() : null,
    createdAt: entity.get("createdAt"),
  };
}
```

### Repository Pattern

Follow `src/adapters/repositories/post.repository.ts` as reference:
- Implement `create()` → insert using mapper
- Implement `findById()` → select + map to domain
- Implement `findByUserId()` → select with pagination (for Story 5.2 gallery browsing)
- Implement `delete()` → delete by id (for Story 5.2)
- Implement `count()` → count by userId (for pagination)
- All methods return `Result<T>`

### DI Registration Pattern

**gallery.module.ts:**
```typescript
const m = createModule();
m.bind(DI_SYMBOLS.IGalleryRepository).toClass(DrizzleGalleryRepository);
m.bind(DI_SYMBOLS.AddPhotoUseCase).toClass(AddPhotoUseCase, [DI_SYMBOLS.IGalleryRepository]);
return m;
```

**types.ts additions:**
```typescript
// In DI_SYMBOLS:
IGalleryRepository: Symbol.for("IGalleryRepository"),
AddPhotoUseCase: Symbol.for("AddPhotoUseCase"),

// In DI_RETURN_TYPES interface:
IGalleryRepository: IGalleryRepository;
AddPhotoUseCase: AddPhotoUseCase;
```

**container.ts:** Load `createGalleryModule()` alphabetically between `createFriendModule()` and `createNotificationModule()`.

### shadcn/ui Components

**Already installed:** Button, Card, Dialog, Input, Label, Separator, Progress, Badge, Tabs

**May need:** None specifically for upload. Use native `<input type="file">` or a simple drop zone with existing Button component.

**shadcn import path fix:** If any new shadcn component is installed, fix import paths from `/src/libs/utils` to `../../libs/utils` (known recurring issue from Epic 4 retro).

### File Structure

```
# New files to create
packages/drizzle/src/schema/gallery.ts                                    # DB schema

apps/nextjs/src/domain/gallery/photo.aggregate.ts                          # Aggregate
apps/nextjs/src/domain/gallery/photo-id.ts                                 # Typed ID
apps/nextjs/src/domain/gallery/value-objects/photo-caption.vo.ts           # Caption VO
apps/nextjs/src/domain/gallery/events/photo-uploaded.event.ts              # Domain event

apps/nextjs/src/application/ports/gallery-repository.port.ts               # Port
apps/nextjs/src/application/dto/gallery/add-photo.dto.ts                   # DTOs
apps/nextjs/src/application/use-cases/gallery/add-photo.use-case.ts        # Use case
apps/nextjs/src/application/use-cases/gallery/__tests__/add-photo.use-case.test.ts  # Tests

apps/nextjs/src/adapters/mappers/gallery.mapper.ts                         # Mapper
apps/nextjs/src/adapters/repositories/gallery.repository.ts                # Repository
apps/nextjs/src/adapters/controllers/gallery/gallery.controller.ts         # Controller

apps/nextjs/app/api/v1/gallery/route.ts                                    # API route
apps/nextjs/app/(protected)/gallery/page.tsx                               # Page
apps/nextjs/app/(protected)/gallery/_components/gallery-upload.tsx          # Upload component

apps/nextjs/common/di/modules/gallery.module.ts                            # DI module

# Files to modify
apps/nextjs/common/di/types.ts                   # Add IGalleryRepository + AddPhotoUseCase symbols
apps/nextjs/common/di/container.ts               # Load gallery module
```

### Data Integrity Checklist (Epic 3 Retro)

- **N+1 possible?** No — single insert for photo creation, single query for gallery list
- **Race conditions?** No — each photo upload is independent, no shared state
- **Performance?** Presigned URL approach — no server-side file processing. Upload goes directly from client to R2.
- **Stale data?** Gallery list refreshes on page load. No real-time requirement.

### Security Checklist (Epic 2 Retro)

- Every endpoint requires `getAuthenticatedUser()` check
- Repository queries filter by `userId = session.user.id` — users only see their own photos
- No cross-user data exposure possible
- File validation happens twice: client-side (UX) + server-side (UploadContext + FileMetadata VOs)
- Presigned URLs are time-limited (15 min expiry)
- If page becomes client component, verify auth guard remains in layout.tsx (Epic 4 retro action #3)

### Code Duplication Checklist (Epic 4 Retro)

- **Shared DTOs exist?** Common user DTO in `dto/common.dto.ts` — not needed for gallery
- **Mapper reusable?** Gallery mapper is unique — no overlap with post mapper
- **Helper already extracted?** Upload infrastructure fully shared — no duplication needed

### What NOT to Build in Story 5.1

- No gallery browsing UI (Story 5.2)
- No photo deletion (Story 5.2)
- No full-size image viewer (Story 5.2)
- No photo editing/cropping
- No multi-select/batch operations
- No captions editing after upload
- No IEventDispatcher wiring (Epic 7)
- No R2 file deletion on photo record delete (Story 5.2 scope)

### Critical Anti-Patterns to Avoid

1. **Do NOT recreate upload infrastructure** — use existing `/api/v1/upload` endpoint with `context: "gallery"`
2. **Do NOT use server-side file upload** (FormData proxy) — use presigned URL approach
3. **Do NOT store images as JSONB array** — each photo is its own aggregate/row (unlike Post which has images[])
4. **Do NOT create index.ts barrel files**
5. **Do NOT throw exceptions** in domain/application — use Result<T>
6. **Do NOT use null** — use Option<T> for optional values (caption)
7. **Do NOT add IEventDispatcher** wiring (Epic 7)
8. **Do NOT install heavy gallery/image libraries** — simple grid + native upload is sufficient
9. **Do NOT add comments** — self-documenting code

### Golden Reference Files

| Purpose | Source File | Adaptation |
|---------|------------|------------|
| Aggregate | `src/domain/post/post.aggregate.ts` | Simpler — no reactions, no update method |
| Typed ID | `src/domain/post/post-id.ts` | Same pattern |
| Value Object | `src/domain/post/value-objects/post-content.vo.ts` | PhotoCaption — optional, max 500 chars |
| Domain Event | `src/domain/post/events/post-created.event.ts` | PhotoUploadedEvent |
| Port | `src/application/ports/post-repository.port.ts` | IGalleryRepository |
| DTO | `src/application/dto/post/create-post.dto.ts` | AddPhoto DTOs |
| Use Case | `src/application/use-cases/post/create-post.use-case.ts` | AddPhotoUseCase — simpler |
| Test | `src/application/use-cases/post/__tests__/create-post.use-case.test.ts` | AddPhoto tests |
| Mapper | `src/adapters/mappers/post.mapper.ts` | Gallery mapper |
| Repository | `src/adapters/repositories/post.repository.ts` | Gallery repository |
| Controller | `src/adapters/controllers/post/post.controller.ts` | addPhotoController |
| API Route | `app/api/v1/posts/route.ts` | gallery route (POST) |
| DB Schema | `packages/drizzle/src/schema/post.ts` | Photo schema |
| Page | `app/(protected)/social/page.tsx` | Gallery page |
| Upload client | `app/(protected)/posts/_components/create-post-form.tsx` | Upload flow reference |
| DI Module | `common/di/modules/post.module.ts` | Gallery module |

### Previous Story Intelligence (Epic 4)

Key learnings from Epic 4 retro that impact this story:

1. **shadcn import paths broken on every install** — If adding any new shadcn component, fix imports from `/src/libs/utils` to `../../libs/utils`
2. **Auth guard must live in layout.tsx** — If gallery page becomes client component (for upload interactivity), ensure auth guard is NOT in page.tsx. Create `app/(protected)/gallery/layout.tsx` if needed, OR rely on the existing `(protected)/layout.tsx` which already calls `requireAuth()`.
3. **Code duplication caught only in review** — Use the duplication checklist above proactively
4. **Data integrity checklist works** — Zero N+1 queries across Epic 4 when checklist followed
5. **IEventDispatcher NOT wired** — Events added via addEvent() but not dispatched. Continue this pattern. Deferred to Epic 7.
6. **287 tests passing** — current baseline. New gallery tests must not break existing tests.
7. **Biome formatting: spaces not tabs** — Always run `pnpm fix` after writing files.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.1: Upload Photos to Gallery]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5: Photo Gallery]
- [Source: _bmad-output/planning-artifacts/architecture.md#File Upload — Shared Endpoint]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure — gallery/ new files]
- [Source: _bmad-output/implementation-artifacts/1-1-shared-file-upload-infrastructure.md — upload infrastructure reference]
- [Source: _bmad-output/implementation-artifacts/epic-4-retro-2026-02-08.md — retro learnings]
- [Source: apps/nextjs/src/domain/upload/value-objects/upload-context.vo.ts — gallery context already supported]
- [Source: apps/nextjs/src/application/ports/storage.provider.port.ts — IStorageProvider interface]
- [Source: apps/nextjs/src/adapters/services/storage/r2-storage.service.ts — R2 presigned URLs]
- [Source: apps/nextjs/src/domain/post/post.aggregate.ts — aggregate pattern reference]
- [Source: apps/nextjs/src/adapters/mappers/post.mapper.ts — mapper pattern reference]
- [Source: apps/nextjs/src/adapters/repositories/post.repository.ts — repository pattern reference]
- [Source: packages/drizzle/src/schema/post.ts — schema pattern reference]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — no debug issues encountered.

### Completion Notes List

- Fixed auth guard import path in gallery page: `@/adapters/guards/require-auth` → `@/adapters/guards/auth.guard`
- Photo aggregate is immutable (create-only, no updatedAt) — consistent with story design
- Caption uses `Option<PhotoCaption>` pattern for optional values
- PhotoUploadedEvent added via `addEvent()` — IEventDispatcher not wired yet (Epic 7)
- Gallery upload component implements full 3-step presigned URL flow reusing existing `/api/v1/upload` endpoint
- Client-side file validation (type + size) before server roundtrip
- Retry button on upload failure (NFR15)
- Drizzle migration auto-generated: `0011_lowly_umar.sql`
- 6 new BDD tests: happy path (with/without caption), persistence verification, event emission, validation error (caption >500 chars), repo failure handling
- All 293 tests pass (287 existing + 6 new)

### Code Review Fixes (2026-02-09)

- **M2 fix**: Added `min(1)` validation to PhotoCaption VO — empty strings no longer pass
- **M3+M4 fix**: Added CQRS query `gallery.query.ts` + `getUserGalleryController` GET endpoint + `useEffect` fetch on mount to load existing photos
- **H2 fix**: Replaced local `UploadedPhoto` interface with shared `GalleryPhotoDto` type from query
- **H1, H3 downgraded**: `status: 500` for use case errors and `<img>` usage are consistent with existing project patterns (post controller, posts-list, journal-entries)

### File List

**Created:**
- `packages/drizzle/src/schema/gallery.ts`
- `apps/nextjs/src/domain/gallery/photo.aggregate.ts`
- `apps/nextjs/src/domain/gallery/photo-id.ts`
- `apps/nextjs/src/domain/gallery/value-objects/photo-caption.vo.ts`
- `apps/nextjs/src/domain/gallery/events/photo-uploaded.event.ts`
- `apps/nextjs/src/application/ports/gallery-repository.port.ts`
- `apps/nextjs/src/application/dto/gallery/add-photo.dto.ts`
- `apps/nextjs/src/application/use-cases/gallery/add-photo.use-case.ts`
- `apps/nextjs/src/application/use-cases/gallery/__tests__/add-photo.use-case.test.ts`
- `apps/nextjs/src/adapters/mappers/gallery.mapper.ts`
- `apps/nextjs/src/adapters/repositories/gallery.repository.ts`
- `apps/nextjs/src/adapters/controllers/gallery/gallery.controller.ts`
- `apps/nextjs/src/adapters/queries/gallery.query.ts`
- `apps/nextjs/app/api/v1/gallery/route.ts`
- `apps/nextjs/app/(protected)/gallery/page.tsx`
- `apps/nextjs/app/(protected)/gallery/_components/gallery-upload.tsx`
- `apps/nextjs/common/di/modules/gallery.module.ts`

**Modified:**
- `packages/drizzle/src/schema/index.ts` — added gallery export
- `apps/nextjs/common/di/types.ts` — added IGalleryRepository + AddPhotoUseCase symbols/types
- `apps/nextjs/common/di/container.ts` — added gallery module import + load
