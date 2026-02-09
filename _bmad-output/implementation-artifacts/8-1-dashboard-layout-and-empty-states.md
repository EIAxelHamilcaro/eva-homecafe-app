# Story 8.1: Dashboard Layout & Empty States

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to see a dashboard that organizes all my key information in one view,
so that I have a single entry point to everything that matters.

## Acceptance Criteria

1. **Given** an authenticated user **When** they navigate to the dashboard (connected landing page) **Then** they see a layout with 8 widget slots, each wrapped in `<Suspense>` with skeleton fallbacks **And** widgets load independently (fastest appear first) **And** each widget renders within 1 second (NFR2)

2. **Given** a new user with no data in any module **When** they view the dashboard **Then** each widget displays a contextual empty state with a first-action prompt (FR69) **And** prompts guide the user to: record mood, write first post, create a to-do, upload a photo, send a message, create a moodboard

3. **Given** the dashboard page **When** rendered as a Server Component **Then** it composes 8 independent async Server Components with Suspense boundaries

## Tasks / Subtasks

- [x] Task 1: Create Dashboard Page (AC: #1, #3)
  - [x] 1.1 Create `app/(protected)/dashboard/page.tsx` — async Server Component with `requireAuth()`, compose 8 widget slots in responsive grid
  - [x] 1.2 Use `<Suspense fallback={<WidgetSkeleton />}>` around each widget Server Component
  - [x] 1.3 Responsive grid: 1 col mobile, 2 cols tablet (md), 3-4 cols desktop (lg/xl)

- [x] Task 2: Create Widget Skeleton Component (AC: #1)
  - [x] 2.1 Create `app/(protected)/dashboard/_components/widget-skeleton.tsx` — reusable animated skeleton matching Card dimensions with `animate-pulse bg-muted`

- [x] Task 3: Create Empty State Component (AC: #2)
  - [x] 3.1 Create `app/(protected)/dashboard/_components/widget-empty-state.tsx` — generic empty state with icon, message, and CTA link/button per widget type
  - [x] 3.2 Each widget type gets contextual messaging: mood → "Record your first mood", posts → "Write your first post", tasks → "Create your first to-do", gallery → "Upload your first photo", messages → "Send your first message", moodboard → "Create your first moodboard", calendar → "Add a task with a due date", journal → "Write a journal entry"

- [x] Task 4: Create 8 Widget Server Components (AC: #1, #2, #3)
  - [x] 4.1 Create `app/(protected)/dashboard/_components/mood-widget.tsx` — async Server Component: call `getMoodStats(userId, "week")` + `getTodayMood(userId)`, show weekly summary or empty state (FR61)
  - [x] 4.2 Create `app/(protected)/dashboard/_components/posts-widget.tsx` — async Server Component: call `getJournalEntries(userId, undefined, 1, 3)` to get latest 3 posts, show previews or empty state (FR62)
  - [x] 4.3 Create `app/(protected)/dashboard/_components/tasks-widget.tsx` — async Server Component: call board query to get pending tasks, show checklist or empty state (FR63)
  - [x] 4.4 Create `app/(protected)/dashboard/_components/gallery-widget.tsx` — async Server Component: call `getUserGallery(userId, 1, 4)` for 4 recent photos, show grid or empty state (FR64)
  - [x] 4.5 Create `app/(protected)/dashboard/_components/messages-widget.tsx` — async Server Component: call GetConversationsUseCase via DI to get recent conversations with unread counts, show preview or empty state (FR65)
  - [x] 4.6 Create `app/(protected)/dashboard/_components/calendar-widget.tsx` — async Server Component: call `getChronology(userId)` for current month events, show month view with markers or empty state (FR66)
  - [x] 4.7 Create `app/(protected)/dashboard/_components/journal-widget.tsx` — Client Component: render quick-compose textarea with submit that POSTs to `/api/v1/posts` as private, or show empty state encouraging first entry (FR67)
  - [x] 4.8 Create `app/(protected)/dashboard/_components/moodboard-widget.tsx` — async Server Component: call `getUserMoodboards(userId, 1, 1)` for most recent moodboard preview, show pins or empty state (FR68)

- [x] Task 5: Redirect Connected Landing Page to Dashboard (AC: #1)
  - [x] 5.1 Ensure authenticated users landing on root `/` are redirected to `/dashboard` (check existing redirect logic in `app/(protected)/` layout or root page)

- [x] Task 6: Quality Checks (AC: all)
  - [x] 6.1 Run `pnpm fix` — auto-fix formatting (5 files fixed)
  - [x] 6.2 Run `pnpm type-check` — 0 TypeScript errors
  - [x] 6.3 Run `pnpm test` — 349 tests pass across 41 files
  - [x] 6.4 Run `pnpm check` — 0 new Biome errors (51 pre-existing warnings only)

## Dev Notes

### This is a Pure UI + CQRS Read Story

No new domain aggregates, no new use cases, no DI changes. All data comes from existing queries and use cases. This story creates the dashboard page structure, 8 widget Server Components that call existing queries directly, and contextual empty states for new users.

### Architecture: Server Components with Suspense

```
Dashboard Page (Server Component)
  └─ <Suspense fallback={<WidgetSkeleton />}>
       └─ MoodWidget (async Server Component → getMoodStats + getTodayMood)
  └─ <Suspense fallback={<WidgetSkeleton />}>
       └─ PostsWidget (async Server Component → getJournalEntries)
  └─ <Suspense fallback={<WidgetSkeleton />}>
       └─ TasksWidget (async Server Component → board query)
  └─ <Suspense fallback={<WidgetSkeleton />}>
       └─ GalleryWidget (async Server Component → getUserGallery)
  └─ <Suspense fallback={<WidgetSkeleton />}>
       └─ MessagesWidget (async Server Component → GetConversationsUseCase)
  └─ <Suspense fallback={<WidgetSkeleton />}>
       └─ CalendarWidget (async Server Component → getChronology)
  └─ <Suspense fallback={<WidgetSkeleton />}>
       └─ JournalWidget (Client Component — quick-compose form)
  └─ <Suspense fallback={<WidgetSkeleton />}>
       └─ MoodboardWidget (async Server Component → getUserMoodboards)
```

Each widget resolves independently. Fastest-loading widgets appear first.

### Key Decision: Server Components (NOT Client fetch)

The epics spec explicitly requires `<Suspense>` with skeleton fallbacks and independent Server Component loading. This is DIFFERENT from the existing page pattern (client-side useEffect fetch). For dashboard widgets, use async Server Components that call queries directly — NOT client components with `fetch()`.

**Exception:** JournalWidget (FR67) must be a Client Component because it needs form interactivity (textarea + submit button). Wrap it in Suspense anyway for consistency.

### Existing Queries to Call Directly (DO NOT Create New Ones)

| Widget | Query Import | Function Call |
|--------|-------------|---------------|
| Mood (FR61) | `@/adapters/queries/mood-stats.query` | `getMoodStats(userId, "week")` |
| Mood today | `@/adapters/queries/today-mood.query` | `getTodayMood(userId)` |
| Posts (FR62) | `@/adapters/queries/journal.query` | `getJournalEntries(userId, undefined, 1, 3)` |
| Tasks (FR63) | `@/adapters/queries/chronology.query` | `getChronology(userId)` — filter for incomplete cards |
| Gallery (FR64) | `@/adapters/queries/gallery.query` | `getUserGallery(userId, 1, 4)` |
| Calendar (FR66) | `@/adapters/queries/chronology.query` | `getChronology(userId)` — use eventDates for markers |
| Moodboard (FR68) | `@/adapters/queries/moodboard.query` | `getUserMoodboards(userId, 1, 1)` |

### Messages Widget: Use Case via DI (No Query Exists)

The messaging module does NOT have dedicated read queries — it uses use cases only. For the messages widget:

```typescript
import { getInjection } from "@/common/di/container";

const useCase = getInjection("GetConversationsUseCase");
const result = await useCase.execute({ userId, page: 1, limit: 3 });
```

Check `GetConversationsUseCase` exact input/output interface before implementing. Look at `src/adapters/controllers/chat/chat.controller.ts` for the usage pattern.

### Journal Quick-Compose Widget (FR67): Client Component

This widget needs interactivity (textarea + submit). Pattern:

```typescript
"use client";

import { useState } from "react";

export function JournalWidget() {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    await fetch("/api/v1/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, isPrivate: true }),
    });
    setContent("");
    setSubmitting(false);
  }

  return (/* form UI */);
}
```

Check the CreatePostUseCase input DTO at `src/application/dto/post/create-post.dto.ts` for exact required fields. The post must be created as `isPrivate: true` to make it a journal entry.

### Widget Card Pattern

All widgets use shadcn `<Card>`:

```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@packages/ui/components/ui/card";

export async function MoodWidget({ userId }: { userId: string }) {
  const stats = await getMoodStats(userId, "week");

  if (!stats || stats.totalEntries === 0) {
    return <WidgetEmptyState type="mood" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Widget content */}
      </CardContent>
    </Card>
  );
}
```

### Empty State Design Pattern (FR69)

Each widget gets a contextual empty state:

```typescript
interface WidgetEmptyStateProps {
  type: "mood" | "posts" | "tasks" | "gallery" | "messages" | "calendar" | "journal" | "moodboard";
}

const EMPTY_STATE_CONFIG = {
  mood: { title: "No mood data yet", message: "Track your first mood to see your weekly summary", href: "/mood", cta: "Record Mood" },
  posts: { title: "No posts yet", message: "Write your first post to see it here", href: "/posts/new", cta: "Write Post" },
  tasks: { title: "No tasks yet", message: "Create your first to-do list", href: "/organization", cta: "Create Task" },
  gallery: { title: "No photos yet", message: "Upload your first photo to start your gallery", href: "/gallery", cta: "Upload Photo" },
  messages: { title: "No messages yet", message: "Start a conversation with a friend", href: "/messages", cta: "Send Message" },
  calendar: { title: "No events yet", message: "Add a task with a due date to see it on the calendar", href: "/organization", cta: "Add Task" },
  journal: { title: "Start journaling", message: "Write your first journal entry below" },
  moodboard: { title: "No moodboards yet", message: "Create a visual moodboard to express yourself", href: "/moodboard", cta: "Create Moodboard" },
};
```

### Dashboard Page Layout

```typescript
// app/(protected)/dashboard/page.tsx
import { Suspense } from "react";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { WidgetSkeleton } from "./_components/widget-skeleton";
import { MoodWidget } from "./_components/mood-widget";
// ... other widget imports

export default async function DashboardPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 font-bold text-2xl">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Suspense fallback={<WidgetSkeleton />}>
          <MoodWidget userId={userId} />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <PostsWidget userId={userId} />
        </Suspense>
        {/* ... 6 more widgets */}
      </div>
    </div>
  );
}
```

### Responsive Grid Strategy

- **Mobile (default):** 1 column — widgets stack vertically
- **Tablet (md: 768px+):** 2 columns
- **Desktop (xl: 1280px+):** 3 columns
- Container: `max-w-7xl` (wider than typical pages to accommodate grid)
- Gap: `gap-6` for breathing room between cards

### Existing Code to Reuse (DO NOT Recreate)

| What | File | Status |
|------|------|--------|
| Auth guard | `src/adapters/guards/auth.guard.ts` | EXISTS |
| Mood stats query | `src/adapters/queries/mood-stats.query.ts` | EXISTS |
| Today mood query | `src/adapters/queries/today-mood.query.ts` | EXISTS |
| Journal entries query | `src/adapters/queries/journal.query.ts` | EXISTS |
| Streak query | `src/adapters/queries/streak.query.ts` | EXISTS |
| Gallery query | `src/adapters/queries/gallery.query.ts` | EXISTS |
| Chronology query | `src/adapters/queries/chronology.query.ts` | EXISTS |
| Moodboard query | `src/adapters/queries/moodboard.query.ts` | EXISTS |
| Reward collection query | `src/adapters/queries/reward-collection.query.ts` | EXISTS |
| GetConversationsUseCase | `src/application/use-cases/chat/` | EXISTS (for messages widget) |
| Card component | `packages/ui/src/components/ui/card.tsx` | EXISTS |
| Chart component | `packages/ui/src/components/ui/chart.tsx` | EXISTS |
| Calendar component | `packages/ui/src/components/ui/calendar.tsx` | EXISTS |

### Import Paths

shadcn/ui components:
```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@packages/ui/components/ui/card";
```

Queries:
```typescript
import { getMoodStats } from "@/adapters/queries/mood-stats.query";
import { getTodayMood } from "@/adapters/queries/today-mood.query";
import { getJournalEntries } from "@/adapters/queries/journal.query";
import { getUserGallery } from "@/adapters/queries/gallery.query";
import { getChronology } from "@/adapters/queries/chronology.query";
import { getUserMoodboards } from "@/adapters/queries/moodboard.query";
```

DI:
```typescript
import { getInjection } from "@/common/di/container";
```

### File Structure

```
# New files to create
apps/nextjs/app/(protected)/dashboard/page.tsx
apps/nextjs/app/(protected)/dashboard/_components/widget-skeleton.tsx
apps/nextjs/app/(protected)/dashboard/_components/widget-empty-state.tsx
apps/nextjs/app/(protected)/dashboard/_components/mood-widget.tsx
apps/nextjs/app/(protected)/dashboard/_components/posts-widget.tsx
apps/nextjs/app/(protected)/dashboard/_components/tasks-widget.tsx
apps/nextjs/app/(protected)/dashboard/_components/gallery-widget.tsx
apps/nextjs/app/(protected)/dashboard/_components/messages-widget.tsx
apps/nextjs/app/(protected)/dashboard/_components/calendar-widget.tsx
apps/nextjs/app/(protected)/dashboard/_components/journal-widget.tsx
apps/nextjs/app/(protected)/dashboard/_components/moodboard-widget.tsx

# Files to potentially modify
apps/nextjs/app/(protected)/page.tsx OR app/page.tsx  # Redirect to /dashboard for authenticated users
```

### No DI Changes Required

All data comes from existing CQRS queries (direct function calls) or existing use cases (via `getInjection`). No new DI symbols, no new modules.

### No New Tests Required

This is a pure UI + query composition story. No business logic to test. Existing queries are already tested via their respective stories. Manual testing checklist below covers all acceptance criteria.

### Testing Strategy

**Manual testing checklist:**
1. Visit `/dashboard` as authenticated user → see 8 widget cards in responsive grid
2. Resize browser → verify 1/2/3 column layout transitions
3. Each widget loads independently → skeleton fallback shown during load
4. New user with no data → all 8 widgets show contextual empty states with CTAs
5. User with mood data → mood widget shows weekly chart/summary
6. User with posts → posts widget shows 3 recent posts
7. User with tasks → tasks widget shows pending checklist
8. User with photos → gallery widget shows 4 recent photos
9. User with conversations → messages widget shows recent conversations with unread count
10. User with due dates → calendar widget shows month view with event markers
11. Journal widget → textarea available, submit creates private post
12. User with moodboards → moodboard widget shows most recent board preview
13. Each widget renders within 1 second (performance check)

### Critical Anti-Patterns to Avoid

1. **Do NOT use client-side fetch for widget data** — use async Server Components that call queries directly (except JournalWidget which needs interactivity)
2. **Do NOT create new queries** — all required queries already exist
3. **Do NOT create new use cases** — this is pure CQRS read + UI composition
4. **Do NOT create new DI symbols or modules**
5. **Do NOT create barrel index.ts files**
6. **Do NOT add comments** — self-documenting code
7. **Do NOT use `useState`/`useEffect` for data fetching** in widget Server Components — use async/await directly
8. **Do NOT create a DashboardClient wrapper** — use individual Server Components with Suspense, not one big client component
9. **Do NOT hardcode data in components** — always fetch from queries/use cases
10. **Do NOT break existing tests** — no domain/application changes

### Golden Reference Files

| Purpose | Source File | Adaptation |
|---------|------------|------------|
| Page pattern | `app/(protected)/gallery/page.tsx` | dashboard/page.tsx (but with Suspense grid) |
| Query usage | `app/(protected)/mood/_components/mood-bar-chart.tsx` | Adapt to Server Component (no useState/useEffect) |
| Card styling | `app/(protected)/rewards/_components/reward-card.tsx` | widget-card pattern |
| Empty state | `app/(protected)/rewards/_components/reward-empty-state.tsx` | widget-empty-state.tsx |
| Loading skeleton | Mood components' `animate-pulse bg-muted` | widget-skeleton.tsx |
| Chart usage | `app/(protected)/mood/_components/mood-bar-chart.tsx` | mood-widget chart |
| Calendar component | `packages/ui/src/components/ui/calendar.tsx` | calendar-widget |

### Previous Story Intelligence (Story 7.2)

Key learnings from Story 7.2:
1. **CQRS read pattern works well** — queries imported directly, no use cases needed for reads
2. **Unified query with shared helper** — `reward-collection.query.ts` used `getCollectionByType()` to avoid duplication. Apply same DRY principle to dashboard widgets (e.g., shared WidgetEmptyState component)
3. **shadcn/ui imports** use `@packages/ui/components/ui/*` pattern (verified)
4. **No navigation component exists** — pages accessible via direct URL
5. **Quality checks**: all 349 tests pass, 0 TypeScript errors, 0 Biome errors on current main
6. **Biome formatting: spaces not tabs** — always run `pnpm fix` after writing files

### Git Intelligence

Recent commits:
- `dee4a87` docs: complete epic 7 retrospective and mark epic as done
- `918513b` feat(nextjs): implement story 7.2 — browse sticker and badge collections with code review fixes
- `08a119f` chore: mark story 7.1 as done in sprint status
- `c24cea5` feat(nextjs): implement stories 6.2 and 7.1 with code review fixes

All quality checks pass on current main. 349 tests passing. Codebase is clean and stable.

### Project Structure Notes

- All new files follow established naming conventions (kebab-case)
- Dashboard page in `app/(protected)/dashboard/` — new folder
- Widget components in `_components/` subfolder — standard pattern
- No conflicts with existing structure
- `max-w-7xl` container is wider than other pages (which use `max-w-4xl` to `max-w-6xl`) to accommodate 3-column widget grid

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 8.1: Dashboard Layout & Empty States]
- [Source: _bmad-output/planning-artifacts/prd.md#FR61-FR69 — Dashboard Widgets]
- [Source: _bmad-output/planning-artifacts/architecture.md#Dashboard Widgets — Server Components with Suspense]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/implementation-artifacts/7-2-browse-sticker-and-badge-collections.md — previous story]
- [Source: apps/nextjs/src/adapters/queries/ — all existing query files]
- [Source: apps/nextjs/app/(protected)/gallery/page.tsx — page pattern]
- [Source: apps/nextjs/app/(protected)/mood/_components/ — chart and data patterns]
- [Source: packages/ui/src/components/ui/card.tsx — Card component]
- [Source: packages/ui/src/components/ui/calendar.tsx — Calendar component]
- [Source: packages/ui/src/components/ui/chart.tsx — Chart component with recharts]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — all quality checks passed on first attempt.

### Completion Notes List

- All 8 widgets implemented as async Server Components (except JournalWidget which is a Client Component for form interactivity)
- Each widget wrapped in `<Suspense>` with `<WidgetSkeleton />` fallback for independent loading
- Config-driven `WidgetEmptyState` component handles all 8 widget types with contextual messages and CTA links
- Messages widget uses `getInjection("GetConversationsUseCase")` since chat module has no CQRS query
- Tasks widget reuses `getChronology()` query and filters for incomplete cards (no new query needed)
- Calendar widget builds a mini month grid from `getChronology()` event dates
- Root `app/page.tsx` modified to redirect authenticated users to `/dashboard` using `authGuard()`
- Quality: 0 TypeScript errors, 349/349 tests pass, 0 new Biome errors

### File List

**New files (11):**
- `apps/nextjs/app/(protected)/dashboard/page.tsx`
- `apps/nextjs/app/(protected)/dashboard/_components/widget-skeleton.tsx`
- `apps/nextjs/app/(protected)/dashboard/_components/widget-empty-state.tsx`
- `apps/nextjs/app/(protected)/dashboard/_components/mood-widget.tsx`
- `apps/nextjs/app/(protected)/dashboard/_components/posts-widget.tsx`
- `apps/nextjs/app/(protected)/dashboard/_components/tasks-widget.tsx`
- `apps/nextjs/app/(protected)/dashboard/_components/gallery-widget.tsx`
- `apps/nextjs/app/(protected)/dashboard/_components/messages-widget.tsx`
- `apps/nextjs/app/(protected)/dashboard/_components/calendar-widget.tsx`
- `apps/nextjs/app/(protected)/dashboard/_components/journal-widget.tsx`
- `apps/nextjs/app/(protected)/dashboard/_components/moodboard-widget.tsx`

**Modified files (1):**
- `apps/nextjs/app/page.tsx` — added auth check + redirect to /dashboard

### Change Log

| Change | File | Reason |
|--------|------|--------|
| Created dashboard page | `dashboard/page.tsx` | Task 1 — main page with Suspense grid |
| Created widget skeleton | `_components/widget-skeleton.tsx` | Task 2 — Suspense fallback |
| Created empty state | `_components/widget-empty-state.tsx` | Task 3 — config-driven empty states |
| Created mood widget | `_components/mood-widget.tsx` | Task 4.1 — weekly mood summary |
| Created posts widget | `_components/posts-widget.tsx` | Task 4.2 — recent posts preview |
| Created tasks widget | `_components/tasks-widget.tsx` | Task 4.3 — pending tasks checklist |
| Created gallery widget | `_components/gallery-widget.tsx` | Task 4.4 — 2x2 photo grid |
| Created messages widget | `_components/messages-widget.tsx` | Task 4.5 — recent conversations |
| Created calendar widget | `_components/calendar-widget.tsx` | Task 4.6 — mini month calendar |
| Created journal widget | `_components/journal-widget.tsx` | Task 4.7 — quick-compose form |
| Created moodboard widget | `_components/moodboard-widget.tsx` | Task 4.8 — recent board preview |
| Modified root page | `app/page.tsx` | Task 5 — redirect auth users to dashboard |
| Code review fix: `<img>` → `next/image` | `gallery-widget.tsx`, `moodboard-widget.tsx` | H1 — consistency with codebase pattern |
| Code review fix: error handling | `journal-widget.tsx` | H3 — display error on failed POST |
| Code review fix: month filter | `calendar-widget.tsx` | M3 — filter events by current month prefix |
