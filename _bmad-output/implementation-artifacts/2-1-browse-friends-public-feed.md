# Story 2.1: Browse Friends' Public Feed

Status: done

## Story

As a **user**,
I want to browse a feed of my friends' public posts,
so that I can stay connected with what my friends are sharing.

## Acceptance Criteria

1. **Given** an authenticated user with friends who have public posts **When** they navigate to the social feed page **Then** they see a paginated feed of friends' public posts ordered by most recent **And** each post shows author name, avatar, content preview, images, date, and reaction count

2. **Given** an authenticated user with no friends **When** they navigate to the social feed **Then** they see an empty state encouraging them to add friends via friend code

3. **Given** an authenticated user whose friends have no public posts **When** they navigate to the social feed **Then** they see an empty state indicating no posts yet from friends

4. **Given** a feed with many posts **When** the user scrolls **Then** pagination loads additional posts seamlessly

5. **Given** an authenticated user **When** viewing the feed **Then** their own public posts are NOT displayed in the social feed (feed shows friends only)

## Tasks / Subtasks

- [x] Task 1: Create Feed DTO (AC: #1)
  - [x] 1.1 Create `src/application/dto/feed/get-friend-feed.dto.ts` — input: `{ userId, page?, limit? }`, output: paginated list of feed posts with author info (id, content, images, createdAt, updatedAt, author: { id, name, displayName, avatarUrl }, reactionCount)

- [x] Task 2: Create Friend Feed CQRS Query (AC: #1, #4, #5)
  - [x] 2.1 Create `src/adapters/queries/friend-feed.query.ts` — direct Drizzle query (no DI, following journal.query.ts pattern):
    1. Query `friendRequest` table for accepted requests where `senderId = userId OR receiverId = userId`
    2. Extract friend IDs (the "other" user for each accepted request)
    3. Return early with empty result if no friends
    4. Query `post` table with `JOIN user ON post.userId = user.id` and `LEFT JOIN profile ON user.id = profile.userId`
    5. Filter: `post.userId IN (friendIds) AND post.isPrivate = false`
    6. Order by `post.createdAt DESC`
    7. Apply pagination (offset/limit)
    8. Count total for pagination metadata
    9. Map to DTO with author info

- [x] Task 3: Create Feed Controller (AC: #1, #2, #3, #4, #5)
  - [x] 3.1 Add `getFriendFeedController` to `src/adapters/controllers/post/post.controller.ts` — authenticate via `getAuthenticatedUser()`, parse page/limit query params with validation, call `getFriendFeed()` query, return paginated JSON response

- [x] Task 4: Create API Route (AC: all)
  - [x] 4.1 Create `app/api/v1/feed/route.ts` — export `GET = getFriendFeedController`

- [x] Task 5: Create Feed UI — Social Feed Page (AC: #1, #2, #3, #4)
  - [x] 5.1 Create `app/(protected)/social/page.tsx` — Server Component with `requireAuth()`, renders `<FriendFeed />`
  - [x] 5.2 Create `app/(protected)/social/_components/friend-feed.tsx` — Client Component that fetches `/api/v1/feed?page=1&limit=20`, displays feed posts with author avatar, name, content, images, date, reaction count. Includes empty states for "no friends" and "no posts" scenarios.
  - [x] 5.3 Create `app/(protected)/social/_components/feed-post-card.tsx` — Reusable card component displaying a single feed post: author avatar + name, post content (rich text HTML), image thumbnails, date, reaction count badge

- [x] Task 6: Write Tests (AC: all)
  - [x] 6.1 Create `src/adapters/queries/__tests__/friend-feed.query.test.ts` — test the CQRS query: happy path (returns friend public posts), no friends (empty result), friends with no public posts (empty result), excludes own posts, excludes private posts, pagination works, ordered by most recent
  - [x] **NOTE**: Since this is a CQRS query (not a use case), tests should mock the Drizzle DB calls. Follow the existing test patterns for query testing.

- [x] Task 7: Validation & Quality (AC: all)
  - [x] 7.1 Run `pnpm type-check` — 0 TypeScript errors
  - [x] 7.2 Run `pnpm check` — 0 new errors (39 pre-existing warnings)
  - [x] 7.3 Run `pnpm test` — all tests pass (155/155), 0 regressions
  - [x] 7.4 Run `pnpm fix` — auto-fix formatting (3 files formatted)

## Dev Notes

### Architecture Decisions

- **CQRS query pattern (NOT Use Case)**: This is a pure read operation with no domain logic. Following the CQRS pattern established in Story 1.4 (journal queries), use a direct Drizzle query in `adapters/queries/`. No DI registration needed, no Use Case, no Repository port. This is simpler, faster, and matches the precedent.

- **Friend-based access control pattern**: This story establishes the pattern for friend-based data access (Architecture "Important Gap" from Epic 1 retrospective). The pattern is:
  1. Query `friendRequest` table for `status = "accepted"` where user is sender OR receiver
  2. Extract friend IDs (the "other" user ID from each relationship)
  3. Use `inArray(post.userId, friendIds)` filter in Drizzle query
  This pattern will be reused across all social features.

- **Exclude own posts**: The feed shows ONLY friends' posts. The current user's own public posts are NOT shown in the social feed. This is per AC #5 and aligns with the PRD (FR27: "browse a feed of friends' public posts").

- **Reaction count = 0 for now**: Story 2.2 implements reactions. For Story 2.1, the reaction count should be a placeholder `0` in the DTO. When Story 2.2 adds the `reaction` table, the feed query will be updated to include a reaction count subquery. Design the DTO to include `reactionCount: number` from the start.

- **No new domain layer changes**: No new aggregates, entities, or value objects needed. The Post aggregate already has `isPrivate` flag. The FriendRequest aggregate with `accepted` status already models friendships.

- **Controller in post.controller.ts**: Add the feed controller to the existing `post.controller.ts` file, as it deals with post data. The `getAuthenticatedUser()` helper is already defined there. Alternative: create a separate `feed.controller.ts` in `adapters/controllers/feed/`. Use the approach that aligns best with the codebase — since journal was added to post.controller.ts, feed can follow the same pattern.

- **API route at `/api/v1/feed`**: Use a dedicated `/feed` route rather than `/posts?type=feed` to keep concerns separated. Feed is a distinct read model from "my posts."

- **Event dispatch NOT wired**: No domain events needed for this story (read-only). IEventDispatcher still not wired (deferred to Epic 7).

- **No DB schema changes**: No new tables needed. The query joins `post`, `friendRequest`, `user`, and `profile` — all existing tables.

### Existing Code to Reuse (CRITICAL)

- **`getAuthenticatedUser(request)`** — helper in `src/adapters/controllers/post/post.controller.ts`. Reuse for feed controller authentication.
- **`getJournalEntries()` query pattern** — `src/adapters/queries/journal.query.ts`. Copy this pattern (direct Drizzle, pagination, count query) for the friend feed query.
- **`createPaginatedResult()` helper** — from `@packages/ddd-kit`. Generates pagination metadata (page, limit, total, totalPages, hasNextPage, hasPreviousPage).
- **Post schema** — `packages/drizzle/src/schema/post.ts`. `post` table with `userId`, `isPrivate`, `content`, `images`, `createdAt`, `updatedAt`.
- **Friend schema** — `packages/drizzle/src/schema/friend.ts`. `friendRequest` table with `senderId`, `receiverId`, `status`.
- **User schema** — `packages/drizzle/src/schema/auth.ts`. `user` table with `id`, `name`, `image`.
- **Profile schema** — `packages/drizzle/src/schema/profile.ts`. `profile` table with `userId`, `displayName`, `avatarUrl`.
- **`db` instance** — import from `@packages/drizzle`. Used in all CQRS queries.
- **Drizzle operators** — `eq`, `and`, `or`, `desc`, `inArray`, `sql` from `drizzle-orm`.
- **Page guard pattern** — `requireAuth()` from `@/adapters/guards/auth.guard`. Used in all protected pages.
- **Journal entries component pattern** — `app/(protected)/journal/_components/journal-entries.tsx`. Client component with fetch, loading state, empty state. Copy this pattern for the feed.
- **`stripHtml` and `truncate` utilities** — `common/utils/text.ts`. Use for content preview in feed cards.
- **`<img>` for R2 images** — Pre-existing pattern uses raw `<img>` tags for R2-hosted images (not Next.js `<Image>`).

### Existing Code File Paths

| Component | Path | Action |
|---|---|---|
| Post controller | `src/adapters/controllers/post/post.controller.ts` | ADD `getFriendFeedController` |
| Journal query | `src/adapters/queries/journal.query.ts` | REFERENCE — copy CQRS pattern |
| Friend schema | `packages/drizzle/src/schema/friend.ts` | REFERENCE — `friendRequest` table |
| Post schema | `packages/drizzle/src/schema/post.ts` | REFERENCE — `post` table |
| User schema | `packages/drizzle/src/schema/auth.ts` | REFERENCE — `user` table |
| Profile schema | `packages/drizzle/src/schema/profile.ts` | REFERENCE — `profile` table |
| Journal entries component | `app/(protected)/journal/_components/journal-entries.tsx` | REFERENCE — client component pattern |
| Auth guard | `src/adapters/guards/auth.guard.ts` | REUSE in page |
| Text utils | `common/utils/text.ts` | REUSE `stripHtml`, `truncate` |

### Key Conventions to Follow

- Files: kebab-case with suffix (`.query.ts`, `.dto.ts`, `.controller.ts`)
- No `index.ts` barrel exports
- No comments in code
- CQRS queries: direct Drizzle, no DI, pure functions
- Controller pattern: `getAuthenticatedUser(request)` -> parse/validate query params -> call query -> return JSON
- Error status mapping: "Unauthorized" -> 401
- Response format: direct DTO object (200) or `{ error: string }` (failure)
- Pagination: `{ data: T[], pagination: { page, limit, total, totalPages, hasNextPage, hasPreviousPage } }`
- Biome formatting: run `pnpm fix` after writing files. Project uses spaces, not tabs.
- Use `next/link` for navigation (not raw `<a>` tags)
- Use `<img>` for R2-hosted images (not `<Image>` component) — pre-existing pattern

### Previous Story Intelligence (Story 1.5 & Epic 1 Retrospective)

- **147 tests passing** after Epic 1 completion. Do not break any.
- **TypeScript literal inference trap**: Use explicit `: string` type annotation for VO.create() calls. Not directly relevant here (no VOs created), but be aware.
- **Prefer imperative `isSome()`/`unwrap()` over async `match()`** — Result type narrowing doesn't work well in async callbacks.
- **Don't create VOs without domain logic justification** — No VOs needed for this story (CQRS query returns DTOs directly).
- **Validate ALL controller inputs with Zod safeParse** — Apply to page/limit query parameters.
- **`getAuthenticatedUser()` duplication tech debt** — Helper is copy-pasted across controllers. Continue using the one in `post.controller.ts` for now. Do NOT extract (not in scope).
- **CQRS query pattern is superior for pure reads** — Confirmed by Epic 1 retrospective. Use direct Drizzle queries for the feed.
- **Friend-based access control** — Identified as "Important Gap" in architecture. This story establishes the pattern. Document it clearly for future stories.

### Git Intelligence

- Latest commit: `docs: complete epic 1 retrospective and mark epic as done`
- Previous commits show Epic 1 progression: upload -> create post -> view posts -> journal -> edit/delete
- Commit pattern: `feat(nextjs): implement story X.Y — description`
- Code review fix pattern: `fix(nextjs): address code review findings for story X.Y`
- 147 tests total from Epic 1
- Post module fully established: aggregate, schema, mapper, repository, controllers, DTOs, queries, pages

### Drizzle Query Pattern (CRITICAL)

The friend feed query must follow this exact Drizzle pattern (from journal.query.ts):

```
1. Import schemas: post, user, profile, friendRequest from @packages/drizzle
2. Import operators: eq, and, or, desc, inArray, sql from drizzle-orm
3. Import db from @packages/drizzle
4. Define async function with userId, page, limit params
5. Step 1: Query friendRequest for accepted friends
6. Step 2: Extract friend IDs
7. Step 3: Early return if no friends (empty data + pagination)
8. Step 4: Parallel Promise.all for data + count queries
9. Step 5: Map DB rows to DTO shape
10. Step 6: Return { data, pagination }
```

### UI Design Notes

**Feed post card should display:**
- Author avatar (from profile.avatarUrl or user.image, fallback to initials)
- Author display name (from profile.displayName, fallback to user.name)
- Post content as rich text HTML preview (truncated to ~200 chars for feed view)
- Post images (thumbnail grid if multiple)
- Post date (relative format: "2h ago", "yesterday", etc.)
- Reaction count badge (placeholder 0 for Story 2.1, functional in Story 2.2)

**Empty states:**
- No friends: "Add friends to see their posts! Share your friend code to get started." with link to profile page
- No posts from friends: "Your friends haven't posted anything yet. Check back later!"

**Feed should match the Figma "Social" screen** (screen #19 in mobile inventory).

### Project Structure Notes

- Feed query goes in `src/adapters/queries/friend-feed.query.ts` (alongside existing journal.query.ts)
- Feed DTO goes in `src/application/dto/feed/get-friend-feed.dto.ts` (new `feed` subfolder)
- Feed controller added to existing `src/adapters/controllers/post/post.controller.ts`
- Feed API route at `app/api/v1/feed/route.ts` (new route)
- Feed page at `app/(protected)/social/page.tsx` (new page)
- Feed components in `app/(protected)/social/_components/` (new folder)
- No DI changes needed (CQRS query pattern)
- No DB schema changes needed

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1: Browse Friends' Public Feed]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture — Post & Journal]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns — CQRS Query Pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md#Gap Analysis — Friend-Based Access Control]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/prd.md#FR27 — Browse friends' public posts]
- [Source: _bmad-output/implementation-artifacts/1-5-edit-and-delete-posts.md — Previous story patterns]
- [Source: _bmad-output/implementation-artifacts/epic-1-retro-2026-02-08.md — Retrospective action items]
- [Source: apps/nextjs/src/adapters/queries/journal.query.ts — CQRS query pattern to follow]
- [Source: apps/nextjs/src/adapters/controllers/post/post.controller.ts — Controller & auth pattern]
- [Source: apps/nextjs/app/(protected)/journal/_components/journal-entries.tsx — Client component pattern]
- [Source: packages/drizzle/src/schema/friend.ts — Friend table schema]
- [Source: packages/drizzle/src/schema/post.ts — Post table schema]
- [Source: packages/drizzle/src/schema/auth.ts — User table schema]
- [Source: packages/drizzle/src/schema/profile.ts — Profile table schema]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — all tasks completed without errors on first pass.

### Completion Notes List

- All 7 tasks implemented and validated in a single pass
- 8 new tests added (155 total, 0 regressions)
- CQRS query pattern followed from journal.query.ts — no DI needed
- Friend-based access control pattern established (Architecture "Important Gap" resolved)
- `reactionCount: 0` placeholder ready for Story 2.2
- Avatar fallback chain: `profile.avatarUrl → user.image → null`
- Empty states implemented for both "no friends" and "no posts" scenarios
- 39 pre-existing Biome warnings unchanged

### Senior Developer Review — Fixes Applied

- **M1 (MEDIUM)**: Added `hasFriends` field to DTO/query/client — AC#2 and AC#3 now show distinct empty states
- **M2 (MEDIUM)**: Removed unused `getFriendFeedInputDtoSchema` and `IGetFriendFeedInputDto` (dead code)
- **M3 (MEDIUM)**: Added guard against future dates in `formatRelativeDate` (`if (diffMs < 0) return "just now"`)
- **M4 (MEDIUM)**: Added guard against empty name in `getInitials` (`if (!name) return "?"`)
- **L1-L3 (LOW)**: Not fixed — pre-existing patterns or cosmetic issues

### File List

| File | Action | Description |
|---|---|---|
| `src/application/dto/feed/get-friend-feed.dto.ts` | CREATED | Feed DTO with author info, pagination, reaction count |
| `src/adapters/queries/friend-feed.query.ts` | CREATED | CQRS query: friends → public posts with author info |
| `src/adapters/controllers/post/post.controller.ts` | MODIFIED | Added `getFriendFeedController` |
| `app/api/v1/feed/route.ts` | CREATED | GET endpoint for friend feed |
| `app/(protected)/social/page.tsx` | CREATED | Social feed page (Server Component) |
| `app/(protected)/social/_components/friend-feed.tsx` | CREATED | Feed client component with fetch/states/pagination |
| `app/(protected)/social/_components/feed-post-card.tsx` | CREATED | Feed post card with author, content, images |
| `src/adapters/queries/__tests__/friend-feed.query.test.ts` | CREATED | 8 tests for friend feed CQRS query |
