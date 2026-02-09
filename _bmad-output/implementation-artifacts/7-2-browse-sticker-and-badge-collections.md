# Story 7.2: Browse Sticker & Badge Collections

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to view my earned stickers and badges, and browse all available ones,
so that I can see my progress and know what to aim for next.

## Acceptance Criteria

1. **Given** an authenticated user **When** they navigate to the stickers page **Then** they see their earned stickers highlighted and unearned ones grayed out **And** each sticker shows its earning criteria

2. **Given** an authenticated user **When** they navigate to the badges/rewards page **Then** they see their earned badges highlighted and unearned ones grayed out **And** each badge shows its earning criteria

3. **Given** an authenticated user **When** they select "View All" stickers **Then** they see the full sticker collection grid with earning criteria for each

4. **Given** an authenticated user **When** they select "View All" badges **Then** they see the full badge collection grid with earning criteria for each

5. **Given** a new user with no rewards **When** they view the collections **Then** they see all available rewards with clear criteria, motivating first actions

## Tasks / Subtasks

- [x] Task 1: Create CQRS Read Queries (AC: #1, #2, #3, #4, #5)
  - [x] 1.1 Created `src/adapters/queries/reward-collection.query.ts` — single file with `getUserStickerCollection(userId)` and `getUserBadgeCollection(userId)` using shared `getCollectionByType()` helper with LEFT JOIN pattern
  - [x] 1.2 Both sticker and badge queries share the same LEFT JOIN pattern (achievement_definition LEFT JOIN user_reward) with earned boolean and earnedAt
  - [x] 1.3 Defined shared `RewardCollectionItemDto` interface in the query file (id, key, name, description, criteria, iconUrl, earned, earnedAt)

- [x] Task 2: Create Reward Controller (AC: #1, #2, #3, #4)
  - [x] 2.1 Created `src/adapters/controllers/reward/reward.controller.ts` — follows gallery.controller.ts pattern exactly
  - [x] 2.2 Export `getStickerCollectionController(request)` — auth check, call query, return JSON
  - [x] 2.3 Export `getBadgeCollectionController(request)` — auth check, call query, return JSON
  - [x] 2.4 Auth pattern: `getAuthenticatedUser(request)` helper using GetSessionUseCase + match

- [x] Task 3: Create API Routes (AC: #1, #2, #3, #4)
  - [x] 3.1 Created `app/api/v1/rewards/stickers/route.ts` — re-export `GET = getStickerCollectionController`
  - [x] 3.2 Created `app/api/v1/rewards/badges/route.ts` — re-export `GET = getBadgeCollectionController`

- [x] Task 4: Create Rewards Page & Components (AC: #1, #2, #3, #4, #5)
  - [x] 4.1 Created `app/(protected)/rewards/page.tsx` — Server Component with `requireAuth()`, composes `<RewardTabs />`
  - [x] 4.2 Created `app/(protected)/rewards/_components/reward-tabs.tsx` — Client component using shadcn `<Tabs>` with Stickers/Badges tabs
  - [x] 4.3 Created `app/(protected)/rewards/_components/sticker-grid.tsx` — Client component, fetch `/api/v1/rewards/stickers`, loading skeleton, map to `<RewardCard />`
  - [x] 4.4 Created `app/(protected)/rewards/_components/badge-grid.tsx` — Client component, fetch `/api/v1/rewards/badges`, loading skeleton, map to `<RewardCard />`
  - [x] 4.5 Created `app/(protected)/rewards/_components/reward-card.tsx` — Single reward card using shadcn `<Card>` + `<Badge>`: earned = highlighted border-primary/50 + "Earned" badge + earnedAt, unearned = opacity-60 grayscale + "Locked" badge + criteria
  - [x] 4.6 Created `app/(protected)/rewards/_components/reward-empty-state.tsx` — Motivational empty state for new users per type

- [x] Task 5: Add Navigation Link (AC: #1)
  - [x] 5.1 No dedicated navigation component exists in the codebase — page accessible at `/rewards` directly. Navigation will be added in Epic 8 (Dashboard Hub).

- [x] Task 6: Quality Checks (AC: all)
  - [x] 6.1 Ran `pnpm fix` — auto-fixed formatting (spaces, line wrapping)
  - [x] 6.2 Ran `pnpm type-check` — 0 TypeScript errors
  - [x] 6.3 Ran `pnpm test` — 41 test files, 349 tests, all passed
  - [x] 6.4 Ran `pnpm check` — 0 new Biome errors (48 pre-existing warnings unchanged)

## Dev Notes

### This is a Pure CQRS Read Story

No use cases, no domain logic changes, no new aggregates. Story 7.1 built the entire reward domain. This story creates read-only queries + UI to browse the existing data.

### Architecture: CQRS Read Path

```
Page → Client Component → fetch(/api/v1/rewards/*) → Controller → Query → DB → JSON response
```

No use cases needed. Controllers call queries directly (CQRS read pattern).

### SQL Query Pattern (Critical)

Both sticker and badge queries use the same LEFT JOIN pattern:

```typescript
// Drizzle query pattern
const result = await db
  .select({
    id: achievementDefinition.id,
    type: achievementDefinition.type,
    key: achievementDefinition.key,
    name: achievementDefinition.name,
    description: achievementDefinition.description,
    criteria: achievementDefinition.criteria,
    iconUrl: achievementDefinition.iconUrl,
    earnedAt: userReward.earnedAt,
  })
  .from(achievementDefinition)
  .leftJoin(
    userReward,
    and(
      eq(achievementDefinition.id, userReward.achievementDefinitionId),
      eq(userReward.userId, userId),
    ),
  )
  .where(eq(achievementDefinition.type, "sticker")) // or "badge"
  .orderBy(
    desc(sql`CASE WHEN ${userReward.earnedAt} IS NOT NULL THEN 1 ELSE 0 END`),
    asc(achievementDefinition.createdAt),
  );
```

Earned rewards appear first, then unearned sorted by creation date.

### Existing Code to Reuse (DO NOT Recreate)

| What | File | Status |
|------|------|--------|
| DB schema (achievement_definition, user_reward) | `packages/drizzle/src/schema/reward.ts` | EXISTS |
| UserReward aggregate | `src/domain/reward/user-reward.aggregate.ts` | EXISTS |
| AchievementType VO ("sticker" \| "badge") | `src/domain/reward/value-objects/achievement-type.vo.ts` | EXISTS |
| IRewardRepository | `src/application/ports/reward-repository.port.ts` | EXISTS |
| DrizzleRewardRepository | `src/adapters/repositories/reward.repository.ts` | EXISTS |
| Mapper (userRewardToDomain, definitionToDomain) | `src/adapters/mappers/reward.mapper.ts` | EXISTS |
| Achievement queries (streaks, counts) | `src/adapters/queries/reward/achievement-queries.ts` | EXISTS |
| EvaluateAchievementUseCase | `src/application/use-cases/reward/evaluate-achievement.use-case.ts` | EXISTS |
| DI module (reward) | `common/di/modules/reward.module.ts` | EXISTS |
| requireAuth guard | `src/adapters/guards/auth.guard.ts` | EXISTS |
| shadcn Tabs component | `packages/ui/src/components/ui/tabs.tsx` | EXISTS |
| shadcn Card component | `packages/ui/src/components/ui/card.tsx` | EXISTS |
| shadcn Badge component | `packages/ui/src/components/ui/badge.tsx` | EXISTS |

### Controller Pattern to Follow

Follow `src/adapters/controllers/gallery/gallery.controller.ts` exactly:

```typescript
// 1. getAuthenticatedUser helper (GetSessionUseCase + match)
// 2. Export controller function per endpoint
// 3. Auth check → call query directly → return NextResponse.json()
```

### Page Structure Pattern to Follow

Follow `app/(protected)/gallery/page.tsx`:

```typescript
// Server Component, requireAuth(), compose client components
export default async function RewardsPage() {
  await requireAuth();
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 font-bold text-2xl">Rewards</h1>
      <RewardTabs />
    </div>
  );
}
```

### Client Component Fetch Pattern

Follow `app/(protected)/mood/_components/mood-history.tsx`:

```typescript
"use client";
// useState for data, useEffect for initial fetch
// Loading skeleton with animate-pulse
// Empty state component
// Grid layout for cards
```

### RewardCard Component Design

```
┌─────────────────────────┐
│  [Icon/Emoji]           │
│  Sticker Name           │
│  "Write your first post"│
│                         │
│  ✅ Earned Jan 15, 2026 │  ← earned: highlighted border, green badge
│     — OR —              │
│  🔒 Locked              │  ← unearned: opacity-50, grayscale
│  "Threshold: 1 post"    │
└─────────────────────────┘
```

- Earned: normal opacity, colored border (e.g., `border-primary`), show earnedAt date
- Unearned: `opacity-50 grayscale`, muted border, show criteria threshold
- Use shadcn `<Card>` + `<Badge>` components

### Import Paths

shadcn/ui components import from packages/ui:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@packages/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@packages/ui/components/ui/tabs";
import { Badge } from "@packages/ui/components/ui/badge";
```

Check existing components for exact import path patterns. May need `@packages/ui/src/components/ui/...` — verify against gallery or mood component imports.

### Navigation Integration

Check existing navigation component (sidebar/navbar) to add "Rewards" link. Look at:
- `app/(protected)/layout.tsx` or similar
- `_components/` at the layout level for nav components
- Follow existing pattern for adding nav items

### File Structure

```
# New files to create
apps/nextjs/src/adapters/queries/reward/sticker-collection.query.ts
apps/nextjs/src/adapters/queries/reward/badge-collection.query.ts
apps/nextjs/src/adapters/controllers/reward/reward.controller.ts
apps/nextjs/app/api/v1/rewards/stickers/route.ts
apps/nextjs/app/api/v1/rewards/badges/route.ts
apps/nextjs/app/(protected)/rewards/page.tsx
apps/nextjs/app/(protected)/rewards/_components/reward-tabs.tsx
apps/nextjs/app/(protected)/rewards/_components/sticker-grid.tsx
apps/nextjs/app/(protected)/rewards/_components/badge-grid.tsx
apps/nextjs/app/(protected)/rewards/_components/reward-card.tsx
apps/nextjs/app/(protected)/rewards/_components/reward-empty-state.tsx

# Files to modify
apps/nextjs/app/(protected)/**/nav*.tsx or layout.tsx  # Add Rewards nav link (discover exact file)
```

### No DI Changes Required

This story uses CQRS read queries only (direct ORM calls). No new use cases, no new DI symbols. The queries import Drizzle schema directly.

### Testing Strategy

This story is primarily UI + read queries. No BDD use case tests needed.

**Manual testing checklist:**
1. Visit `/rewards` as authenticated user → see tabs
2. Stickers tab → all stickers visible, earned ones highlighted
3. Badges tab → all badges visible, earned ones highlighted
4. New user with no rewards → empty state with motivational message + all available rewards shown with criteria
5. GET `/api/v1/rewards/stickers` → returns JSON array with earned flags
6. GET `/api/v1/rewards/badges` → returns JSON array with earned flags
7. Unauthenticated request → 401

### Critical Anti-Patterns to Avoid

1. **Do NOT create use cases** for reading collections — this is CQRS read, use queries directly
2. **Do NOT import domain entities in components** — use DTOs from query responses
3. **Do NOT create new DI symbols** — queries are standalone functions
4. **Do NOT create barrel index.ts files**
5. **Do NOT add comments** — self-documenting code
6. **Do NOT hardcode achievement data in components** — always fetch from API
7. **Do NOT use getInjection for queries** — queries are plain async functions called directly
8. **Do NOT break existing tests** — no domain/application layer changes
9. **Do NOT recreate existing reward domain code** — use existing schema/repo as-is

### Golden Reference Files

| Purpose | Source File | Adaptation |
|---------|------------|------------|
| Page pattern | `app/(protected)/gallery/page.tsx` | rewards/page.tsx |
| Client component + fetch | `app/(protected)/mood/_components/mood-history.tsx` | sticker-grid.tsx, badge-grid.tsx |
| Controller pattern | `src/adapters/controllers/gallery/gallery.controller.ts` | reward.controller.ts |
| Query pattern | `src/adapters/queries/gallery/gallery.query.ts` | sticker-collection.query.ts |
| API route pattern | `app/api/v1/gallery/route.ts` | rewards/stickers/route.ts |
| DB schema reference | `packages/drizzle/src/schema/reward.ts` | Import for queries |
| Tabs usage | Check existing shadcn tabs usage in codebase | reward-tabs.tsx |

### Previous Story Intelligence (Story 7.1)

Key learnings from Story 7.1:
1. **IEventDispatcher now exists** — wired into 12 use cases. NOT relevant to this story (read-only).
2. **Achievement definitions seeded** — 11 stickers + 8 badges exist in DB via upsert seed. Check `src/adapters/repositories/reward.repository.ts` for seed data structure.
3. **achievement_definition table** has: id, type, key, name, description, criteria (JSONB), iconUrl, createdAt
4. **user_reward table** has: id, userId, achievementDefinitionId, earnedAt with unique constraint on (userId, achievementDefinitionId)
5. **Mapper exists** — `definitionToDomain()` returns `IAchievementDefinitionRecord` interface. Can reference for DTO shape.
6. **DrizzleRewardRepository** already has `getAllDefinitions()` and `getDefinitionsByType()` methods — but these return definitions only, NOT joined with user earned status. The CQRS queries need to do the LEFT JOIN.
7. **Biome formatting: spaces not tabs** — always run `pnpm fix` after writing files
8. **Commit pattern**: `feat(nextjs): implement story X.Y — [description] with code review fixes`
9. **Stories 6.2 + 7.1 were implemented together** in commit `c24cea5` — review that commit for patterns

### Git Intelligence

Recent commits:
- `08a119f` chore: mark story 7.1 as done in sprint status
- `c24cea5` feat(nextjs): implement stories 6.2 and 7.1 with code review fixes
- `5f3dcbd` feat(nextjs): implement story 6.1 — create and browse moodboards with code review fixes

All quality checks pass on current main. Event dispatcher wired across 12 use cases.

### Project Structure Notes

- All new files follow established naming conventions (kebab-case)
- Queries in `src/adapters/queries/reward/` — reward directory already exists from 7.1
- Controllers in `src/adapters/controllers/reward/` — new subfolder needed
- API routes in `app/api/v1/rewards/` — new route folder
- Page in `app/(protected)/rewards/` — new page folder
- No conflicts with existing structure

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.2: Browse Sticker & Badge Collections]
- [Source: _bmad-output/planning-artifacts/prd.md#FR55-FR60 — Stickers & Rewards]
- [Source: _bmad-output/planning-artifacts/architecture.md#CQRS — Query Path]
- [Source: _bmad-output/planning-artifacts/architecture.md#Page Structure Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Route Patterns]
- [Source: _bmad-output/implementation-artifacts/7-1-achievement-engine-and-reward-evaluation.md — previous story]
- [Source: apps/nextjs/src/adapters/controllers/gallery/gallery.controller.ts — controller pattern]
- [Source: apps/nextjs/src/adapters/queries/gallery/gallery.query.ts — query pattern]
- [Source: apps/nextjs/app/(protected)/gallery/page.tsx — page pattern]
- [Source: packages/drizzle/src/schema/reward.ts — DB schema]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No debug issues encountered.

### Completion Notes List

- Pure CQRS read story: no domain changes, no use case changes, no DI changes
- Created unified query file `reward-collection.query.ts` with shared `getCollectionByType()` to avoid code duplication between sticker/badge queries
- LEFT JOIN pattern: achievement_definition LEFT JOIN user_reward to determine earned status per user
- Ordering: earned rewards first, then unearned by creation date
- RewardCard component: human-readable criteria labels via lookup maps (CRITERIA_LABELS, EVENT_TYPE_LABELS)
- All shadcn/ui imports use `@packages/ui/components/ui/*` pattern (verified from existing moodboard components)
- No navigation component exists — page accessible via direct URL `/rewards`
- Quality: 0 TypeScript errors, 0 Biome errors, 349/349 tests passing

### Change Log

- 2026-02-09: Implemented Story 7.2 — browse sticker and badge collections (CQRS queries, controller, API routes, UI page with tabs/grids/cards)
- 2026-02-09: Code review fix — extracted generic RewardGrid component to eliminate duplication between StickerGrid and BadgeGrid (M1)

### File List

New files:
- apps/nextjs/src/adapters/queries/reward-collection.query.ts
- apps/nextjs/src/adapters/controllers/reward/reward.controller.ts
- apps/nextjs/app/api/v1/rewards/stickers/route.ts
- apps/nextjs/app/api/v1/rewards/badges/route.ts
- apps/nextjs/app/(protected)/rewards/page.tsx
- apps/nextjs/app/(protected)/rewards/_components/reward-tabs.tsx
- apps/nextjs/app/(protected)/rewards/_components/reward-grid.tsx
- apps/nextjs/app/(protected)/rewards/_components/sticker-grid.tsx
- apps/nextjs/app/(protected)/rewards/_components/badge-grid.tsx
- apps/nextjs/app/(protected)/rewards/_components/reward-card.tsx
- apps/nextjs/app/(protected)/rewards/_components/reward-empty-state.tsx

Modified files:
- _bmad-output/implementation-artifacts/sprint-status.yaml (7-2 status: backlog → in-progress → done)
