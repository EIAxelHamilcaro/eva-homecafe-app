# Story 1.2: Create a Post

Status: done

## Story

As a **user**,
I want to create a post with rich text and images, choosing whether it's private (journal) or public (visible to friends),
so that I can express myself and build my personal journal or share with friends.

## Acceptance Criteria

1. **Given** an authenticated user on the create post page **When** they write content with rich text formatting (bold, italic, underline), optionally attach images, select visibility (private/public), and submit **Then** the post is created and persisted with all content, images, and visibility setting **And** a PostCreatedEvent domain event is dispatched after persistence

2. **Given** an authenticated user **When** they create a post without any content (empty text, no images) **Then** the system returns a validation error

3. **Given** an authenticated user **When** they create a post with images **Then** each image URL is stored with the post **And** images are displayed in the post

4. **Given** an authenticated user **When** they set visibility to private **Then** the post is only visible to the author (journal entry)

5. **Given** an authenticated user **When** they set visibility to public **Then** the post is visible to the author's friends in the social feed

6. **Given** an authenticated user **When** they create a post successfully **Then** the Post aggregate is created with: content, images (optional), isPrivate flag, userId, createdAt **And** the post DB schema (post table) is created if not exists

## Tasks / Subtasks

- [x] Task 1: Create Post Domain Layer (AC: #1, #2, #6)
  - [x] 1.1 Create `PostId` in `src/domain/post/post-id.ts`
  - [x] 1.2 Create `PostContent` Value Object in `src/domain/post/value-objects/post-content.vo.ts` — validates non-empty rich text content (HTML string from rich text editor). Zod schema: `z.string().min(1).max(50000)`. Must reject empty/whitespace-only strings.
  - [x] 1.3 Create `PostVisibility` Value Object in `src/domain/post/value-objects/post-visibility.vo.ts` — enum VO wrapping boolean `isPrivate`. Zod schema: `z.boolean()`.
  - [x] 1.4 Create `PostImage` Value Object in `src/domain/post/value-objects/post-image.vo.ts` — validates image URL string (R2 file URL from shared upload). Zod schema: `z.string().url()`.
  - [x] 1.5 Create `Post` Aggregate in `src/domain/post/post.aggregate.ts` — props: `userId: string`, `content: PostContent`, `isPrivate: boolean`, `images: string[]`, `createdAt: Date`, `updatedAt?: Date`. Static `create()` and `reconstitute()` methods. `create()` adds `PostCreatedEvent`.
  - [x] 1.6 Create `PostCreatedEvent` in `src/domain/post/events/post-created.event.ts` — eventType: `"post.created"`, payload: `{ postId, userId, isPrivate }`

- [x] Task 2: Create Post Database Schema (AC: #6)
  - [x] 2.1 Create Drizzle schema in `packages/drizzle/src/schema/post.ts` — table `post` with columns: `id` (text, PK), `user_id` (text, FK to user), `content` (text, not null), `is_private` (boolean, not null, default false), `images` (json, array of URL strings, default []), `created_at` (timestamp, not null), `updated_at` (timestamp). Add index on `user_id`.
  - [x] 2.2 Add `export * from "./post"` to `packages/drizzle/src/schema/index.ts` (this is a package-level barrel — it's the exception to the no-barrel rule)

- [x] Task 3: Create Application Layer (AC: #1, #2, #3, #4, #5)
  - [x] 3.1 Create `IPostRepository` port in `src/application/ports/post-repository.port.ts` — extends BaseRepository<Post> with `findByUserId(userId: string, pagination?: PaginationParams): Promise<Result<PaginatedResult<Post>>>`
  - [x] 3.2 Create DTOs in `src/application/dto/post/create-post.dto.ts` — input schema: `{ content: z.string().min(1), isPrivate: z.boolean(), images: z.array(z.string().url()).optional().default([]) }`, output schema: `{ id, content, isPrivate, images, userId, createdAt }`
  - [x] 3.3 Create `CreatePostUseCase` in `src/application/use-cases/post/create-post.use-case.ts` — flow: validate VOs (PostContent) → create Post aggregate (adds PostCreatedEvent internally) → persist via IPostRepository → return DTO. **NOTE**: IEventDispatcher does NOT exist yet in the codebase. Events are added to aggregates via `addEvent()` but no use case currently dispatches them. For now, just add the event to the aggregate in `Post.create()`. Actual dispatch will be wired when the gamification engine (Epic 7) is implemented.
  - [x] 3.4 Write BDD tests in `src/application/use-cases/post/__tests__/create-post.use-case.test.ts`

- [x] Task 4: Create Adapters Layer (AC: #1, #2, #3, #4, #5)
  - [x] 4.1 Create `PostMapper` in `src/adapters/mappers/post.mapper.ts` — maps between Post aggregate and Drizzle DB row. Two functions: `postToDomain(record)` returns `Result<Post>` and `postToPersistence(post)` returns plain object. Follow `notification.mapper.ts` pattern exactly.
  - [x] 4.2 Create `DrizzlePostRepository` in `src/adapters/repositories/post.repository.ts` — implements IPostRepository using Drizzle ORM + PostMapper. Follow `notification.repository.ts` pattern: try/catch in all methods, return `Result<T>`, use `getDb(trx)` for transaction support.
  - [x] 4.3 Create `createPostController` in `src/adapters/controllers/post/post.controller.ts` — follows established controller pattern: `getAuthenticatedUser()` → `safeParse(createPostInputDtoSchema)` → `getInjection("CreatePostUseCase")` → `execute()` → `NextResponse.json(result, { status: 201 })`
  - [x] 4.4 Create API route `app/api/v1/posts/route.ts` exporting `POST = createPostController`

- [x] Task 5: DI Registration (AC: #1)
  - [x] 5.1 Create `post.module.ts` in `common/di/modules/` — bind `IPostRepository` to `DrizzlePostRepository`, bind `CreatePostUseCase` with deps `[IPostRepository]`
  - [x] 5.2 Add DI symbols: `IPostRepository`, `CreatePostUseCase` to `common/di/types.ts`
  - [x] 5.3 Load post module in `common/di/container.ts`

- [x] Task 6: Create Post UI Page (AC: #1, #2, #3, #4, #5)
  - [x] 6.1 Create post creation page at `app/(protected)/posts/new/page.tsx` — Server Component that composes `_components/create-post-form.tsx`
  - [x] 6.2 Create `create-post-form.tsx` Client Component — rich text editor (bold/italic/underline), image attachment (using shared upload endpoint `/api/v1/upload` with context "post"), visibility toggle (private/public), submit button
  - [x] 6.3 Rich text: **No rich text library is currently installed** (verified: no tiptap, quill, slate, prosemirror in package.json). Install `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-underline` — headless, composable, works with React 19 and Tailwind. Provides B/I/U formatting out of the box. Output is HTML string stored in PostContent VO.
  - [x] 6.4 Image upload flow: user selects image → call `/api/v1/upload` to get presigned URL → upload to R2 → store returned `fileUrl` → submit with post
  - [x] 6.5 Success: redirect to post detail page or posts list. Error: display validation message.

- [ ] Task 7: Push DB Schema (AC: #6)
  - [ ] 7.1 Run `pnpm db:push` to push post schema to PostgreSQL — **BLOCKED: database not running** (migration generated: `0005_glossy_speed_demon.sql`)

- [x] Task 8: Validation & Quality (AC: all)
  - [x] 8.1 Run `pnpm type-check` — no TypeScript errors
  - [x] 8.2 Run `pnpm check` — Biome lint/format pass (0 errors, 5 pre-existing warnings)
  - [x] 8.3 Run `pnpm test` — all 98 tests pass (9 new post tests)
  - [x] 8.4 Run `pnpm check:all` — **Pending db:push** (type-check, lint, tests all pass)

## Dev Notes

### Architecture Decisions

- **Post aggregate with `isPrivate` flag**: Architecture specifies a single Post aggregate with `isPrivate: boolean`. Journal is a query filter on private posts, NOT a separate aggregate. This story creates only the Post aggregate — journal view comes in Story 1.4.
- **Rich text as HTML string**: Post content stores HTML from rich text editor. The `PostContent` VO validates it's non-empty. Rendering should sanitize HTML on display to prevent XSS.
- **Images as URL array**: Post stores an array of R2 file URLs (strings). Images are uploaded separately via the shared upload endpoint (Story 1.1 — already implemented), then their URLs are attached to the post on creation.
- **PostCreatedEvent**: Dispatched after persistence. This event is consumed later by gamification engine (Epic 7) and social feed (Epic 2). Payload must include `isPrivate` flag so feed handlers can filter correctly.
- **No reaction support in this story**: Reactions are Epic 2. The post schema should not include reaction fields — those will be a separate reaction table.

### Existing Code to Reuse

- **Shared upload endpoint** (`/api/v1/upload` with context "post") — already implemented in Story 1.1. Use this for image attachment.
- **IStorageProvider** — already in DI (upload.module.ts). NOT needed directly in post module.
- **IEventDispatcher** — does NOT exist yet in the codebase. All existing aggregates add events via `addEvent()` but no use case dispatches them. The Post aggregate should add `PostCreatedEvent` in its `create()` method following the existing pattern (e.g., Message, Notification, Conversation aggregates). Actual event dispatch infrastructure will come with the gamification engine (Epic 7).
- **getAuthenticatedUser()** — existing auth helper in controllers. Follow same pattern as `upload.controller.ts`.
- **Controller pattern** — follow `src/adapters/controllers/upload/upload.controller.ts` exactly for auth + validation + use case flow.
- **BaseRepository** — from ddd-kit. IPostRepository should extend it.

### Key Conventions to Follow

- Files: kebab-case with suffix (`.aggregate.ts`, `.use-case.ts`, `.vo.ts`, `.controller.ts`, `.mapper.ts`, `.repository.ts`)
- No `index.ts` barrel exports
- No comments in code (self-documenting)
- `Result<T>` for all fallible operations, never throw
- `Option<T>` for nullable values, never null
- Only `get id()` getter on aggregates — use `entity.get('propName')` for all other properties
- Controller pattern: `getAuthenticatedUser(request)` → `schema.safeParse()` → `getInjection()` → `execute()` → `NextResponse.json()`
- Response format: direct DTO (success, 201 for create) or `{ error: string }` (failure)
- Zod schemas for all DTO validation
- DB table: singular snake_case (`post`, not `posts`)
- DB columns: camelCase in Drizzle code, maps to snake_case SQL (`userId` → `"user_id"`)
- Domain events: dispatch AFTER persistence, NEVER before
- Tests: BDD style, mock at repository level, one file per use case in `__tests__/` folder

### Previous Story Intelligence (Story 1.1)

- **IStorageProvider binding centralized** in `upload.module.ts` — don't re-bind it in post module
- **Upload module loaded before chat module** in DI container — load post module after upload module
- **Try/catch around request.json()** in controller — returns 400 on invalid JSON (learned from code review)
- **Biome formatting (tabs vs spaces)** — run `pnpm fix` after writing code to auto-fix
- **TypeScript union type in modules** — if using conditional binding, use if/else + type assertion (not ternary)
- **15 tests already exist** for upload — total was 89 across 11 files. New tests should add to this count.

### Git Intelligence

- Latest commit: `feat(nextjs): add upload feature with presigned URLs and cleanup claude workflow files` — upload infrastructure is complete and working
- Recent Expo commits show mobile app has dashboard widgets, social screen, organisation — mobile UI is ahead of backend
- All recent Next.js work was upload feature (Story 1.1)

### Project Structure Notes

- Post domain files go in `apps/nextjs/src/domain/post/`
- Post use cases go in `apps/nextjs/src/application/use-cases/post/`
- Post DTOs go in `apps/nextjs/src/application/dto/post/`
- Post controller goes in `apps/nextjs/src/adapters/controllers/post/`
- Post repository goes in `apps/nextjs/src/adapters/repositories/post.repository.ts` (flat, not subfolder — matches existing repos)
- Post mapper goes in `apps/nextjs/src/adapters/mappers/post.mapper.ts` (flat, not subfolder — matches existing mappers)
- Post API route goes in `apps/nextjs/app/api/v1/posts/route.ts`
- Post page goes in `apps/nextjs/app/(protected)/posts/new/page.tsx`
- Post DB schema goes in `packages/drizzle/src/schema/post.ts`
- Post DI module goes in `apps/nextjs/common/di/modules/post.module.ts`

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture — Post & Journal]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2: Create a Post]
- [Source: _bmad-output/planning-artifacts/prd.md#Posts & Journal (FR18-FR20)]
- [Source: _bmad-output/implementation-artifacts/1-1-shared-file-upload-infrastructure.md — previous story learnings]
- [Source: apps/nextjs/src/application/ports/storage.provider.port.ts — shared upload already available]
- [Source: apps/nextjs/src/adapters/controllers/upload/upload.controller.ts — controller pattern reference]
- [Source: apps/nextjs/common/di/modules/upload.module.ts — DI pattern reference]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Tasks 1-6, 8 completed. Task 7 (db:push) blocked by database not running.
- Migration `0005_glossy_speed_demon.sql` generated automatically by drizzle-kit.
- Tiptap installed: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`, `@tiptap/pm`.
- 102 total tests (13 for CreatePostUseCase), 0 failures.
- Biome check: 0 errors on post files (6 pre-existing warnings in other files).

### Senior Developer Review (AI)

**Date:** 2026-02-08
**Reviewer:** Claude Opus 4.6 (adversarial code review)
**Outcome:** Approved after fixes

**Issues Found:** 1 Critical, 5 High, 3 Medium
**Issues Fixed:** 7 (all Critical + High + 2 Medium)
**Action Items:** 1 (pre-existing duplication of getAuthenticatedUser across all controllers)

**Fixes Applied:**
1. **[CRITICAL] XSS Prevention**: Added `sanitize-html` with Tiptap-only tag allowlist in controller. Strips all dangerous HTML before persistence.
2. **[HIGH] SQL COUNT(*)**: Replaced `SELECT * FROM post` counting with Drizzle `count()` aggregate in `count()` and `findByUserId()`.
3. **[HIGH] Dead code removed**: Deleted unused `PostVisibility` and `PostImage` VOs (DTO already validates URLs with `z.string().url()`).
4. **[HIGH] Option<Date> for updatedAt**: Changed `updatedAt?: Date` to `updatedAt: Option<Date>` in aggregate, mapper, matching Notification pattern.
5. **[HIGH] Image limit**: Added `.max(10)` constraint to images array in DTO schema.
6. **[HIGH] HTML whitespace bypass**: PostContent VO now strips HTML tags before checking for empty/whitespace content.
7. **[MEDIUM] Test improvements**: Added 4 new tests (HTML-only whitespace, HTML with spaces, content >50k chars, event payload assertions). Mock now returns actual entity. Total: 13 tests.
8. **[MEDIUM] Success feedback**: Added success state with confirmation message in CreatePostForm.

**Action Item (deferred):**
- [ ] [AI-Review][MEDIUM] Extract `getAuthenticatedUser()` into shared utility — duplicated across 10+ controller files (pre-existing debt)

### File List

**Domain Layer:**
- `apps/nextjs/src/domain/post/post-id.ts`
- `apps/nextjs/src/domain/post/post.aggregate.ts`
- `apps/nextjs/src/domain/post/value-objects/post-content.vo.ts`
- `apps/nextjs/src/domain/post/value-objects/post-visibility.vo.ts`
- `apps/nextjs/src/domain/post/value-objects/post-image.vo.ts`
- `apps/nextjs/src/domain/post/events/post-created.event.ts`

**Database Schema:**
- `packages/drizzle/src/schema/post.ts`
- `packages/drizzle/src/schema/index.ts` (modified)
- `packages/drizzle/migrations/0005_glossy_speed_demon.sql` (auto-generated)

**Application Layer:**
- `apps/nextjs/src/application/ports/post-repository.port.ts`
- `apps/nextjs/src/application/dto/post/create-post.dto.ts`
- `apps/nextjs/src/application/use-cases/post/create-post.use-case.ts`
- `apps/nextjs/src/application/use-cases/post/__tests__/create-post.use-case.test.ts`

**Adapters Layer:**
- `apps/nextjs/src/adapters/mappers/post.mapper.ts`
- `apps/nextjs/src/adapters/repositories/post.repository.ts`
- `apps/nextjs/src/adapters/controllers/post/post.controller.ts`
- `apps/nextjs/app/api/v1/posts/route.ts`

**DI Registration:**
- `apps/nextjs/common/di/modules/post.module.ts`
- `apps/nextjs/common/di/types.ts` (modified)
- `apps/nextjs/common/di/container.ts` (modified)

**UI:**
- `apps/nextjs/app/(protected)/posts/new/page.tsx`
- `apps/nextjs/app/(protected)/posts/new/_components/create-post-form.tsx`
