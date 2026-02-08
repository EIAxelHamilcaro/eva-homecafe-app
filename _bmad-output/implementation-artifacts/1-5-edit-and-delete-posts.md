# Story 1.5: Edit & Delete Posts

Status: done

## Story

As a **user**,
I want to edit and delete my own posts,
so that I can correct mistakes or remove content I no longer want.

## Acceptance Criteria

1. **Given** an authenticated user viewing their own post **When** they choose to edit and modify the content, images, or visibility setting, then save **Then** the post is updated with the new content **And** a PostUpdatedEvent domain event is added after persistence **And** the updatedAt timestamp is set

2. **Given** an authenticated user **When** they attempt to edit another user's post **Then** the system returns a 403 Forbidden error

3. **Given** an authenticated user viewing their own post **When** they choose to delete the post and confirm **Then** the post is permanently removed **And** a PostDeletedEvent domain event is added after persistence

4. **Given** an authenticated user **When** they attempt to delete another user's post **Then** the system returns a 403 Forbidden error

5. **Given** an authenticated user editing a post **When** they change visibility from public to private **Then** the post is removed from the social feed and appears only in their journal

6. **Given** an authenticated user editing a post **When** they submit empty content (no text, no images) **Then** the system returns a validation error

## Tasks / Subtasks

