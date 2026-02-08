# Story 1.1: Shared File Upload Infrastructure

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to upload images securely to the platform,
so that I can attach photos to my posts, gallery, and moodboards.

## Acceptance Criteria

1. **Given** an authenticated user **When** they send a POST request to `/api/v1/upload` with a `context` parameter (post, gallery, moodboard, avatar) and file metadata (name, type, size) **Then** the system returns a presigned R2 URL for direct upload **And** the URL is time-limited and authenticated

2. **Given** an unauthenticated user **When** they request an upload URL **Then** the system returns a 401 Unauthorized error

3. **Given** a file exceeding 10MB **When** the user requests an upload URL **Then** the system returns a 400 error with a clear message about the size limit

4. **Given** a non-image file type **When** the user requests an upload URL **Then** the system returns a 400 error indicating only image formats are accepted

5. **Given** an invalid context value **When** the user requests an upload URL **Then** the system returns a 400 validation error

## Tasks / Subtasks

- [x] Task 1: Create Upload Domain Layer (AC: #1, #3, #4, #5)
  - [x] 1.1 Create `UploadContext` Value Object in `src/domain/upload/value-objects/upload-context.vo.ts` — validates context is one of: post, gallery, moodboard, avatar
  - [x] 1.2 Create `FileMetadata` Value Object in `src/domain/upload/value-objects/file-metadata.vo.ts` — validates file name, MIME type (image/jpeg, image/png, image/gif, image/webp), and size (max 10MB)
  - [x] ~~1.3 Create upload domain errors~~ — Removed during code review: VOs handle validation via Result.fail() strings, custom error classes were dead code

- [x] Task 2: Update IStorageProvider Port (AC: #1)
  - [x] 2.1 Add `generatePresignedUploadUrl(input: IPresignedUrlInput): Promise<Result<IPresignedUrlOutput>>` method to existing `IStorageProvider` port in `src/application/ports/storage.provider.port.ts`
  - [x] 2.2 Define `IPresignedUrlInput` type: `{ key: string; mimeType: string; size: number; expiresIn?: number }`
  - [x] 2.3 Define `IPresignedUrlOutput` type: `{ uploadUrl: string; fileUrl: string; key: string; expiresAt: Date }`

- [x] Task 3: Create GenerateUploadUrl Use Case (AC: #1, #2, #3, #4, #5)
  - [x] 3.1 Create `GenerateUploadUrlUseCase` in `src/application/use-cases/upload/generate-upload-url.use-case.ts`
  - [x] 3.2 Create DTOs in `src/application/dto/upload/generate-upload-url.dto.ts` with Zod schemas for input (context, filename, mimeType, size) and output (uploadUrl, fileUrl, key, expiresAt)
  - [x] 3.3 Use case flow: validate VOs (UploadContext, FileMetadata) → generate storage key with context-based prefix (e.g., `post/{userId}/{uuid}.ext`) → call `IStorageProvider.generatePresignedUploadUrl()` → return presigned URL
  - [x] 3.4 Write BDD tests in `src/application/use-cases/upload/__tests__/generate-upload-url.use-case.test.ts`

- [x] Task 4: Implement R2 Storage Provider (AC: #1)
  - [x] 4.1 Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` packages
  - [x] 4.2 Create `R2StorageService` in `src/adapters/services/storage/r2-storage.service.ts` implementing `IStorageProvider` with R2/S3-compatible presigned URL generation
  - [x] 4.3 Keep `LocalStorageService` as fallback — select provider via environment variable `STORAGE_PROVIDER` (local | r2)
  - [x] 4.4 Add environment variables: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

- [x] Task 5: Create Upload Controller & API Route (AC: #1, #2, #3, #4, #5)
  - [x] 5.1 Create `generateUploadUrlController` in `src/adapters/controllers/upload/upload.controller.ts` following established controller pattern (auth check → parse input → get use case → execute → return result)
  - [x] 5.2 Create API route `app/api/v1/upload/route.ts` exporting `POST = generateUploadUrlController`
  - [x] 5.3 Input: JSON body `{ context, filename, mimeType, size }` — NOT FormData (presigned URL approach)
  - [x] 5.4 Success response: `{ uploadUrl, fileUrl, key, expiresAt }` with status 200
  - [x] 5.5 Error responses: 400 (validation), 401 (unauthorized), 500 (storage error)

- [x] Task 6: DI Registration (AC: #1)
  - [x] 6.1 Create `upload.module.ts` in `common/di/modules/` — bind `IStorageProvider` (R2 or Local based on env), bind `GenerateUploadUrlUseCase`
  - [x] 6.2 Add DI symbols: `GenerateUploadUrlUseCase` to `common/di/types.ts`
  - [x] 6.3 Load upload module in `common/di/container.ts`
  - [x] 6.4 **IMPORTANT**: Update chat module to remove its own `IStorageProvider` binding (avoid duplicate) — storage provider should be registered once in upload module, shared by all consumers

- [x] Task 7: Validation & Quality (AC: all)
  - [x] 7.1 Run `pnpm type-check` — no TypeScript errors
  - [x] 7.2 Run `pnpm check` — Biome lint/format pass (5 pre-existing warnings, none in upload code)
  - [x] 7.3 Run `pnpm test` — all 89 tests pass (11 test files, including 15 new upload tests)
  - [x] 7.4 Run `pnpm check:all` — type-check, lint, tests all pass. Duplication check (8.77%) is a pre-existing issue (conversation.repository.ts, mappers), not introduced by this story

## Dev Notes

### Architecture Decisions

- **Presigned URL approach** (NOT server-side proxy): The architecture document specifies presigned R2 URLs where the client uploads directly to R2. The endpoint only generates and returns the presigned URL — the actual file upload happens client-to-R2. This is critical for NFR4 (upload <5s for 10MB files).
- **Shared endpoint, not per-feature**: Single `/api/v1/upload` endpoint with `context` parameter. All features (posts, gallery, moodboard, avatar) use this same endpoint. The `context` determines the storage key prefix.
- **No new aggregate needed**: Upload is a cross-cutting infrastructure concern, not a domain aggregate. It produces a URL, not a persisted domain entity. The aggregates that consume uploads (Post, Photo, Moodboard, Profile) store the resulting `fileUrl` in their own schemas.

### Existing Code to Be Aware Of

- **IStorageProvider port already exists** at `src/application/ports/storage.provider.port.ts` with `upload()`, `delete()`, `getUrl()` methods. The new `generatePresignedUploadUrl()` method is ADDED to this interface.
- **LocalStorageService already exists** at `src/adapters/services/storage/local-storage.service.ts`. It must be updated to implement the new method (can return a mock/local URL for development).
- **Chat module currently binds IStorageProvider** in `common/di/modules/chat.module.ts`. This binding must move to the new `upload.module.ts` to centralize storage provider registration.
- **UploadMediaUseCase (chat)** at `src/application/use-cases/chat/upload-media.use-case.ts` — this is the OLD server-proxy upload for chat. It should continue to work for backward compatibility but is NOT the pattern for the shared upload.
- **File size difference**: Chat upload allows 50MB (`MAX_IMAGE_SIZE`), shared upload limits to 10MB per PRD/architecture. These are intentionally different.

### Key Conventions to Follow

- Files: kebab-case with suffix (`.use-case.ts`, `.vo.ts`, `.controller.ts`)
- No `index.ts` barrel exports
- No comments in code (self-documenting)
- `Result<T>` for all fallible operations, never throw
- Controller pattern: `getAuthenticatedUser()` → `safeParse()` → `getInjection()` → `execute()` → `NextResponse.json()`
- Response format: direct DTO (success) or `{ error: string }` (failure)
- Zod schemas for all DTO validation

### Project Structure Notes

- All new files go under `apps/nextjs/` following established Clean Architecture layout
- Upload domain layer is lightweight (VOs + errors only, no aggregate)
- Storage key format: `{context}/{userId}/{uuid}.{ext}` — provides natural organization in R2 bucket
- Presigned URL expiry: 15 minutes (configurable via env or use case default)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#File Upload — Shared Endpoint]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1: Shared File Upload Infrastructure]
- [Source: apps/nextjs/src/application/ports/storage.provider.port.ts — existing IStorageProvider interface]
- [Source: apps/nextjs/src/adapters/services/storage/local-storage.service.ts — existing local storage implementation]
- [Source: apps/nextjs/common/di/modules/chat.module.ts — current IStorageProvider DI binding]
- [Source: apps/nextjs/src/adapters/controllers/chat/messages.controller.ts — controller pattern reference]
- [Source: apps/nextjs/src/application/use-cases/chat/upload-media.use-case.ts — existing upload use case pattern]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- TypeScript union type error in upload.module.ts — conditional ternary produced incompatible union type. Fixed with if/else branches + type assertion.
- Biome formatting (tabs vs spaces) — auto-fixed with `pnpm fix` (10 files).

### Completion Notes List

- All 7 tasks completed successfully
- 15 new BDD tests added, all passing (89 total tests across 11 files)
- Type-check, lint, and tests all pass clean
- Duplication check (8.77% > 5% threshold) is a pre-existing issue in conversation.repository.ts and mappers — not introduced by this story
- IStorageProvider binding centralized in upload.module.ts, removed from chat.module.ts
- Upload module loaded before chat module in DI container to ensure IStorageProvider availability
- LocalStorageService updated with mock `generatePresignedUploadUrl` for local development

### Code Review Fixes (AI)

- [H1] Controller: added try/catch around `request.json()` to return 400 on invalid JSON body instead of uncontrolled 500
- [M1] Use Case: replaced `path.extname(input.filename)` with `fileMetadata.extension` to leverage the VO properly, removed unused `path` import
- [M2] Deleted unused `upload.errors.ts` (domain errors never imported anywhere — VOs handle validation via Result.fail strings)
- [M3] R2StorageService: added fail-fast validation of env vars in constructor — throws descriptive error if any R2 config is missing
- [M4] Updated File List to include `apps/nextjs/package.json` (was missing)
- [M5] LocalStorageService: fixed mock presigned URL from non-existent `/api/v1/upload/local` route to `http://localhost:3000/uploads/{key}`

### File List

**Created:**
- `apps/nextjs/src/domain/upload/value-objects/upload-context.vo.ts`
- `apps/nextjs/src/domain/upload/value-objects/file-metadata.vo.ts`
- `apps/nextjs/src/application/dto/upload/generate-upload-url.dto.ts`
- `apps/nextjs/src/application/use-cases/upload/generate-upload-url.use-case.ts`
- `apps/nextjs/src/application/use-cases/upload/__tests__/generate-upload-url.use-case.test.ts`
- `apps/nextjs/src/adapters/services/storage/r2-storage.service.ts`
- `apps/nextjs/src/adapters/controllers/upload/upload.controller.ts`
- `apps/nextjs/app/api/v1/upload/route.ts`
- `apps/nextjs/common/di/modules/upload.module.ts`

**Modified:**
- `apps/nextjs/src/application/ports/storage.provider.port.ts` — added IPresignedUrlInput, IPresignedUrlOutput, generatePresignedUploadUrl method
- `apps/nextjs/src/adapters/services/storage/local-storage.service.ts` — added generatePresignedUploadUrl implementation
- `apps/nextjs/common/di/types.ts` — added GenerateUploadUrlUseCase symbol
- `apps/nextjs/common/di/container.ts` — added UploadModule import and load
- `apps/nextjs/common/di/modules/chat.module.ts` — removed IStorageProvider binding (moved to upload.module.ts)
- `apps/nextjs/package.json` — added @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner dependencies
