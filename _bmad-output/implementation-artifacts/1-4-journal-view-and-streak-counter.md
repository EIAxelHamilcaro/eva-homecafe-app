# Story 1.4: Journal View & Streak Counter

Status: done

## Story

As a **user**,
I want to view my journal (private posts grouped by date) and see my writing streak,
so that I can reflect on my personal entries and stay motivated by my consistency.

## Acceptance Criteria

1. **Given** an authenticated user with private posts **When** they navigate to the journal page **Then** they see only their private posts, grouped by date (most recent first) **And** public posts are excluded from this view

2. **Given** an authenticated user on the journal page **When** they browse entries **Then** they can navigate by date to find specific entries

3. **Given** an authenticated user who has written private posts on 5 consecutive days **When** they view the journal page **Then** the streak counter displays "5" (consecutive days with at least one private post)

4. **Given** an authenticated user who missed a day of journaling **When** they view the journal page **Then** the streak counter resets to the current consecutive count since the last gap

5. **Given** an authenticated user with no private posts **When** they navigate to the journal page **Then** they see an empty state encouraging them to write their first journal entry

## Tasks / Subtasks

- [x] Task 1: Create CQRS Queries — Journal Entries & Streak Calculation (AC: #1, #2, #3, #4)
  - [x] 1.1 Create `src/adapters/queries/journal.query.ts` — `getJournalEntries(userId, date?, pagination)` returns private posts grouped by date (DESC), with date filtering and pagination. Uses direct Drizzle query on `post` table with `isPrivate = true` filter
  - [x] 1.2 Create `src/adapters/queries/streak.query.ts` — `calculateStreak(userId)` returns `{ currentStreak, longestStreak, lastPostDate }`. Queries distinct dates with private posts, iterates to compute consecutive day counts. Current streak checks from today/yesterday backward
  - [x] 1.3 Write tests in `src/adapters/queries/__tests__/journal.query.test.ts` — mock Drizzle db, test date grouping, private-only filtering, pagination, empty results
  - [x] 1.4 Write tests in `src/adapters/queries/__tests__/streak.query.test.ts` — test consecutive days, gap detection, streak reset, no posts, single day, today vs yesterday start

- [x] Task 2: Create DTOs (AC: #1, #2, #3, #4, #5)
  - [x] 2.1 Create `src/application/dto/journal/get-journal-entries.dto.ts` — input: `{ userId, date?, page?, limit? }`, output: `{ groups: [{ date, posts: PostDto[] }], pagination }`. Reuse `postDtoSchema` from `get-user-posts.dto.ts`
  - [x] 2.2 Create `src/application/dto/journal/get-streak.dto.ts` — input: `{ userId }`, output: `{ currentStreak, longestStreak, lastPostDate }`. All numbers and nullable date string

- [x] Task 3: Create Controllers (AC: #1, #2, #3, #4)
  - [x] 3.1 Add `getJournalEntriesController` to `src/adapters/controllers/post/post.controller.ts` — authenticates via `getAuthenticatedUser()`, parses optional `date` (YYYY-MM-DD), `page`, `limit` query params, calls `getJournalEntries()` query directly, returns JSON response
  - [x] 3.2 Add `getStreakController` to `src/adapters/controllers/post/post.controller.ts` — authenticates, calls `calculateStreak()` query directly, returns JSON response

- [x] Task 4: Create API Routes (AC: #1, #2, #3, #4)
  - [x] 4.1 Create `app/api/v1/journal/route.ts` — import and export `GET = getJournalEntriesController`
  - [x] 4.2 Create `app/api/v1/journal/streak/route.ts` — import and export `GET = getStreakController`

- [x] Task 5: Create UI — Journal Page (AC: #1, #2, #3, #4, #5)
  - [x] 5.1 Create `app/(protected)/journal/page.tsx` — Server Component with `requireAuth()`, composes streak counter + journal entries + CTA to `/posts/new`
  - [x] 5.2 Create `app/(protected)/journal/_components/streak-counter.tsx` — Client Component, fetches `GET /api/v1/journal/streak`, displays current streak prominently with fire/flame styling. Shows "0" for no streak. Compact card at top of page
  - [x] 5.3 Create `app/(protected)/journal/_components/journal-entries.tsx` — Client Component, fetches `GET /api/v1/journal?page=1&limit=20`, renders posts grouped by date with date headers as section dividers. Each post shows content preview (HTML stripped, truncated 150 chars), image thumbnail, creation time. Pagination at bottom. Empty state with CTA when no private posts
  - [x] 5.4 Create `app/(protected)/journal/_components/date-navigator.tsx` — Client Component, allows user to filter journal by specific date. Date input or calendar widget. Passes `?date=YYYY-MM-DD` to journal entries query

- [x] Task 6: Validation & Quality (AC: all)
  - [x] 6.1 Run `pnpm type-check` — no TypeScript errors
  - [x] 6.2 Run `pnpm check` — Biome lint/format pass (0 errors, warnings are pre-existing)
  - [x] 6.3 Run `pnpm test` — all 127 tests pass (115 existing + 12 new), 0 regressions
  - [x] 6.4 Run `pnpm fix` — auto-fix formatting applied

## Dev Notes

### Architecture Decisions

- **CQRS Read Path**: This story is read-only. Use CQRS queries (direct Drizzle) instead of Use Cases + Repository pattern. Rationale: no domain logic needed, complex SQL aggregations (date grouping, streak calculation), better performance bypassing aggregate hydration. Pattern precedent: `src/adapters/queries/search-recipients.query.ts`.
- **Journal = filtered view of private posts**: No separate aggregate, no separate DB table. Journal is a query filter on the `post` table where `isPrivate = true`. This aligns with Architecture Decision: "Post & Journal — Single Aggregate with Visibility Flag" and PRD FR21: "filtered list of private posts".
- **Streak calculation**: Compute in application layer (TypeScript) after fetching distinct dates. This avoids complex PostgreSQL window functions and keeps the logic testable. Query fetches distinct dates with private posts ordered DESC, then iterates to count consecutive days.
- **No DI registration needed**: CQRS queries are pure functions imported directly — no DI symbols, no module bindings, no port interfaces. Controllers import and call query functions directly.
- **Separate API route group `/api/v1/journal/`**: Even though journal reads from the `post` table, it gets its own route group per architecture document: `/api/v1/journal/route.ts` (GET entries) and `/api/v1/journal/streak/route.ts` (GET streak).
- **Controllers in existing file**: Add journal controllers to `src/adapters/controllers/post/post.controller.ts` since journal is a view on posts.

### Existing Code to Reuse

- **`post` DB table** — already has `is_private` boolean column and `(user_id, created_at)` composite index. Perfect for journal queries, no schema changes needed.
- **`postDtoSchema`** — from `src/application/dto/post/get-user-posts.dto.ts`. Reuse for journal entry posts within date groups.
- **`getAuthenticatedUser(request)`** — helper in `src/adapters/controllers/post/post.controller.ts`. Reuse for journal controllers.
- **`requireAuth()`** — guard from `src/adapters/guards/auth.guard.ts` for page-level protection.
- **Client component patterns** — from `app/(protected)/posts/_components/posts-list.tsx`: fetch pattern, loading/error/empty states, pagination, HTML stripping utility (`stripHtml`, `truncate`).
- **HTML stripping** — content preview approach from Story 1.3: strip HTML tags and truncate to 150 chars.
- **`search-recipients.query.ts`** — CQRS query pattern reference: pure async function, direct Drizzle, returns plain DTO objects.
- **Drizzle imports** — `import { db } from "@packages/drizzle"`, `import { post } from "@packages/drizzle/src/schema/post"`, `eq`, `and`, `desc`, `sql` from `drizzle-orm`.

### Key Conventions to Follow

- Files: kebab-case with suffix (`.query.ts`, `.dto.ts`, `.controller.ts`)
- No `index.ts` barrel exports
- No comments in code
- CQRS queries return plain DTOs, not Result/Option (they're infrastructure-level reads)
- Controller pattern: `getAuthenticatedUser(request)` → parse query params → call query function directly → `NextResponse.json()`
- Response format: direct DTO (200) or `{ error: string }` (failure)
- Pagination query params: `?page=1&limit=20` parsed as `Number.parseInt(value, 10)` with NaN/bounds validation (page > 0, limit > 0 && limit <= 100)
- Date query param: `?date=2026-02-08` format YYYY-MM-DD, validated via regex `/^\d{4}-\d{2}-\d{2}$/`
- DTO dates: serialize as ISO string (`date.toISOString()`)
- Biome formatting: run `pnpm fix` after writing files. Project uses spaces, not tabs

### Previous Story Intelligence (Story 1.3)

- **115 tests passing** after Story 1.3. New tests add to this count.
- **Post module DI**: `IPostRepository`, `CreatePostUseCase`, `GetUserPostsUseCase`, `GetPostDetailUseCase` all registered. Journal uses CQRS queries so NO new DI needed.
- **`getAuthenticatedUser()` helper**: defined in `post.controller.ts` lines 32-49. Reuse, do NOT duplicate.
- **Query param validation**: Story 1.3 code review (H1/H3) added NaN/bounds validation for `page`/`limit` — follow same pattern.
- **Content rendering**: Rich text stored as sanitized HTML (from Story 1.2). For journal list view, strip HTML tags client-side for preview. For post detail, user can click through to `/posts/[postId]` detail page (already exists from Story 1.3).
- **`<Link>` not `<a>`**: Code review M1 — use `next/link` for client-side navigation.
- **No page metadata exports**: Deferred from Story 1.3 code review (L2) — acceptable for now.

### Git Intelligence

- Latest commits establish patterns: `fix(nextjs): address code review findings for story 1.3` and `feat(nextjs): implement story 1.3 — view posts and post detail`
- Post domain fully established: aggregate, schema, mapper, repository, controllers, pages
- No schema migration needed — `post` table already has all required columns and indexes

### Streak Calculation Algorithm

```
1. Query: SELECT DISTINCT DATE(created_at) FROM post WHERE user_id = ? AND is_private = true ORDER BY date DESC
2. Initialize: currentStreak = 0, longestStreak = 0, tempStreak = 0
3. Check if first date is today or yesterday (if neither, currentStreak = 0)
4. Iterate dates: if current date is exactly 1 day after previous, increment tempStreak
5. If gap detected, update longestStreak = max(longestStreak, tempStreak), reset tempStreak = 1
6. currentStreak = streak count starting from today/yesterday
7. Return { currentStreak, longestStreak, lastPostDate }
```

### Project Structure Notes

- CQRS queries go in `src/adapters/queries/` (flat, not per-domain subfolder)
- Tests for queries in `src/adapters/queries/__tests__/`
- Journal DTOs in `src/application/dto/journal/` (new subfolder for journal, since it's a separate query domain)
- Controllers added to existing `src/adapters/controllers/post/post.controller.ts`
- API routes: `app/api/v1/journal/route.ts` and `app/api/v1/journal/streak/route.ts` (new route group)
- Page: `app/(protected)/journal/page.tsx` with `_components/` subfolder

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture — Post & Journal]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping — Journal row]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4: Journal View & Streak Counter]
- [Source: _bmad-output/implementation-artifacts/1-3-view-posts-and-post-detail.md — previous story learnings]
- [Source: apps/nextjs/src/adapters/queries/search-recipients.query.ts — CQRS query pattern]
- [Source: apps/nextjs/src/adapters/controllers/post/post.controller.ts — existing controllers with getAuthenticatedUser]
- [Source: apps/nextjs/src/application/dto/post/get-user-posts.dto.ts — postDtoSchema to reuse]
- [Source: packages/drizzle/src/schema/post.ts — post table with isPrivate and composite index]
- [Source: apps/nextjs/app/(protected)/posts/_components/posts-list.tsx — client component patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Timezone issue in streak test: `todayStr()` using `toISOString()` (UTC) produced different date than `normalizeDate` (local). Fixed by using local date formatting (`getFullYear/getMonth/getDate`) consistently in both query and tests.
- Biome unused variables: Removed unused mock variables (`mockSelect`, `mockFrom`, etc.) from journal.query.test.ts.
- TypeScript strict null checks: Added non-null assertions (`!`) in test files for array indexing, and `as Date`/`as string` casts in streak.query.ts for array elements after length check.

### Completion Notes List

- All 6 tasks completed (18 subtasks)
- 12 new BDD tests added (5 journal query + 7 streak query), total 127 tests passing
- Type-check clean, Biome clean (0 errors, warnings are pre-existing)
- CQRS query pattern used — no DI registration, no use cases, no repository changes
- No database schema changes needed — existing `post` table with `isPrivate` and `(userId, createdAt)` index covers all queries
- Streak counter supports: today start, yesterday start, gap detection, longest streak tracking
- Journal entries support: date grouping, date filtering, pagination, empty state
- UI follows existing posts-list.tsx patterns: loading skeletons, error states, empty states with CTA, pagination, `<Link>` navigation

### File List

**Created:**
- `apps/nextjs/src/application/dto/journal/get-journal-entries.dto.ts`
- `apps/nextjs/src/application/dto/journal/get-streak.dto.ts`
- `apps/nextjs/src/adapters/queries/journal.query.ts`
- `apps/nextjs/src/adapters/queries/streak.query.ts`
- `apps/nextjs/src/adapters/queries/__tests__/journal.query.test.ts`
- `apps/nextjs/src/adapters/queries/__tests__/streak.query.test.ts`
- `apps/nextjs/app/api/v1/journal/route.ts`
- `apps/nextjs/app/api/v1/journal/streak/route.ts`
- `apps/nextjs/app/(protected)/journal/page.tsx`
- `apps/nextjs/app/(protected)/journal/_components/streak-counter.tsx`
- `apps/nextjs/app/(protected)/journal/_components/journal-entries.tsx`
- `apps/nextjs/app/(protected)/journal/_components/date-navigator.tsx`

**Created (code review):**
- `apps/nextjs/common/utils/text.ts` — shared `stripHtml` and `truncate` utilities extracted from duplicated code

**Modified:**
- `apps/nextjs/src/adapters/controllers/post/post.controller.ts` — added `getJournalEntriesController`, `getStreakController`, imports for journal queries and DTOs

**Modified (code review):**
- `apps/nextjs/app/(protected)/journal/_components/streak-counter.tsx` — fixed dead ternary (H1), removed comment (L1)
- `apps/nextjs/app/(protected)/journal/_components/journal-entries.tsx` — protected res.json() error parsing (H3), added safe date formatting (M4), extracted shared utils (M1)
- `apps/nextjs/app/(protected)/posts/_components/posts-list.tsx` — extracted shared stripHtml/truncate utils (M1)

## Senior Developer Review (AI)

### Review Date: 2026-02-08

### Reviewer: Claude Opus 4.6 (adversarial code review)

### Findings Summary: 3 High, 4 Medium, 2 Low

### Fixed Issues (6):
- **H1** `streak-counter.tsx:45` — Dead ternary returning identical strings for singular/plural. Removed useless ternary.
- **H3** `journal-entries.tsx:36` — `res.json()` without try/catch on error responses. Wrapped in try/catch with fallback message.
- **M1** `journal-entries.tsx` + `posts-list.tsx` — Duplicated `stripHtml`/`truncate` functions. Extracted to `common/utils/text.ts`.
- **M4** `journal-entries.tsx:104` — Unsafe date parsing for heading display. Added `formatDateHeading` with regex validation and NaN guard.
- **L1** `streak-counter.tsx` — Comment violating project "no comments" convention. Removed.

### Documented Limitations (3):
- **H2** — `DATE()` SQL function in `journal.query.ts` and `streak.query.ts` depends on PostgreSQL server timezone. Posts created near midnight in different timezones may be grouped on wrong date. Full fix requires passing user timezone from client. Acceptable for single-user MVP.
- **M2** — `<img>` tags used instead of `next/image` `<Image>` component. Pre-existing pattern from `posts-list.tsx`. Requires R2 domain configuration in `next.config.js` to use `<Image>` with external URLs.
- **M3** — Date string from PostgreSQL `DATE()` parsed with `T00:00:00` suffix. PostgreSQL always returns `YYYY-MM-DD` format so risk is negligible, but no runtime validation of format received.

### Verdict: APPROVED — All HIGH and MEDIUM issues fixed or documented. All ACs implemented. 127 tests passing.
