# Story 8.5: Gallery & Moodboard Widgets

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want gallery and moodboard preview widgets on my dashboard,
so that I can see my visual content at a glance.

## Acceptance Criteria

1. **Given** an authenticated user with gallery photos **When** the gallery preview widget loads **Then** it displays a small grid of recent photos (FR64)

2. **Given** an authenticated user with moodboards **When** the moodboard preview widget loads **Then** it displays a preview of the most recent moodboard (FR68)

3. **Given** an authenticated user with no photos or moodboards **When** these widgets load **Then** they show contextual empty states encouraging first uploads

## Tasks / Subtasks

- [x] Task 1: Enhance Gallery Widget with Error Handling (AC: #1, #3)
  - [x] 1.1 Add try/catch around `getUserGallery()` call — on failure, fall back to `<WidgetEmptyState type="gallery" />`. Use `GetUserGalleryOutputDto` type for let declaration (matching posts-widget, mood-widget, messages-widget, tasks-widget, calendar-widget).
  - [x] 1.2 Add total photo count display below grid (e.g., "12 photos" linking to /gallery) — data already available from `result.pagination.total`.
  - [x] 1.3 Verify 2x2 photo grid renders correctly with `next/image` `fill` + `object-cover`.

- [x] Task 2: Enhance Moodboard Widget with Error Handling (AC: #2, #3)
  - [x] 2.1 Add try/catch around `getUserMoodboards()` call — on failure, fall back to `<WidgetEmptyState type="moodboard" />`. Use `GetUserMoodboardsOutputDto` type for let declaration.
  - [x] 2.2 Add total moodboard count if user has more than one board (e.g., "+2 more boards" linking to /moodboard) — data available from `result.pagination.total`.
  - [x] 2.3 Verify pin preview grid renders correctly: image pins use `next/image`, color pins use `backgroundColor` style.

- [x] Task 3: Quality Checks (AC: all)
  - [x] 3.1 Run `pnpm fix` — 0 new errors (49 pre-existing warnings)
  - [x] 3.2 Run `pnpm type-check` — 0 TypeScript errors
  - [x] 3.3 Run `pnpm test` — 360/360 tests pass across 42 files
  - [x] 3.4 Run `pnpm check` — 0 new Biome errors

## Dev Notes

### This is a UI Enhancement Story — No New Domain/Application Code

Story 8.1 already created both `gallery-widget.tsx` and `moodboard-widget.tsx` with working implementations. Both widgets render correctly with data. This story adds **error handling consistency** and **minor enhancements** to match the standard established by stories 8.2, 8.3, and 8.4.

No new aggregates, use cases, DI modules, queries, or repositories needed.

### Critical Issue: Missing Error Handling (try/catch)

Both widgets lack the try/catch pattern that ALL other widgets received during stories 8.2-8.4. If the database query fails (e.g., DB connection issue, schema mismatch), the widget will throw an uncaught exception and break the Suspense boundary instead of gracefully showing an empty state.

**Current (broken on error):**
```typescript
export async function GalleryWidget({ userId }: GalleryWidgetProps) {
  const result = await getUserGallery(userId, 1, 4); // THROWS on DB error!
  ...
}
```

**Required (graceful fallback):**
```typescript
export async function GalleryWidget({ userId }: GalleryWidgetProps) {
  let result: Awaited<ReturnType<typeof getUserGallery>>;
  try {
    result = await getUserGallery(userId, 1, 4);
  } catch {
    return <WidgetEmptyState type="gallery" />;
  }
  ...
}
```

Apply the same pattern to `MoodboardWidget`.

### Existing Code to Reuse (DO NOT Recreate)

| What | File | Usage |
|------|------|-------|
| Gallery widget (base) | `dashboard/_components/gallery-widget.tsx` | MODIFY — add try/catch, photo count |
| Moodboard widget (base) | `dashboard/_components/moodboard-widget.tsx` | MODIFY — add try/catch, board count |
| Widget empty state | `dashboard/_components/widget-empty-state.tsx` | REUSE — already configured for "gallery" and "moodboard" |
| Widget skeleton | `dashboard/_components/widget-skeleton.tsx` | REUSE — Suspense fallback |
| Gallery query | `src/adapters/queries/gallery.query.ts` | KEEP — returns `photos[]` + `pagination` with `total` |
| Moodboard query | `src/adapters/queries/moodboard.query.ts` | KEEP — returns `moodboards[]` + `pagination` with `total` |
| Dashboard page | `dashboard/page.tsx` | UNCHANGED — already composes both widgets with Suspense |
| Card component | `@packages/ui/components/ui/card` | REUSE |

### Import Paths

```typescript
// Existing (unchanged)
import { getUserGallery } from "@/adapters/queries/gallery.query";
import { getUserMoodboards } from "@/adapters/queries/moodboard.query";
import { Card, CardContent, CardHeader, CardTitle } from "@packages/ui/components/ui/card";
import { WidgetEmptyState } from "./widget-empty-state";
import Image from "next/image";
import Link from "next/link";
```

### File Structure

```
# Files to MODIFY (2)
apps/nextjs/app/(protected)/dashboard/_components/gallery-widget.tsx     # Add try/catch, photo count
apps/nextjs/app/(protected)/dashboard/_components/moodboard-widget.tsx   # Add try/catch, board count

# Files UNCHANGED (verify only)
apps/nextjs/app/(protected)/dashboard/_components/widget-empty-state.tsx
apps/nextjs/app/(protected)/dashboard/page.tsx
apps/nextjs/src/adapters/queries/gallery.query.ts
apps/nextjs/src/adapters/queries/moodboard.query.ts
```

### No DI Changes Required

Both widgets use direct CQRS read queries. No DI symbols or modules affected.

### No New Tests Required

Pure UI enhancement + error handling on 2 existing async Server Components. No business logic changes. Existing gallery/moodboard use case tests cover domain logic. Manual testing covers acceptance criteria.

### Testing Strategy

**Manual testing checklist:**
1. Visit `/dashboard` as user with gallery photos -> gallery widget shows 2x2 photo grid
2. Gallery widget shows total photo count below grid (e.g., "12 photos")
3. Gallery widget title links to `/gallery`
4. Visit `/dashboard` as user with NO photos -> gallery widget shows empty state with "Upload Photo" CTA
5. Visit `/dashboard` as user with moodboards -> moodboard widget shows latest board with pin previews
6. Moodboard widget shows board title and pin preview grid (up to 4 pins)
7. If user has >1 moodboard, shows "+N more boards" link
8. Visit `/dashboard` as user with NO moodboards -> moodboard widget shows empty state with "Create Moodboard" CTA
9. All widgets load independently via Suspense (skeleton shown during load)
10. No TypeScript errors, all existing tests pass

### Critical Anti-Patterns to Avoid

1. **Do NOT add `"use client"` to gallery-widget or moodboard-widget** — they must remain async Server Components. Story 8.2 lesson: `"use client"` + `async` is invalid.
2. **Do NOT create new queries** — existing `getUserGallery` and `getUserMoodboards` provide all needed data.
3. **Do NOT create new use cases or DI modules** — CQRS read + UI only.
4. **Do NOT create barrel index.ts files**.
5. **Do NOT add comments** — self-documenting code.
6. **Do NOT break existing tests** — no domain/application layer changes.
7. **Do NOT change the gallery query limit** — widget fetches 4 photos (2x2 grid), matching current implementation.
8. **Do NOT change the moodboard query limit** — widget fetches 1 moodboard with up to 4 preview pins.

### Golden Reference Files

| Purpose | Source File | Adaptation |
|---------|------------|------------|
| Try/catch + type inference | `dashboard/_components/posts-widget.tsx` | `Awaited<ReturnType<typeof getUserGallery>>` pattern |
| Try/catch + Promise.all | `dashboard/_components/mood-widget.tsx` | Error handling pattern with multiple queries |
| Server Component widget | `dashboard/_components/tasks-widget.tsx` | async Server Component with try/catch + empty state fallback |
| Gallery widget (current) | `dashboard/_components/gallery-widget.tsx` | Add try/catch, photo count |
| Moodboard widget (current) | `dashboard/_components/moodboard-widget.tsx` | Add try/catch, board count |
| Gallery query (data shape) | `src/adapters/queries/gallery.query.ts` | Returns `{ photos[], pagination: { total } }` |
| Moodboard query (data shape) | `src/adapters/queries/moodboard.query.ts` | Returns `{ moodboards[], pagination: { total } }` |

### Previous Story Intelligence (Stories 8.1 + 8.2 + 8.3 + 8.4)

Key learnings from previous dashboard stories:
1. **Dashboard layout is done** — 8 widget slots in responsive grid with Suspense boundaries, no layout changes needed
2. **Server Components pattern** — all widgets (except JournalWidget) are async Server Components calling queries directly
3. **Bug fix in 8.2**: `mood-widget.tsx` had invalid `"use client"` + `async` — do NOT add `"use client"` to widget Server Components
4. **Code review fix in 8.1**: `<img>` was replaced with `next/image` — use `Image` from `next/image` for any image display
5. **Error handling in 8.2 + 8.3 + 8.4**: Added try/catch around queries — ALL widgets MUST wrap data fetching in try/catch with empty state fallback
6. **Type inference pattern from 8.3**: Use `Awaited<ReturnType<typeof queryFunction>>` for let declarations
7. **Code review fix in 8.3**: `toPostDto` extracted to shared export to eliminate duplication — avoid duplicating mapping logic
8. **Code review fix in 8.4**: Fixed timezone bug with `new Date().toISOString().slice(0,10)` — use local date formatting
9. **Quality baseline**: 360 tests pass (42 files), 0 TypeScript errors, 0 new Biome errors
10. **Biome formatting: spaces not tabs** — always run `pnpm fix` after writing files

### Git Intelligence

Recent commits:
- `f1b1806` feat(nextjs): implement story 8.4 — tasks and calendar widgets with code review fixes
- `bc7aaee` feat(nextjs): implement story 8.3 — posts and messaging widgets with code review fixes
- `25ae564` feat(nextjs): implement story 8.2 — mood and journal widgets with code review fixes
- `d88b116` feat(nextjs): implement story 8.1 — dashboard layout and empty states with code review fixes

Files relevant to this story:
- `dashboard/_components/gallery-widget.tsx` — to be MODIFIED (add try/catch, photo count)
- `dashboard/_components/moodboard-widget.tsx` — to be MODIFIED (add try/catch, board count)
- `dashboard/_components/widget-empty-state.tsx` — REUSE (already configured for "gallery" + "moodboard")
- `dashboard/page.tsx` — UNCHANGED (already composes both widgets)
- `src/adapters/queries/gallery.query.ts` — KEEP (provides photos + pagination.total)
- `src/adapters/queries/moodboard.query.ts` — KEEP (provides moodboards + pagination.total)

All quality checks pass on current main. 360 tests passing. Codebase is clean and stable.

### DB Schema Reference

**photo table**: `id`, `userId` (FK user.id), `url`, `filename`, `mimeType`, `size`, `caption` (nullable), `createdAt`
- Index: `(userId, createdAt)` for fast gallery queries

**moodboard table**: `id`, `userId` (FK user.id), `title`, `createdAt`, `updatedAt`
- Index: `(userId)`

**pin table**: `id`, `moodboardId` (FK moodboard.id), `type` ("image" | "color"), `imageUrl` (nullable), `color` (nullable), `position`, `createdAt`
- Index: `(moodboardId)`

Relationships: user -> photo (1:N), user -> moodboard (1:N) -> pin (1:N). All cascade delete.

### Project Structure Notes

- No new files to create — modifications only to 2 existing widget files
- Widget files stay in `dashboard/_components/` — colocated with other widgets
- No new folders needed
- No conflicts with existing structure

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 8.5: Gallery & Moodboard Widgets]
- [Source: _bmad-output/planning-artifacts/prd.md#FR64 — Dashboard gallery preview widget]
- [Source: _bmad-output/planning-artifacts/prd.md#FR68 — Dashboard moodboard preview widget]
- [Source: _bmad-output/planning-artifacts/prd.md#FR69 — Dashboard empty states with first-action prompts]
- [Source: _bmad-output/planning-artifacts/architecture.md#Dashboard Widgets — Server Components with Suspense]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/implementation-artifacts/8-4-tasks-and-calendar-widgets.md — previous story]
- [Source: apps/nextjs/app/(protected)/dashboard/_components/gallery-widget.tsx — current implementation]
- [Source: apps/nextjs/app/(protected)/dashboard/_components/moodboard-widget.tsx — current implementation]
- [Source: apps/nextjs/app/(protected)/dashboard/_components/posts-widget.tsx — try/catch pattern reference]
- [Source: apps/nextjs/src/adapters/queries/gallery.query.ts — gallery query with pagination]
- [Source: apps/nextjs/src/adapters/queries/moodboard.query.ts — moodboard query with pin previews]
- [Source: apps/nextjs/app/(protected)/dashboard/_components/widget-empty-state.tsx — empty state config]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- No errors encountered during implementation.

### Completion Notes List

- Enhanced `gallery-widget.tsx`: added try/catch with `Awaited<ReturnType<>>` type inference for graceful error handling (falls back to empty state on query failure), added "View all N photos" CTA below grid when user has >4 photos (links to /gallery).
- Enhanced `moodboard-widget.tsx`: added try/catch with `Awaited<ReturnType<>>` type inference for graceful error handling (falls back to empty state on query failure), added "+N more boards" indicator with hover:underline when user has multiple moodboards.
- Both widgets remain async Server Components (no "use client") — consistent with dashboard architecture established in stories 8.1-8.4.
- All 8 dashboard widgets now have consistent error handling with try/catch + empty state fallback.
- Quality: 0 TypeScript errors, 360/360 tests pass (42 files), 0 new Biome errors (49 pre-existing warnings).

### File List

**Modified files (2):**
- `apps/nextjs/app/(protected)/dashboard/_components/gallery-widget.tsx`
- `apps/nextjs/app/(protected)/dashboard/_components/moodboard-widget.tsx`

### Change Log

| Change | File | Reason |
|--------|------|--------|
| Added try/catch error handling + photo count | `gallery-widget.tsx` | Task 1 — graceful error fallback + total photo count below grid |
| Added try/catch error handling + board count | `moodboard-widget.tsx` | Task 2 — graceful error fallback + additional boards indicator |
| Code review fix: Replaced explicit DTO imports with `Awaited<ReturnType<>>` | `gallery-widget.tsx`, `moodboard-widget.tsx` | M1 — consistency with project convention (posts-widget, mood-widget pattern) |
| Code review fix: Changed "N photos" to "View all N photos" | `gallery-widget.tsx` | L1 — improved CTA clarity |
| Code review fix: Added `hover:underline` to "+N more boards" | `moodboard-widget.tsx` | L2 — consistent hover behavior with gallery photo count link |
