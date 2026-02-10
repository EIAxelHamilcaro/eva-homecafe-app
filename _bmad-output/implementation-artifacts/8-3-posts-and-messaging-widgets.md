# Story 8.3: Posts & Messaging Widgets

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want recent posts and messaging preview widgets on my dashboard,
so that I can stay updated on content and conversations at a glance.

## Acceptance Criteria

1. **Given** an authenticated user with posts **When** the recent posts widget loads **Then** it displays the 3-5 most recent posts (own) with preview (FR62)

2. **Given** an authenticated user with conversations **When** the messaging preview widget loads **Then** it displays the most recent messages/conversations with unread indicators (FR65)

3. **Given** an authenticated user with no posts or messages **When** these widgets load **Then** they show contextual empty states

## Tasks / Subtasks

- [x] Task 1: Create User Posts Query (AC: #1)
  - [x] 1.1 Create `src/adapters/queries/user-posts.query.ts` — direct Drizzle query that returns the user's own posts (both private AND public) ordered by `createdAt DESC` with pagination. Current `journal.query.ts` only returns private posts — FR62 requires ALL user posts.
  - [x] 1.2 Return type: `IPostDto[]` — flat list (no date grouping needed for widget), include `id`, `content`, `isPrivate`, `images`, `createdAt`

- [x] Task 2: Enhance Posts Widget (AC: #1, #3)
  - [x] 2.1 Modify `dashboard/_components/posts-widget.tsx` — replace `getJournalEntries(userId, undefined, 1, 3)` with new `getUserRecentPosts(userId, 5)` query to show 5 most recent posts (all visibility types)
  - [x] 2.2 Add visibility indicator per post — LockKeyhole icon from lucide-react for private posts
  - [x] 2.3 Show image thumbnail if post has images — display first image as 48x48 thumbnail via next/image
  - [x] 2.4 Keep existing empty state via `<WidgetEmptyState type="posts" />` (already configured)
  - [x] 2.5 Add try/catch for graceful error handling — fallback to empty state on query failure

- [x] Task 3: Enhance Messages Widget (AC: #2, #3)
  - [x] 3.1 Modify `dashboard/_components/messages-widget.tsx` — add participant name display via batch profile query
  - [x] 3.2 Create `src/adapters/queries/profile-names.query.ts` — lightweight query that batch-fetches displayName from profile table using `inArray`, avoiding N+1
  - [x] 3.3 Show other participant's displayName as conversation label (bold, above message preview)
  - [x] 3.4 Add relative timestamp to last message (formatRelativeTime: "Just now", "2m ago", "1h ago", "Yesterday", date)
  - [x] 3.5 Kept link to `/messages` (messages page does not support conversation query param routing)
  - [x] 3.6 Keep existing unread count badge (already implemented) and empty state
  - [x] 3.7 Add try/catch for graceful error handling — fallback to empty state on failure

- [x] Task 4: Quality Checks (AC: all)
  - [x] 4.1 Run `pnpm fix` — 0 new errors (49 pre-existing warnings)
  - [x] 4.2 Run `pnpm type-check` — 0 TypeScript errors
  - [x] 4.3 Run `pnpm test` — 360/360 tests pass across 42 files (11 new tests added during code review)
  - [x] 4.4 Run `pnpm check` — 0 new Biome errors

## Dev Notes

### This is a UI Enhancement + 2 New Queries Story

Story 8.1 already created both `posts-widget.tsx` and `messages-widget.tsx` with basic implementations. This story enhances them to fully meet the acceptance criteria. No new domain aggregates, use cases, or DI modules needed.

### Critical Issue: Posts Widget Uses Wrong Query

The current `posts-widget.tsx` calls `getJournalEntries(userId, undefined, 1, 3)` which **only returns private posts** (journals). FR62 specifies "Dashboard displays recent posts widget" — this should show ALL the user's own recent posts (private AND public). A new lightweight query is needed.

### New Query: `user-posts.query.ts`

```typescript
import { db, post } from "@packages/drizzle";
import { desc, eq } from "drizzle-orm";
import type { IPostDto } from "@/application/dto/post/get-user-posts.dto";

export async function getUserRecentPosts(
  userId: string,
  limit = 5,
): Promise<IPostDto[]> {
  const records = await db
    .select()
    .from(post)
    .where(eq(post.userId, userId))
    .orderBy(desc(post.createdAt))
    .limit(limit);

  return records.map((record) => ({
    id: record.id,
    content: record.content,
    isPrivate: record.isPrivate,
    images: (record.images as string[]) ?? [],
    userId: record.userId,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt ? record.updatedAt.toISOString() : null,
  }));
}
```

Follow the exact Drizzle query pattern from `journal.query.ts` and `gallery.query.ts`. No pagination metadata needed for the widget (just fetches top N).

### Messages Widget Enhancement: Participant Names

The current `GetConversationsUseCase` returns `participants: IParticipantDto[]` with only `userId`, `joinedAt`, `lastReadAt` — no display names. To show participant names in the widget:

**Option A (Recommended): Lightweight query alongside the use case**
Create a small helper query that takes an array of userIds and returns their display names from the profile table:

```typescript
import { db } from "@packages/drizzle";
import { profile } from "@packages/drizzle/schema";
import { inArray } from "drizzle-orm";

export async function getProfileNames(
  userIds: string[],
): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();

  const profiles = await db
    .select({ userId: profile.userId, displayName: profile.displayName })
    .from(profile)
    .where(inArray(profile.userId, userIds));

  return new Map(profiles.map((p) => [p.userId, p.displayName]));
}
```

Then in `messages-widget.tsx`:
1. Execute `GetConversationsUseCase` (existing)
2. Collect all participant userIds from the 3 conversations
3. Call `getProfileNames(allParticipantIds)` — single DB query
4. Map names to each conversation's "other participant"

This avoids modifying the use case or adding profile resolution to the chat domain.

### Relative Time Helper

For "2m ago", "1h ago" display on messages, create a small utility:

```typescript
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return "Yesterday";
  return new Date(date).toLocaleDateString();
}
```

Placed inline in `messages-widget.tsx` as it is only used there.

### Existing Code to Reuse (DO NOT Recreate)

| What | File | Usage |
|------|------|-------|
| Posts widget (base) | `dashboard/_components/posts-widget.tsx` | MODIFY — replace query, add visibility + images |
| Messages widget (base) | `dashboard/_components/messages-widget.tsx` | MODIFY — add names, timestamps |
| Widget empty state | `dashboard/_components/widget-empty-state.tsx` | REUSE — already configured for posts and messages |
| Widget skeleton | `dashboard/_components/widget-skeleton.tsx` | REUSE — Suspense fallback |
| GetConversationsUseCase | `src/application/use-cases/chat/get-conversations.use-case.ts` | REUSE — fetches conversations with unread count |
| Journal query pattern | `src/adapters/queries/journal.query.ts` | REFERENCE — Drizzle query pattern for posts |
| Gallery query pattern | `src/adapters/queries/gallery.query.ts` | REFERENCE — simple Drizzle query pattern |
| Card component | `packages/ui/src/components/ui/card.tsx` | REUSE |
| Post schema | `packages/drizzle/src/schema/post.ts` | REFERENCE — post table columns |
| Profile schema | `packages/drizzle/src/schema/profile.ts` | REFERENCE — profile table for names |
| Dashboard page | `dashboard/page.tsx` | UNCHANGED — already composes both widgets |
| DI container | `src/common/di/container.ts` | REUSE — getInjection("GetConversationsUseCase") |

### Import Paths

```typescript
// New query (to create)
import { getUserRecentPosts } from "@/adapters/queries/user-posts.query";
import { getProfileNames } from "@/adapters/queries/profile-names.query";

// Existing (unchanged)
import { getInjection } from "@/common/di/container";
import { Card, CardHeader, CardTitle, CardContent } from "@packages/ui/components/ui/card";
import { WidgetEmptyState } from "./widget-empty-state";

// Next.js
import Link from "next/link";
import Image from "next/image";
```

### File Structure

```
# Files to CREATE
apps/nextjs/src/adapters/queries/user-posts.query.ts         # New: all user posts (private + public)
apps/nextjs/src/adapters/queries/profile-names.query.ts       # New: batch profile name lookup

# Files to MODIFY
apps/nextjs/app/(protected)/dashboard/_components/posts-widget.tsx    # Replace query, add visibility + image preview
apps/nextjs/app/(protected)/dashboard/_components/messages-widget.tsx  # Add participant names, timestamps

# Files UNCHANGED (verify only)
apps/nextjs/app/(protected)/dashboard/_components/widget-empty-state.tsx
apps/nextjs/app/(protected)/dashboard/page.tsx
```

### No DI Changes Required

New queries are direct Drizzle calls (CQRS reads). The existing `GetConversationsUseCase` is already registered in DI and will be reused as-is. No new DI symbols or modules needed.

### No New Tests Required

Pure UI enhancement + 2 simple CQRS read queries. No business logic to test. Existing use case tests cover `GetConversationsUseCase`. Manual testing covers all acceptance criteria.

### Testing Strategy

**Manual testing checklist:**
1. Visit `/dashboard` as user with posts (private + public) → posts widget shows up to 5 recent posts with content preview
2. Posts widget shows visibility indicator (lock icon for private/journal, nothing for public)
3. Posts widget shows image thumbnail for posts with images
4. Posts widget links each post to `/posts/{id}`
5. Visit `/dashboard` as user with NO posts → posts widget shows empty state with CTA
6. Visit `/dashboard` as user with conversations → messages widget shows up to 3 conversations
7. Messages widget shows other participant's name as conversation label
8. Messages widget shows last message preview (truncated) with relative timestamp
9. Messages widget shows unread count badge for conversations with unread messages
10. Visit `/dashboard` as user with NO conversations → messages widget shows empty state with CTA
11. All widgets load independently via Suspense (skeleton shown during load)

### Critical Anti-Patterns to Avoid

1. **Do NOT use `getJournalEntries` for the posts widget** — it only returns private posts. Create a new query that returns ALL user posts.
2. **Do NOT modify `GetConversationsUseCase`** — add profile name resolution as a separate query in the widget
3. **Do NOT create new use cases or DI modules** — this is CQRS read + UI only
4. **Do NOT add `"use client"` to either widget** — they must remain async Server Components
5. **Do NOT create barrel index.ts files**
6. **Do NOT add comments** — self-documenting code
7. **Do NOT break existing tests** — no domain/application layer changes
8. **Do NOT fetch profile data inside a loop** — batch all participant IDs into a single query

### Golden Reference Files

| Purpose | Source File | Adaptation |
|---------|------------|------------|
| Posts query pattern | `src/adapters/queries/journal.query.ts` | user-posts.query.ts (remove isPrivate filter, simplify structure) |
| Gallery query pattern | `src/adapters/queries/gallery.query.ts` | Simple Drizzle select pattern |
| Messages widget pattern | `dashboard/_components/messages-widget.tsx` | Enhance with names + timestamps |
| Posts widget pattern | `dashboard/_components/posts-widget.tsx` | Enhance with new query + visibility |
| Image display | `dashboard/_components/gallery-widget.tsx` | next/image pattern for thumbnails |
| Mood widget (Server Component) | `dashboard/_components/mood-widget.tsx` | async Server Component pattern (no "use client") |
| Profile schema | `packages/drizzle/src/schema/profile.ts` | Table structure for name lookup |

### Previous Story Intelligence (Stories 8.1 + 8.2)

Key learnings from previous dashboard stories:
1. **Dashboard layout is done** — 8 widget slots in responsive grid with Suspense boundaries, no layout changes needed
2. **Server Components pattern** — all widgets (except JournalWidget) are async Server Components calling queries directly
3. **Bug fix in 8.2**: `mood-widget.tsx` had invalid `"use client"` + `async` — do NOT add `"use client"` to widget Server Components
4. **Code review fix in 8.1**: `<img>` was replaced with `next/image` — use `Image` from `next/image` for any thumbnail display
5. **Code review fix in 8.2**: Extracted shared config to avoid duplication — if any shared utility is needed, extract to standalone file
6. **Error handling in 8.2**: Added try/catch around queries — consider wrapping new queries in try/catch for graceful fallback to empty state
7. **CQRS pattern** — widgets call queries directly for reads, use cases via DI only when no query exists (like messages)
8. **Quality baseline**: 349 tests pass, 0 TypeScript errors, 0 new Biome errors
9. **Biome formatting: spaces not tabs** — always run `pnpm fix` after writing files

### Git Intelligence

Recent commits:
- `25ae564` feat(nextjs): implement story 8.2 — mood and journal widgets with code review fixes
- `d88b116` feat(nextjs): implement story 8.1 — dashboard layout and empty states with code review fixes

Files created/modified in stories 8.1+8.2 (relevant to this story):
- `dashboard/_components/posts-widget.tsx` — to be MODIFIED (replace query)
- `dashboard/_components/messages-widget.tsx` — to be MODIFIED (add names + timestamps)
- `dashboard/_components/widget-empty-state.tsx` — REUSE
- `dashboard/page.tsx` — UNCHANGED

All quality checks pass on current main. 349 tests passing. Codebase is clean and stable.

### Project Structure Notes

- New query files go in `src/adapters/queries/` (flat, kebab-case) — matches `journal.query.ts`, `gallery.query.ts`, etc.
- Widget modifications stay in `dashboard/_components/` — colocated with other widgets
- No new folders needed
- No conflicts with existing structure

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 8.3: Posts & Messaging Widgets]
- [Source: _bmad-output/planning-artifacts/prd.md#FR62 — Dashboard recent posts widget]
- [Source: _bmad-output/planning-artifacts/prd.md#FR65 — Dashboard messaging preview widget]
- [Source: _bmad-output/planning-artifacts/architecture.md#Dashboard Widgets — Server Components with Suspense]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/implementation-artifacts/8-1-dashboard-layout-and-empty-states.md — previous story]
- [Source: _bmad-output/implementation-artifacts/8-2-mood-and-journal-widgets.md — previous story]
- [Source: apps/nextjs/src/adapters/queries/journal.query.ts — Drizzle query pattern]
- [Source: apps/nextjs/src/adapters/queries/gallery.query.ts — simple query pattern]
- [Source: apps/nextjs/src/application/use-cases/chat/get-conversations.use-case.ts — conversations data]
- [Source: apps/nextjs/src/application/dto/chat/get-conversations.dto.ts — conversation DTO shape]
- [Source: apps/nextjs/app/(protected)/dashboard/_components/posts-widget.tsx — current implementation]
- [Source: apps/nextjs/app/(protected)/dashboard/_components/messages-widget.tsx — current implementation]
- [Source: packages/drizzle/src/schema/post.ts — post table schema]
- [Source: packages/drizzle/src/schema/profile.ts — profile table for name lookup]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- TypeScript error on first pass: `post.images[0]` type `string | undefined` not assignable to `string | StaticImport` for next/image `src` prop. Fixed by adding truthiness guard `post.images[0] &&` before rendering Image.

### Completion Notes List

- Created `user-posts.query.ts`: lightweight Drizzle query returning ALL user posts (private + public) ordered by createdAt DESC. Replaces `getJournalEntries` which only returned private posts (violating FR62).
- Created `profile-names.query.ts`: batch profile name lookup using `inArray` to avoid N+1 queries when resolving conversation participant display names.
- Enhanced `posts-widget.tsx`: replaced journal query with user-posts query (5 items), added LockKeyhole icon for private posts, added 48x48 image thumbnail via next/image, added try/catch error handling.
- Enhanced `messages-widget.tsx`: added participant display names via batch profile query, added relative timestamp on last message (`formatRelativeTime`), improved conversation layout with name as label above message preview, added try/catch error handling.
- Both widgets remain async Server Components (no "use client") — consistent with dashboard architecture.
- Quality: 0 TypeScript errors, 349/349 tests pass, 0 new Biome errors.

### File List

**New files (4):**
- `apps/nextjs/src/adapters/queries/user-posts.query.ts`
- `apps/nextjs/src/adapters/queries/profile-names.query.ts`
- `apps/nextjs/app/(protected)/dashboard/_components/format-relative-time.ts`
- `apps/nextjs/app/(protected)/dashboard/_components/__tests__/format-relative-time.test.ts`

**Modified files (3):**
- `apps/nextjs/app/(protected)/dashboard/_components/posts-widget.tsx`
- `apps/nextjs/app/(protected)/dashboard/_components/messages-widget.tsx`
- `apps/nextjs/src/adapters/queries/journal.query.ts`

### Change Log

| Change | File | Reason |
|--------|------|--------|
| Created user posts query | `user-posts.query.ts` | Task 1 — fetch ALL user posts (private + public) for dashboard widget |
| Created profile names query | `profile-names.query.ts` | Task 3.2 — batch fetch participant display names |
| Enhanced posts widget | `posts-widget.tsx` | Task 2 — new query, lock icon for private, image thumbnail, error handling |
| Enhanced messages widget | `messages-widget.tsx` | Task 3 — participant names, relative timestamps, error handling |
| [Review] Exported `toPostDto` | `journal.query.ts` | M1 — eliminate code duplication with user-posts.query.ts |
| [Review] Reuse shared `toPostDto` | `user-posts.query.ts` | M1 — import toPostDto instead of duplicating mapping logic |
| [Review] Protected `getProfileNames` | `messages-widget.tsx` | M2 — wrap in try/catch with fallback to empty Map |
| [Review] Extracted `formatRelativeTime` | `format-relative-time.ts` | M3 — extracted for testability |
| [Review] Added 11 unit tests | `format-relative-time.test.ts` | M3 — test all time branches including edge cases |

### Senior Developer Review (AI)

**Reviewer:** Axel on 2026-02-10
**Outcome:** Approved with fixes applied

**Findings (6 total: 3 MEDIUM, 3 LOW):**

**MEDIUM (all fixed):**
- M1: Code duplication — `toPostDto` mapping duplicated between `journal.query.ts` and `user-posts.query.ts`. Fixed by exporting from journal.query.ts and importing in user-posts.query.ts.
- M2: Unprotected async call — `getProfileNames()` in messages-widget.tsx not wrapped in try/catch. Fixed by adding try/catch with `new Map()` fallback.
- M3: No tests for `formatRelativeTime` — pure function with 5 branches untested. Fixed by extracting to standalone file and adding 11 unit tests.

**LOW (accepted as-is):**
- L1: Import path inconsistency — `profile` imported from `@packages/drizzle/schema` vs other tables from `@packages/drizzle`. Likely because `profile` is not re-exported from main package entry.
- L2: Rich text content as plain text — `post.content` rendered directly. Acceptable for widget preview with `line-clamp-2`.
- L3: Missing `sizes` on Image — 48x48 thumbnail doesn't need responsive sizes attribute.

**Quality after review:** 0 TypeScript errors, 360/360 tests pass (42 files), 0 new Biome errors.
