# Story 1.3: View Posts & Post Detail

Status: done

## Story

As a **user**,
I want to view my posts and see the full detail of a single post,
so that I can review what I've written.

## Acceptance Criteria

1. **Given** an authenticated user with existing posts **When** they navigate to the posts list **Then** they see a paginated list of their own posts (public and private) ordered by most recent **And** each post shows a preview of content, image thumbnail (if any), visibility indicator, and date

2. **Given** an authenticated user **When** they select a specific post **Then** they see the full post detail: complete rich text content, all images, visibility status, creation date

3. **Given** an authenticated user with no posts **When** they navigate to the posts list **Then** they see an empty state with a contextual prompt to create their first post

4. **Given** an authenticated user **When** they try to view another user's private post by ID **Then** the system returns a 403 Forbidden or 404 Not Found error

5. **Given** a posts list with many entries **When** the user scrolls or navigates pages **Then** pagination works correctly with proper page/limit parameters

## Tasks / Subtasks

- [x] Task 1: Create Application Layer — GetUserPosts Use Case (AC: #1, #3, #5)
  - [x] 1.1 Create `get-user-posts.dto.ts` in `src/application/dto/post/` — input: `{ userId: string, page?: number, limit?: number }`, output: `{ posts: PostDto[], pagination: PaginationMeta }`
  - [x] 1.2 Create `GetUserPostsUseCase` in `src/application/use-cases/post/get-user-posts.use-case.ts` — calls `IPostRepository.findByUserId(userId, pagination)`, maps Post aggregates to DTOs, returns paginated result
  - [x] 1.3 Write BDD tests in `src/application/use-cases/post/__tests__/get-user-posts.use-case.test.ts`

- [x] Task 2: Create Application Layer — GetPostDetail Use Case (AC: #2, #4)
  - [x] 2.1 Create `get-post-detail.dto.ts` in `src/application/dto/post/` — input: `{ postId: string, requestingUserId: string }`, output: `{ id, content, isPrivate, images, userId, createdAt, updatedAt }`
  - [x] 2.2 Create `GetPostDetailUseCase` in `src/application/use-cases/post/get-post-detail.use-case.ts` — calls `IPostRepository.findById(postId)`, checks ownership: if post is private and userId !== requestingUserId → Result.fail("Post not found"), else returns DTO
  - [x] 2.3 Write BDD tests in `src/application/use-cases/post/__tests__/get-post-detail.use-case.test.ts`

- [x] Task 3: Create Adapters Layer — Controllers (AC: #1, #2, #3, #4, #5)
  - [x] 3.1 Add `getUserPostsController` to `src/adapters/controllers/post/post.controller.ts` — authenticates, parses `page`/`limit` from query params, executes `GetUserPostsUseCase` with session userId, returns paginated response
  - [x] 3.2 Add `getPostDetailController` to `src/adapters/controllers/post/post.controller.ts` — authenticates, receives postId param, executes `GetPostDetailUseCase` with `{ postId, requestingUserId: session.user.id }`, maps Result.fail to 404, success to 200
  - [x] 3.3 Update `app/api/v1/posts/route.ts` — add `GET = getUserPostsController` export
  - [x] 3.4 Create `app/api/v1/posts/[postId]/route.ts` — import and export `GET = getPostDetailController` with `await params` pattern for postId extraction

- [x] Task 4: DI Registration (AC: #1, #2)
  - [x] 4.1 Add `GetUserPostsUseCase` and `GetPostDetailUseCase` symbols to `common/di/types.ts` — both DI_SYMBOLS entries AND DI_RETURN_TYPES entries, plus imports
  - [x] 4.2 Update `common/di/modules/post.module.ts` — bind both use cases with `[DI_SYMBOLS.IPostRepository]` dependency

- [x] Task 5: Create UI Pages (AC: #1, #2, #3)
  - [x] 5.1 Create posts list page at `app/(protected)/posts/page.tsx` — Server Component with `requireAuth()`, composes `_components/posts-list.tsx`
  - [x] 5.2 Create `posts-list.tsx` Client Component — fetches `GET /api/v1/posts?page=1&limit=20`, renders post cards with content preview (truncated text, strip HTML tags for preview), image thumbnail, visibility badge, date. Empty state when no posts with CTA to create first post
  - [x] 5.3 Create post detail page at `app/(protected)/posts/[postId]/page.tsx` — Server Component with `requireAuth()`, composes `_components/post-detail.tsx`
  - [x] 5.4 Create `post-detail.tsx` Client Component — fetches `GET /api/v1/posts/{postId}`, renders full rich text content (sanitized HTML), all images, visibility status, creation date. 404 handling for not-found or forbidden posts

- [x] Task 6: Validation & Quality (AC: all)
  - [x] 6.1 Run `pnpm type-check` — no TypeScript errors
  - [x] 6.2 Run `pnpm check` — Biome lint/format pass
  - [x] 6.3 Run `pnpm test` — all tests pass (existing + new)
  - [x] 6.4 Run `pnpm fix` — auto-fix formatting

## Dev Notes

### Architecture Decisions

- **CQRS Read Path**: This story is read-only. Use Cases call repository `findByUserId` and `findById` — both already exist in `IPostRepository` (inherited from BaseRepository + custom method). No domain mutations, no events.
- **Post Detail Access Control**: A user can view their own posts (both public and private). Accessing another user's private post returns "Post not found" (404, not 403) to avoid leaking existence. Public posts from other users will be accessible later via the social feed (Epic 2) — this story focuses only on the current user's own posts.
- **No separate query files needed**: Since `IPostRepository` already provides `findByUserId` and `findById`, use the existing repository through use cases. The CQRS query pattern (direct ORM) is reserved for dashboard widgets and complex cross-aggregate reads.
- **Rich text rendering**: Post content is stored as sanitized HTML (Tiptap output, sanitized with `sanitize-html` on creation in Story 1.2). Render with `dangerouslySetInnerHTML` inside a styled container with Tailwind prose classes. No re-sanitization needed on read since it was sanitized on write.
- **Content preview for list**: Strip HTML tags client-side and truncate to ~150 chars for the posts list card preview.

### Existing Code to Reuse

- **`IPostRepository`** — already has `findById(id): Promise<Result<Option<Post>>>` and `findByUserId(userId, pagination): Promise<Result<PaginatedResult<Post>>>`. Both are implemented in `DrizzlePostRepository`.
- **`PostMapper`** — `postToDomain()` and `postToPersistence()` already handle all Post properties including `Option<Date>` for updatedAt.
- **`getAuthenticatedUser(request)`** — helper function already defined in `src/adapters/controllers/post/post.controller.ts`. Reuse it for GET controllers in the same file.
- **`createPostController`** — existing controller in `post.controller.ts`. Add new controller functions to the same file.
- **`PostId`** — import from `src/domain/post/post-id.ts` for type-safe ID handling.
- **Post aggregate** — `Post.reconstitute()` is used by mapper. `post.get('content')`, `post.get('isPrivate')`, `post.get('images')`, `post.get('createdAt')`, `post.get('updatedAt')` to access properties.
- **`createPaginatedResult()`** — from ddd-kit, already used in `DrizzlePostRepository.findByUserId()`.
- **Pagination types** — `PaginationParams`, `PaginatedResult`, `DEFAULT_PAGINATION` from ddd-kit.
- **Existing route file** — `app/api/v1/posts/route.ts` already exports `POST = createPostController`. Add `GET` export to same file.
- **`requireAuth()`** — guard from `src/adapters/guards/auth.guard.ts` for page-level protection.

### Key Conventions to Follow

- Files: kebab-case with suffix (`.use-case.ts`, `.dto.ts`, `.controller.ts`)
- No `index.ts` barrel exports
- No comments in code
- `Result<T>` for all fallible operations, never throw
- `Option<T>` for nullable values — `findById` returns `Result<Option<Post>>`
- Only `get id()` getter — use `post.get('propName')` for all other properties
- Controller pattern: `getAuthenticatedUser(request)` → parse query params → `getInjection("UseCaseName")` → `execute()` → `NextResponse.json()`
- Response format: direct DTO (200 for reads) or `{ error: string }` (failure)
- Pagination query params: `?page=1&limit=20` parsed as `Number.parseInt(value, 10)`
- Dynamic route params: `{ params }: { params: Promise<{ postId: string }> }` — must `await params`
- DTO dates: serialize as ISO string (`date.toISOString()`)
- Option handling: `match(option, { Some: (v) => ..., None: () => ... })`

### Previous Story Intelligence (Story 1.2)

- **Post module already registered in DI** — `common/di/modules/post.module.ts` with `IPostRepository` and `CreatePostUseCase`. Just add new use case bindings.
- **DI types already has** `IPostRepository` and `CreatePostUseCase` symbols. Add new symbols following same pattern.
- **Post DB schema** — table `post` with composite index on `(user_id, created_at)` — already optimized for the `findByUserId` query this story needs.
- **sanitize-html installed** — HTML content was sanitized on write. Read path just renders the stored HTML.
- **Tiptap installed** — not needed for read-only views, but content is Tiptap HTML output.
- **PostContent VO strips HTML for validation** — on read, the stored HTML is safe to render.
- **Post aggregate props**: `userId: string`, `content: PostContent`, `isPrivate: boolean`, `images: string[]`, `createdAt: Date`, `updatedAt: Option<Date>`.
- **Review feedback from 1.2**: `getAuthenticatedUser()` helper is duplicated across controllers — reuse existing one in `post.controller.ts`, don't create another copy.
- **Biome formatting**: Run `pnpm fix` after writing files. Project uses spaces, not tabs.
- **102 total tests** after Story 1.2. New tests add to this count.

### Git Intelligence

- Latest commit: `feat(nextjs): implement story 1.2 — create a post` — Post domain, schema, use case, controller, UI all established
- Upload endpoint operational: `feat(nextjs): add upload feature with presigned URLs`
- Expo mobile has dashboard and social screens ahead of backend

### Project Structure Notes

- Add controllers to existing `src/adapters/controllers/post/post.controller.ts` — do NOT create separate controller files
- New use case files: `src/application/use-cases/post/get-user-posts.use-case.ts` and `get-post-detail.use-case.ts`
- New DTO files: `src/application/dto/post/get-user-posts.dto.ts` and `get-post-detail.dto.ts`
- New test files: `src/application/use-cases/post/__tests__/get-user-posts.use-case.test.ts` and `get-post-detail.use-case.test.ts`
- New route: `app/api/v1/posts/[postId]/route.ts`
- New pages: `app/(protected)/posts/page.tsx` and `app/(protected)/posts/[postId]/page.tsx`
- Update existing: `app/api/v1/posts/route.ts` (add GET export), `common/di/types.ts`, `common/di/modules/post.module.ts`

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture — Post & Journal]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3: View Posts & Post Detail]
- [Source: _bmad-output/implementation-artifacts/1-2-create-a-post.md — previous story learnings]
- [Source: apps/nextjs/src/application/ports/post-repository.port.ts — IPostRepository with findByUserId and findById]
- [Source: apps/nextjs/src/adapters/repositories/post.repository.ts — DrizzlePostRepository implementation]
- [Source: apps/nextjs/src/adapters/controllers/post/post.controller.ts — existing controller with getAuthenticatedUser]
- [Source: apps/nextjs/src/adapters/controllers/notification/notification.controller.ts — GET list controller pattern]
- [Source: apps/nextjs/app/api/v1/chat/conversations/[conversationId]/messages/route.ts — dynamic param route pattern]
- [Source: apps/nextjs/src/application/use-cases/friend/get-friends.use-case.ts — paginated list use case pattern]
- [Source: apps/nextjs/src/application/dto/friend/get-friends.dto.ts — paginated DTO pattern]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- TypeScript literal type issue with `PostContent.create()` — fixed by widening string literal type with `const testContent: string = "..."`
- Biome formatting auto-fixed via `pnpm fix` after file creation

### Completion Notes List

- All 6 tasks completed (21 subtasks)
- 13 new BDD tests added (6 GetUserPosts + 7 GetPostDetail), total 115 tests passing
- Type-check clean, Biome clean (only pre-existing warnings)
- Access control: private posts from other users return "Post not found" (404 not 403)
- Rich text rendered with `dangerouslySetInnerHTML` + Tailwind prose classes (content sanitized on write in Story 1.2)
- Content preview in list: HTML stripped client-side, truncated to 150 chars

### Code Review (AI) — 2026-02-08

**Reviewer:** Claude Opus 4.6 (adversarial code review)

**Issues Found:** 3 High, 3 Medium, 2 Low — **5 fixed, 1 accepted, 2 low deferred**

**Fixed:**
- H1/H3: Added NaN/bounds validation for `page`/`limit` query params in `getUserPostsController` (NaN, negative, >100 now fall back to defaults)
- H2: Eliminated duplicate `getPostDetailOutputDtoSchema` — now reuses `postDtoSchema` from `get-user-posts.dto.ts`
- M1: Replaced `<a href>` with `<Link>` from `next/link` in `posts-list.tsx` and `post-detail.tsx` for client-side navigation
- M3: `getPostDetailController` now returns 500 for infrastructure errors and 404 only for "Post not found"

**Accepted:**
- M2: Duplicate `createMockPost` test helpers — accepted for test isolation (different override signatures per test file)

**Deferred (LOW):**
- L1: No sort-order assertion in tests (repo handles ordering)
- L2: No page metadata exports (cosmetic)

### File List

**Created:**
- `src/application/dto/post/get-user-posts.dto.ts`
- `src/application/dto/post/get-post-detail.dto.ts`
- `src/application/use-cases/post/get-user-posts.use-case.ts`
- `src/application/use-cases/post/get-post-detail.use-case.ts`
- `src/application/use-cases/post/__tests__/get-user-posts.use-case.test.ts`
- `src/application/use-cases/post/__tests__/get-post-detail.use-case.test.ts`
- `app/api/v1/posts/[postId]/route.ts`
- `app/(protected)/posts/page.tsx`
- `app/(protected)/posts/_components/posts-list.tsx`
- `app/(protected)/posts/[postId]/page.tsx`
- `app/(protected)/posts/[postId]/_components/post-detail.tsx`

**Modified:**
- `src/adapters/controllers/post/post.controller.ts` — added getUserPostsController, getPostDetailController
- `app/api/v1/posts/route.ts` — added GET export
- `common/di/types.ts` — added DI_SYMBOLS + DI_RETURN_TYPES for both use cases
- `common/di/modules/post.module.ts` — added bindings for both use cases