- [x] Task 1: Add Domain Events — PostUpdatedEvent & PostDeletedEvent (AC: #1, #3)
  - [x] 1.1 Create `src/domain/post/events/post-updated.event.ts` — follow existing `PostCreatedEvent` pattern. Payload: `{ postId, userId, isPrivate }`
  - [x] 1.2 Create `src/domain/post/events/post-deleted.event.ts` — Payload: `{ postId, userId }`

- [x] Task 2: Update Post Aggregate — Add mutation methods (AC: #1, #2, #3, #5, #6)
  - [x] 2.1 Add `updateContent(content: PostContent): void` method — sets `_props.content`, `_props.updatedAt = Option.some(new Date())`, adds `PostUpdatedEvent`
  - [x] 2.2 Add `updateVisibility(isPrivate: boolean): void` method — sets `_props.isPrivate`, `_props.updatedAt = Option.some(new Date())`, adds `PostUpdatedEvent`
  - [x] 2.3 Add `updateImages(images: string[]): void` method — sets `_props.images`, `_props.updatedAt = Option.some(new Date())`, adds `PostUpdatedEvent`
  - [x] 2.4 Add `markDeleted(): void` method — adds `PostDeletedEvent`

- [x] Task 3: Create DTOs (AC: #1, #3, #6)
  - [x] 3.1 Create `src/application/dto/post/update-post.dto.ts` — input: `{ postId, userId, content?, isPrivate?, images? }` (all fields optional except identifiers), output: reuse `postDtoSchema` from `get-user-posts.dto.ts`
  - [x] 3.2 Create `src/application/dto/post/delete-post.dto.ts` — input: `{ postId, userId }`, output: `{ id: string }`

- [x] Task 4: Create Use Cases (AC: #1, #2, #3, #4, #5, #6)
  - [x] 4.1 Create `src/application/use-cases/post/update-post.use-case.ts` — fetches post by ID, verifies ownership, validates content via PostContent VO if content provided, calls aggregate update methods, persists via `repo.update()`, returns updated post DTO
  - [x] 4.2 Create `src/application/use-cases/post/delete-post.use-case.ts` — fetches post by ID, verifies ownership, calls `markDeleted()` then `repo.delete()`, returns deleted post ID
  - [x] 4.3 Write tests `src/application/use-cases/post/__tests__/update-post.use-case.test.ts` — 12 tests: happy path (content, visibility, images, all fields, persist, event), authorization, not found, validation errors (empty, HTML whitespace), error handling (findById, update)
  - [x] 4.4 Write tests `src/application/use-cases/post/__tests__/delete-post.use-case.test.ts` — 7 tests: happy path (delete, repo call, event), authorization, not found, error handling (findById, delete)

- [x] Task 5: Register DI (AC: all)
  - [x] 5.1 Add `UpdatePostUseCase` and `DeletePostUseCase` symbols to `common/di/types.ts` — both in `DI_SYMBOLS` and `DI_RETURN_TYPES`, plus imports
  - [x] 5.2 Register `UpdatePostUseCase` and `DeletePostUseCase` in `common/di/modules/post.module.ts` — both depend on `[DI_SYMBOLS.IPostRepository]`

- [x] Task 6: Create Controllers & API Routes (AC: #1, #2, #3, #4, #6)
  - [x] 6.1 Add `updatePostController` to `src/adapters/controllers/post/post.controller.ts` — authenticate via `getAuthenticatedUser()`, parse body, sanitize HTML, validate DTO, execute use case, error mapping (Forbidden→403, not found→404)
  - [x] 6.2 Add `deletePostController` to `src/adapters/controllers/post/post.controller.ts` — authenticate, execute use case, error mapping
  - [x] 6.3 Update `app/api/v1/posts/[postId]/route.ts` — add exports `PATCH = updatePostController` and `DELETE = deletePostController`

- [x] Task 7: Create UI — Edit Post Page & Update Post Detail (AC: #1, #2, #3, #4, #5, #6)
  - [x] 7.1 Create `app/(protected)/posts/[postId]/edit/page.tsx` — Server Component with `requireAuth()`, renders `<EditPostForm postId={params.postId} />`
  - [x] 7.2 Create `app/(protected)/posts/[postId]/edit/_components/edit-post-form.tsx` — Client Component with Tiptap editor, pre-populated from GET, PATCH on submit, image upload, privacy toggle
  - [x] 7.3 Update `app/(protected)/posts/[postId]/_components/post-detail.tsx` — Edit link and Delete button with confirmation dialog, visible only for owner. Pass `currentUserId` from server page
  - [x] 7.4 Update `app/(protected)/posts/[postId]/page.tsx` — Pass `currentUserId={session.user.id}` to PostDetail

- [x] Task 8: Validation & Quality (AC: all)
  - [x] 8.1 Run `pnpm type-check` — 0 TypeScript errors
  - [x] 8.2 Run `pnpm check` — 0 errors, 23 pre-existing warnings
  - [x] 8.3 Run `pnpm test` — 146 tests pass (127 existing + 19 new), 0 regressions
  - [x] 8.4 Run `pnpm fix` — auto-fix formatting applied

## Dev Notes

### Architecture Decisions

- **Command path (not CQRS queries)**: Unlike Story 1.4 (read-only CQRS), this story involves write operations. Use the standard Command path: Controller -> Use Case -> Aggregate -> Repository with full DI.
- **Hard delete**: Delete permanently removes the post from the database. No soft delete — the existing `repo.delete(id)` does a hard DELETE SQL. No `deletedAt` column needed.
- **Ownership check in use case**: Authorization (is this my post?) is a business rule that belongs in the Use Case, not in the controller. Use case fetches the post, compares `post.get('userId')` with the requesting user's ID. Return `Result.fail("Forbidden")` if mismatch.
- **Partial updates allowed**: The update DTO makes content, isPrivate, and images all optional. The use case only calls the relevant aggregate methods for fields that are provided. This supports updating only the visibility without touching content.
- **HTML sanitization in controller**: Reuse the existing `sanitizeHtml()` function defined in `post.controller.ts` (uses `sanitize-html` with `ALLOWED_TAGS: ['b', 'i', 'u', 'p', 'br']`). Sanitize content before passing to use case, same pattern as create.
- **Event dispatch NOT wired**: Events are added to the aggregate via `addEvent()` but IEventDispatcher does not exist yet (Epic 7). Use cases should still add events for future-proofing but do NOT attempt to dispatch them.
- **No image cleanup**: Deleting a post or removing images from a post does NOT delete files from R2 storage. Image cleanup is out of scope for this story.

### Existing Code to Reuse (CRITICAL)

- **Repository `update()` and `delete()` — already implemented** in `src/adapters/repositories/post.repository.ts` (lines 46-73). Do NOT recreate. The repository update method calls `postToPersistence()` mapper and uses Drizzle's `.set()`. Delete uses Drizzle's `.delete().where(eq(postSchema.id, id.value))`.
- **Mapper `postToPersistence()` and `postToDomain()`** — already handles `updatedAt` as `Option<Date>`. No changes needed.
- **`getAuthenticatedUser(request)`** — helper at top of `post.controller.ts`. Reuse for new controllers.
- **`sanitizeHtml(html)`** — function in `post.controller.ts` using `sanitize-html` library. Reuse for content sanitization on update.
- **`ALLOWED_TAGS`** — defined in `post.controller.ts`. Reuse for consistency.
- **`postDtoSchema`** — from `src/application/dto/post/get-user-posts.dto.ts`. Reuse for update output. Already includes `updatedAt` as optional ISO string.
- **`PostContent` VO** — `src/domain/post/value-objects/post-content.vo.ts`. Reuse for validating updated content (1-50000 chars, not empty after HTML strip).
- **`PostCreatedEvent` pattern** — `src/domain/post/events/post-created.event.ts`. Copy this pattern for PostUpdatedEvent and PostDeletedEvent.
- **Tiptap editor setup** — `app/(protected)/posts/new/_components/create-post-form.tsx`. Copy the editor configuration (StarterKit + Underline), toolbar buttons, and image upload flow for the edit form.
- **`stripHtml` and `truncate` utilities** — `common/utils/text.ts`. Available for content preview if needed.

### Existing Code File Paths

| Component | Path | Status |
|---|---|---|
| Post aggregate | `src/domain/post/post.aggregate.ts` | UPDATE — add mutation methods |
| PostCreatedEvent | `src/domain/post/events/post-created.event.ts` | REFERENCE — copy pattern |
| PostContent VO | `src/domain/post/value-objects/post-content.vo.ts` | REUSE as-is |
| IPostRepository | `src/application/ports/post-repository.port.ts` | COMPLETE — has update/delete |
| Repository impl | `src/adapters/repositories/post.repository.ts` | COMPLETE — update/delete implemented |
| Mapper | `src/adapters/mappers/post.mapper.ts` | COMPLETE — handles updatedAt |
| Controllers | `src/adapters/controllers/post/post.controller.ts` | UPDATE — add 2 controllers |
| Post routes | `app/api/v1/posts/[postId]/route.ts` | UPDATE — add PATCH/DELETE |
| DI types | `common/di/types.ts` | UPDATE — add 2 symbols |
| DI module | `common/di/modules/post.module.ts` | UPDATE — register 2 use cases |
| Post detail component | `app/(protected)/posts/[postId]/_components/post-detail.tsx` | UPDATE — add edit/delete buttons |
| Create post form | `app/(protected)/posts/new/_components/create-post-form.tsx` | REFERENCE — copy Tiptap setup |
| DB schema | `packages/drizzle/src/schema/post.ts` | COMPLETE — no changes |

### Key Conventions to Follow

- Files: kebab-case with suffix (`.use-case.ts`, `.dto.ts`, `.event.ts`, `.controller.ts`)
- No `index.ts` barrel exports
- No comments in code
- Domain/Application: NEVER throw — return `Result.fail(errorMessage)`
- Only `get id()` getter on aggregate — use `entity.get('propName')` for all other props
- Controller pattern: `getAuthenticatedUser(request)` -> parse/validate input -> `getInjection()` -> execute use case -> Result handling -> JSON response
- Error status mapping: check error message with `.includes()` — "Forbidden" -> 403, "not found" -> 404, validation -> 400, else 500
- Response format: direct DTO (200/201) or `{ error: string }` (failure)
- Biome formatting: run `pnpm fix` after writing files. Project uses spaces, not tabs.
- Use `Option.some(new Date())` for updatedAt (not raw Date)

### Previous Story Intelligence (Story 1.4)

- **127 tests passing** after Story 1.4. New tests add to this count. Do not break any.
- **Post module DI**: `IPostRepository`, `CreatePostUseCase`, `GetUserPostsUseCase`, `GetPostDetailUseCase` registered. Add `UpdatePostUseCase` and `DeletePostUseCase` following same pattern.
- **`getAuthenticatedUser()` helper**: defined in `post.controller.ts`. Reuse, do NOT duplicate.
- **Query param validation**: NaN/bounds validation pattern for numeric params. Apply to postId URL param validation (ensure non-empty string).
- **Content rendering**: Rich text stored as sanitized HTML. Post detail page already renders HTML via `dangerouslySetInnerHTML`. Edit form must pre-populate Tiptap editor with existing HTML content.
- **`<Link>` not `<a>`**: Use `next/link` for client-side navigation. Apply to edit button.
- **Timezone caution**: `DATE()` SQL function uses server timezone. Not relevant for this story (no date aggregation), but be aware.
- **Shared text utils**: `stripHtml` and `truncate` in `common/utils/text.ts` — available if needed.
- **`<img>` vs `<Image>`**: Pre-existing pattern uses `<img>` tags for R2-hosted images. Follow same pattern for consistency.

### Git Intelligence

- Latest commit: `feat(nextjs): implement story 1.4 — journal view and streak counter`
- Post domain fully established across stories 1.2, 1.3, 1.4: aggregate, schema, mapper, repository, controllers, DTOs, queries, pages
- No schema migration needed — `post` table already has `updatedAt` column and all required fields
- Commit pattern: `feat(nextjs): implement story X.Y — description`
- Code review fix pattern: `fix(nextjs): address code review findings for story X.Y`

### Ownership Verification Pattern

```
1. Fetch post by ID from repository
2. If Result.isFailure -> return Result.fail("Post not found")
3. Unwrap Option: if None -> return Result.fail("Post not found")
4. Compare post.get('userId') with requesting userId
5. If mismatch -> return Result.fail("Forbidden")
6. Proceed with operation
```

This pattern is already partially established in `GetPostDetailUseCase` — extend it for update and delete.

### Project Structure Notes

- New domain events go in `src/domain/post/events/` (alongside existing `post-created.event.ts`)
- New use cases go in `src/application/use-cases/post/` (alongside existing create/get use cases)
- New DTOs go in `src/application/dto/post/` (alongside existing DTOs)
- New tests go in `src/application/use-cases/post/__tests__/` (alongside existing tests)
- Controllers added to existing `src/adapters/controllers/post/post.controller.ts`
- Edit page at `app/(protected)/posts/[postId]/edit/page.tsx` with `_components/` subfolder
- API route update at `app/api/v1/posts/[postId]/route.ts` — add PATCH and DELETE exports

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture — Post & Journal]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/architecture.md#Communication Patterns — Domain Events]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5: Edit & Delete Posts]
- [Source: _bmad-output/implementation-artifacts/1-4-journal-view-and-streak-counter.md — previous story learnings]
- [Source: apps/nextjs/src/domain/post/post.aggregate.ts — existing aggregate to extend]
- [Source: apps/nextjs/src/domain/post/events/post-created.event.ts — event pattern to follow]
- [Source: apps/nextjs/src/adapters/repositories/post.repository.ts — existing update/delete methods]
- [Source: apps/nextjs/src/adapters/controllers/post/post.controller.ts — existing controllers, getAuthenticatedUser, sanitizeHtml]
- [Source: apps/nextjs/src/application/dto/post/get-user-posts.dto.ts — postDtoSchema to reuse]
- [Source: apps/nextjs/app/(protected)/posts/new/_components/create-post-form.tsx — Tiptap editor pattern to reuse]
- [Source: apps/nextjs/app/(protected)/posts/[postId]/_components/post-detail.tsx — component to update with edit/delete buttons]
- [Source: apps/nextjs/common/di/types.ts — DI symbol registration pattern]
- [Source: apps/nextjs/common/di/modules/post.module.ts — DI module registration pattern]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- TypeScript type errors on initial implementation: `PostContent.create()` literal inference issue (fixed with explicit `: string` annotation), `Result.fail()` type inference in async `match` callbacks (fixed by refactoring to imperative `isSome()`/`unwrap()` pattern)
- Unused `UUID` import in test files flagged by Biome (removed)

### Completion Notes List

- All 8 tasks complete with 20 new tests (13 update + 7 delete)
- 147 total tests pass, 0 regressions
- 0 new Biome errors; pre-existing warnings unchanged
- No DB schema changes needed — `updatedAt` column already exists
- Use cases use imperative Option handling (`isSome()`/`unwrap()`) instead of `match()` for async flows to avoid TypeScript inference issues with async callbacks
- Event dispatch not wired (deferred to Epic 7) — events added via `addEvent()` on aggregate

### Code Review Fixes Applied

- **[H1] Single PostUpdatedEvent**: Refactored aggregate from 3 individual methods (`updateContent`, `updateVisibility`, `updateImages`) to single `update(changes)` method — emits exactly 1 event per update, 1 timestamp
- **[M1] DTO validation**: Removed `.min(1)` from update DTO content field — validation delegated to PostContent VO
- **[M2] Delete input validation**: Added `deletePostInputDtoSchema.safeParse()` in `deletePostController`
- **[M3] Edit form ownership check**: Added `currentUserId` prop to EditPostForm, check `post.userId !== currentUserId` after fetch
- **[M4] Timestamp consistency**: Resolved by H1 fix — single `new Date()` call in `update()` method
- **Regression test**: Added "should emit exactly one PostUpdatedEvent when updating all fields" test

### File List

**Created:**
- `src/domain/post/events/post-updated.event.ts`
- `src/domain/post/events/post-deleted.event.ts`
- `src/application/dto/post/update-post.dto.ts`
- `src/application/dto/post/delete-post.dto.ts`
- `src/application/use-cases/post/update-post.use-case.ts`
- `src/application/use-cases/post/delete-post.use-case.ts`
- `src/application/use-cases/post/__tests__/update-post.use-case.test.ts`
- `src/application/use-cases/post/__tests__/delete-post.use-case.test.ts`
- `app/(protected)/posts/[postId]/edit/page.tsx`
- `app/(protected)/posts/[postId]/edit/_components/edit-post-form.tsx`

**Modified:**
- `src/domain/post/post.aggregate.ts` — replaced 3 individual update methods with single `update(changes)` method + `markDeleted()`
- `common/di/types.ts` — added UpdatePostUseCase, DeletePostUseCase to DI_SYMBOLS and DI_RETURN_TYPES
- `common/di/modules/post.module.ts` — registered UpdatePostUseCase, DeletePostUseCase
- `src/adapters/controllers/post/post.controller.ts` — added updatePostController (with sanitization), deletePostController (with Zod validation)
- `app/api/v1/posts/[postId]/route.ts` — added PATCH, DELETE exports
- `app/(protected)/posts/[postId]/page.tsx` — pass currentUserId prop from session
- `app/(protected)/posts/[postId]/edit/page.tsx` — pass currentUserId to EditPostForm
- `app/(protected)/posts/[postId]/_components/post-detail.tsx` — added Edit link, Delete button with confirmation
- `app/(protected)/posts/[postId]/edit/_components/edit-post-form.tsx` — added ownership verification
