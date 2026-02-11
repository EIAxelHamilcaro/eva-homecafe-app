# Story 13.1: Stickers & Badge Collections (Mobile)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **mobile user**,
I want to view my sticker and badge collections with earning criteria and earned/unearned status,
So that I can track my achievements and stay motivated.

## Acceptance Criteria

1. **Given** an authenticated mobile user **When** they navigate to the stickers screen **Then** they see all available stickers fetched from `GET /api/v1/rewards/stickers`, with earned stickers highlighted and unearned ones grayed out, each showing its earning criteria (name, description)

2. **Given** an authenticated mobile user **When** they navigate to the badges/rewards screen **Then** they see all available badges fetched from `GET /api/v1/rewards/badges`, with earned badges highlighted and unearned ones grayed out, each showing its earning criteria

3. **Given** the existing Expo sticker/badge SVG components **When** implementing this story **Then** reuse existing `components/badges/` (BadgeItem, BadgeGrid) and `components/stickers/` (StickerItem) components, adapting them to accept API data

4. **Given** the stickers screen **When** loading data **Then** a loading skeleton is shown; on error, an error state with retry is shown; pull-to-refresh is supported

5. **Given** the badges screen **When** loading data **Then** a loading skeleton is shown; on error, an error state with retry is shown; pull-to-refresh is supported

6. **Given** a sticker or badge that is earned **When** displayed **Then** it shows the `earnedAt` date and is visually distinct (full color, earned indicator)

7. **Given** a sticker or badge that is not yet earned **When** displayed **Then** it is visually muted (grayed out or reduced opacity) and shows the criteria needed to earn it

8. **Given** the dashboard **When** it loads **Then** a rewards widget displays a summary of earned stickers/badges count (e.g., "3/18 stickers, 2/12 badges") with a CTA linking to the collections, or an encouraging empty state if no rewards earned

9. **Given** the existing modal routes (`recompenses` and `stickers`) **When** implementing this story **Then** preserve the existing modal navigation pattern (fade animation, X close button) already registered in the protected layout

## Tasks / Subtasks

- [x] Task 1: Create reward type definitions and query keys (AC: #1, #2, #3)
  - [x] 1.1 Create `types/reward.ts` with `RewardCollectionItemDto`, `RewardCriteria` interfaces matching backend DTOs
  - [x] 1.2 Add `rewardKeys` factory to `lib/api/hooks/query-keys.ts` with keys: `all`, `stickers`, `badges`

- [x] Task 2: Create reward API hooks (AC: #1, #2, #4, #5)
  - [x] 2.1 Create `lib/api/hooks/use-rewards.ts` with:
    - `useStickers()` — `useQuery` fetching `GET /api/v1/rewards/stickers` returning `RewardCollectionItemDto[]`
    - `useBadges()` — `useQuery` fetching `GET /api/v1/rewards/badges` returning `RewardCollectionItemDto[]`
  - [x] 2.2 Both hooks should use `staleTime: 1000 * 60 * 5` (5 min — reward data changes infrequently)

- [x] Task 3: Adapt badge components for API data (AC: #2, #6, #7)
  - [x] 3.1 Update `components/badges/badge-item.tsx` to accept `RewardCollectionItemDto` props (earned status, criteria display)
  - [x] 3.2 Update `components/badges/badge-grid.tsx` to accept `RewardCollectionItemDto[]` data, map API data to badge visual properties (color, type, statusDots derived from earned/criteria)
  - [x] 3.3 Add earned/unearned visual distinction: earned badges at full opacity with earned date, unearned badges at reduced opacity with criteria text

- [x] Task 4: Adapt sticker components for API data (AC: #1, #6, #7)
  - [x] 4.1 Update `components/stickers/sticker-item.tsx` to accept `RewardCollectionItemDto` props
  - [x] 4.2 Create `components/stickers/sticker-grid.tsx` — FlatList grid (similar to badge-grid) to display stickers in a grid with earned/unearned visual states
  - [x] 4.3 Add earned indicator (checkmark, glow, or earned date badge) and unearned muting (grayscale/opacity reduction)

- [x] Task 5: Connect stickers screen to API (AC: #1, #4, #6, #7)
  - [x] 5.1 Update `app/(protected)/stickers.tsx` — replace mock sticker data with `useStickers()` hook
  - [x] 5.2 Add loading skeleton while data fetches
  - [x] 5.3 Add error state with retry button
  - [x] 5.4 Add `RefreshControl` pull-to-refresh
  - [x] 5.5 Display each sticker with earned/unearned state, name, description, and earning criteria

- [x] Task 6: Connect badges screen to API (AC: #2, #5, #6, #7)
  - [x] 6.1 Update `app/(protected)/recompenses.tsx` — replace mock badge data with `useBadges()` hook
  - [x] 6.2 Add loading skeleton while data fetches
  - [x] 6.3 Add error state with retry button
  - [x] 6.4 Add `RefreshControl` pull-to-refresh
  - [x] 6.5 Display each badge with earned/unearned state, name, description, and earning criteria

- [x] Task 7: Create dashboard rewards widget (AC: #8)
  - [x] 7.1 Create `app/(protected)/(tabs)/_components/rewards-widget.tsx` fetching both `useStickers()` and `useBadges()` to show earned counts
  - [x] 7.2 Display summary: "X/Y stickers earned, X/Y badges earned" with progress visual
  - [x] 7.3 Show empty state with encouraging CTA when no rewards earned yet
  - [x] 7.4 Tap navigates to stickers or badges modal
  - [x] 7.5 Add `<RewardsWidget />` to dashboard `index.tsx`

## Dev Notes

### Backend API Contract (Existing — DO NOT modify backend)

The web backend API is fully implemented. The mobile app consumes these endpoints:

| Method | Endpoint | Purpose | Response Shape |
|--------|----------|---------|----------------|
| GET | `/api/v1/rewards/stickers` | Get all stickers with earned status | `RewardCollectionItemDto[]` |
| GET | `/api/v1/rewards/badges` | Get all badges with earned status | `RewardCollectionItemDto[]` |

**RewardCollectionItemDto Structure:**
```typescript
{
  id: string;              // Achievement definition ID
  key: string;             // Unique key like "first-post", "7-day-journal-streak"
  name: string;            // Display name like "First Post!"
  description: string;     // Full description of how to earn
  criteria: {
    eventType: string;     // e.g., "PostCreated", "MoodRecorded"
    threshold: number;     // e.g., 1, 7, 30
    field: string;         // "count", "journalStreak", "moodStreak", "uniqueMoodCategories"
  };
  iconUrl: string | null;  // Optional icon URL (may be null — use SVG fallback)
  earned: boolean;         // Whether user has earned this reward
  earnedAt: string | null; // ISO 8601 timestamp or null
}
```

**Response notes:**
- Items are sorted: earned items first (by earnedAt DESC), then unearned (by createdAt ASC)
- No pagination — full collection returned (expected <50 items total)
- `iconUrl` may be null for most items — the mobile app should use existing SVG components as visual fallback

### Architecture Compliance

- **API Client**: Use existing `lib/api/client.ts` — NEVER create a new client
- **Auth Tokens**: Handled automatically by `ApiClient` (SecureStore + in-memory cache)
- **TanStack Query**: Follow patterns from `use-gallery.ts`, `use-mood.ts`, `use-moodboards.ts`
- **Query Keys**: Add `rewardKeys` to existing `query-keys.ts` using factory pattern
- **Error Handling**: Use `ApiError` class, display via inline error state or Alert.alert
- **NativeWind Styling**: All styles via Tailwind classNames, not StyleSheet
- **Type Everything**: No `any`, use proper TypeScript interfaces
- **SafeAreaView**: Import from `react-native-safe-area-context` (NOT from `react-native`)

### Existing Components to Reuse or Modify

| Component | Path | Current State | Action |
|-----------|------|---------------|--------|
| BadgeItem | `components/badges/badge-item.tsx` | SVG badge with colors/types (mock data) | **Modify** — add earned/unearned visual state, accept API data |
| BadgeGrid | `components/badges/badge-grid.tsx` | FlatList 2-column grid | **Modify** — accept `RewardCollectionItemDto[]`, map to BadgeItem props |
| StickerItem | `components/stickers/sticker-item.tsx` | SVG sticker with 11 types | **Modify** — add earned/unearned visual state, accept API data |
| Recompenses Screen | `app/(protected)/recompenses.tsx` | Modal with mock badge data (18 items) | **Modify** — replace mock with `useBadges()` hook |
| Stickers Screen | `app/(protected)/stickers.tsx` | Modal with mock sticker types | **Modify** — replace mock with `useStickers()` hook |
| Protected Layout | `app/(protected)/_layout.tsx` | `recompenses` and `stickers` routes registered as modals | **No change** — routes already registered |
| Dashboard Index | `app/(protected)/(tabs)/index.tsx` | 8 widgets displayed | **Modify** — add `<RewardsWidget />` |
| Query Keys | `lib/api/hooks/query-keys.ts` | 15 key factories | **Modify** — add `rewardKeys` |

### Data Mapping: API → Existing SVG Components

**Critical design decision:** The existing SVG components (`BadgeItem`, `StickerItem`) use hardcoded visual types (badge colors like "orange"/"pink", sticker types like "bubble_tea"/"coffee_cup"). The API returns `key` strings like "first-post" or "7-day-journal-streak".

**Recommended mapping approach:**
1. Create a `STICKER_VISUAL_MAP` constant that maps `key` → `StickerType` (e.g., `"first-post" → "envelope_heart"`, `"mood-streak-7" → "heart_face"`)
2. Create a `BADGE_VISUAL_MAP` constant that maps `key` → `{ color, type }` (e.g., `"7-day-journal" → { color: "orange", type: "7_JOURS" }`)
3. Use a fallback visual for unknown keys (new achievements added later)
4. Keep the mapping in a dedicated file: `lib/constants/reward-visuals.ts`

**Available StickerTypes (11):**
`bubble_tea`, `envelope_heart`, `coffee_cup`, `notebook`, `heart_face`, `cloud_happy`, `cloud_sad`, `sparkles`, `tape_green`, `tape_yellow`, `tape_blue`

**Available BadgeColors (5):**
`orange`, `pink`, `blue`, `purple`, `yellow`

**Available BadgeTypes (3):**
`7_JOURS`, `14_JOURS`, `1_MOIS`

### Existing Badge Mock Data Structure (to be replaced)

```typescript
// Current mock in recompenses.tsx — 18 items
const BADGES: BadgeData[] = [
  { id: "1", color: "orange", type: "7_JOURS", statusDots: ["green", "orange", "pink"] },
  // ... 17 more items
];
```

### Existing Sticker Mock Data Structure (to be replaced)

```typescript
// Current mock in stickers.tsx — 11 sticker types
const stickerTypes: StickerType[] = [
  "bubble_tea", "envelope_heart", "coffee_cup", "notebook",
  "heart_face", "cloud_happy", "cloud_sad", "sparkles",
  "tape_green", "tape_yellow", "tape_blue",
];
```

### New Files to Create

```
apps/expo/
├── types/
│   └── reward.ts                              # Reward type definitions
├── lib/
│   ├── api/hooks/
│   │   └── use-rewards.ts                     # Stickers + Badges TanStack Query hooks
│   └── constants/
│       └── reward-visuals.ts                  # API key → SVG visual mapping
└── app/(protected)/
    └── (tabs)/_components/
        └── rewards-widget.tsx                 # Dashboard rewards summary widget
```

Plus modifications to existing:
- `lib/api/hooks/query-keys.ts` — add `rewardKeys` factory
- `components/badges/badge-item.tsx` — add earned/unearned visual state
- `components/badges/badge-grid.tsx` — accept API data array
- `components/stickers/sticker-item.tsx` — add earned/unearned visual state
- `components/stickers/sticker-grid.tsx` — new grid component for stickers
- `app/(protected)/recompenses.tsx` — replace mock with API data
- `app/(protected)/stickers.tsx` — replace mock with API data
- `app/(protected)/(tabs)/index.tsx` — add `<RewardsWidget />`

### Key Implementation Patterns (from stories 10.1–12.2)

**Query key factory pattern:**
```typescript
export const rewardKeys = {
  all: ["rewards"] as const,
  stickers: () => [...rewardKeys.all, "stickers"] as const,
  badges: () => [...rewardKeys.all, "badges"] as const,
};
```

**Query hook pattern:**
```typescript
export function useStickers() {
  return useQuery({
    queryKey: rewardKeys.stickers(),
    queryFn: () => api.get<RewardCollectionItemDto[]>("/api/v1/rewards/stickers"),
    staleTime: 1000 * 60 * 5, // 5 min — rewards change infrequently
  });
}

export function useBadges() {
  return useQuery({
    queryKey: rewardKeys.badges(),
    queryFn: () => api.get<RewardCollectionItemDto[]>("/api/v1/rewards/badges"),
    staleTime: 1000 * 60 * 5,
  });
}
```

**Visual mapping pattern:**
```typescript
// lib/constants/reward-visuals.ts
import type { StickerType } from "@/components/stickers/sticker-item";
import type { BadgeColor, BadgeType } from "@/components/badges/badge-item";

export const STICKER_VISUAL_MAP: Record<string, StickerType> = {
  "first-post": "envelope_heart",
  "mood-streak-7": "heart_face",
  "photo-upload-10": "sparkles",
  // ... map all known achievement keys
};

export const BADGE_VISUAL_MAP: Record<string, { color: BadgeColor; type: BadgeType }> = {
  "journal-streak-7": { color: "orange", type: "7_JOURS" },
  "journal-streak-14": { color: "pink", type: "14_JOURS" },
  "journal-streak-30": { color: "purple", type: "1_MOIS" },
  // ... map all known badge keys
};

export const DEFAULT_STICKER_VISUAL: StickerType = "sparkles";
export const DEFAULT_BADGE_VISUAL = { color: "blue" as BadgeColor, type: "7_JOURS" as BadgeType };
```

**Earned/unearned visual pattern:**
```typescript
// In component
<View className={cn("items-center", !earned && "opacity-40")}>
  <BadgeItem color={visual.color} type={visual.type} size={80} />
  {earned && (
    <View className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
      <Check size={12} color="white" />
    </View>
  )}
  <Text className="text-sm font-medium mt-2">{name}</Text>
  <Text className="text-xs text-gray-500">{earned ? formatDate(earnedAt) : description}</Text>
</View>
```

### Library Versions (Already Installed — DO NOT upgrade or install new)

| Library | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | 5.67.3 | Server state management |
| `expo-router` | 6.0.21 | File-based routing |
| `nativewind` | 4.1.23 | Tailwind CSS for RN |
| `react-native-svg` | (installed) | SVG rendering for stickers/badges |
| `lucide-react-native` | (installed) | Icons (Check, Star, etc.) |

### Critical Guardrails

1. **DO NOT modify any backend code** — all reward APIs are implemented and working
2. **DO NOT install new libraries** — everything needed (SVG, icons, TanStack Query) is installed
3. **DO NOT remove existing SVG components** — they are the visual assets for stickers/badges
4. **Preserve modal navigation** — `recompenses` and `stickers` routes are already registered as fade modals in `_layout.tsx`
5. **Map API keys to SVG visuals** — create a mapping file, don't try to generate SVGs from API data
6. **Handle null iconUrl** — most achievements won't have iconUrl. Use the existing SVG components as primary visuals
7. **No pagination needed** — rewards endpoints return full collections (<50 items)
8. **Use `useQuery` (not `useInfiniteQuery`)** — no pagination, full dataset returned
9. **Follow NativeWind styling** — all styles via Tailwind classNames, not StyleSheet
10. **Type everything** — no `any`, use proper TypeScript interfaces
11. **SafeAreaView** — import from `react-native-safe-area-context` (NOT from `react-native`)
12. **Alert feedback** — show Alert.alert on errors (learned from previous stories code review)
13. **FlatList for grids** — use FlatList with numColumns for virtualized rendering (NOT ScrollView)

### Previous Story Intelligence (12.2 — Moodboard Management Mobile)

**Key Learnings:**
- SafeAreaView MUST be imported from `react-native-safe-area-context`
- Use FlatList for virtualized lists (not ScrollView)
- Alert.alert for error feedback (not showToast)
- Cross-platform Modal+TextInput for user input (Alert.prompt is iOS-only)
- Loading skeleton + error state + pull-to-refresh on every data screen
- Code review catches: always add loading/error/empty states

**Code Review Patterns to Follow (avoid repeating previous issues):**
- M1: Use `FlatList` for virtualized rendering (not `ScrollView` for list data)
- M2: Use `Alert.alert` for error feedback
- M3: Add loading skeleton, error state with retry, pull-to-refresh on every screen

### Git Intelligence (Recent Commits)

```
67a8128 docs: add epic 12 retrospective and update sprint status
31c4761 feat(expo): implement stories 12.1 & 12.2 — photo gallery & moodboard management mobile with code review fixes
bb749ca docs: add epic 11 retrospective and update sprint status
5bd71dd feat(expo): implement story 11.2 — organisation todo, kanban, timeline mobile with code review fixes
b5c5778 feat(expo): implement story 11.1 — mood tracking mobile with code review fixes
```

**Pattern**: All mobile stories follow same structure — create types, create hooks, connect screen, connect dashboard widget. Commit format: `feat(expo): implement story X.Y — description with code review fixes`.

### Project Structure Notes

- Alignment with monorepo: Mobile app at `apps/expo/`, shares no code with `apps/nextjs/` except `packages/`
- API hooks are mobile-specific — web uses Server Actions, mobile uses TanStack Query
- Protected layout at `app/(protected)/_layout.tsx` already has `recompenses` and `stickers` routes registered as modals with fade animation
- Dashboard widgets at `app/(protected)/(tabs)/_components/`
- Sticker modal at `app/(protected)/stickers.tsx`, Badge modal at `app/(protected)/recompenses.tsx`
- Badge SVG components at `components/badges/`, Sticker SVG at `components/stickers/`

### Gamification Backend Context

The reward system is event-driven:
- Domain events (PostCreated, MoodRecorded, PhotoUploaded, etc.) trigger `GamificationHandler`
- `EvaluateAchievementUseCase` checks criteria and awards rewards automatically
- New rewards generate notifications
- Mobile app does NOT trigger rewards directly — it only reads the collections
- The mobile app should invalidate reward queries when navigating to the collections screen (to pick up newly earned rewards)

**Achievement criteria types:**
- **Count-based**: `PostCreated` (count), `MoodRecorded` (count), `PhotoUploaded` (count)
- **Streak-based**: `journalStreak` (consecutive days), `moodStreak` (consecutive days)
- **Diversity-based**: `uniqueMoodCategories` (distinct categories used)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 13: Story 13.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Gamification — Event-Driven Achievement Engine]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/implementation-artifacts/12-2-moodboard-management-mobile.md — Previous story learnings]
- [Source: apps/nextjs/src/domain/reward/ — UserReward aggregate, AchievementType/Criteria VOs, events]
- [Source: apps/nextjs/src/application/use-cases/reward/evaluate-achievement.use-case.ts — Achievement evaluation logic]
- [Source: apps/nextjs/src/application/dto/reward/evaluate-achievement.dto.ts — DTO schemas]
- [Source: apps/nextjs/src/adapters/controllers/reward/reward.controller.ts — getStickerCollection, getBadgeCollection controllers]
- [Source: apps/nextjs/src/adapters/queries/reward-collection.query.ts — getUserStickerCollection, getUserBadgeCollection queries]
- [Source: apps/nextjs/src/adapters/queries/achievement.query.ts — Streak/count query functions]
- [Source: apps/nextjs/src/application/event-handlers/gamification.handler.ts — Event-driven reward evaluation]
- [Source: packages/drizzle/src/schema/reward.ts — achievement_definition + user_reward tables]
- [Source: apps/expo/components/badges/badge-item.tsx — SVG badge component (5 colors, 3 types)]
- [Source: apps/expo/components/badges/badge-grid.tsx — FlatList badge grid]
- [Source: apps/expo/components/stickers/sticker-item.tsx — SVG sticker component (11 types)]
- [Source: apps/expo/app/(protected)/recompenses.tsx — Badge modal screen (mock data)]
- [Source: apps/expo/app/(protected)/stickers.tsx — Sticker modal screen (mock data)]
- [Source: apps/expo/app/(protected)/_layout.tsx — Modal routes already registered]
- [Source: apps/expo/app/(protected)/(tabs)/index.tsx — Dashboard with widgets]
- [Source: apps/expo/lib/api/hooks/query-keys.ts — Query key factory pattern]
- [Source: apps/expo/lib/api/client.ts — ApiClient]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — clean implementation, no debug issues encountered.

### Completion Notes List

- Task 1: Created `types/reward.ts` with `RewardCollectionItemDto` and `RewardCriteria` interfaces matching backend DTO structure. Added `rewardKeys` factory to `query-keys.ts` following existing pattern.
- Task 2: Created `use-rewards.ts` with `useStickers()` and `useBadges()` hooks using `useQuery` with 5min staleTime. Follows `use-gallery.ts` pattern.
- Task 3: Updated `badge-item.tsx` with optional `earned`, `label`, `subtitle` props. Unearned badges render at `opacity-40`. Updated `badge-grid.tsx` to accept `RewardCollectionItemDto[]` and map API keys to SVG visuals via `reward-visuals.ts`. Added pull-to-refresh support.
- Task 4: Updated `sticker-item.tsx` with optional `earned`, `label`, `subtitle` props. Created `sticker-grid.tsx` as 3-column FlatList grid with refresh support. Unearned stickers render at `opacity-40`.
- Task 5: Replaced mock data in `stickers.tsx` with `useStickers()` hook. Added SafeAreaView from correct import, loading indicator, error state with retry, pull-to-refresh, earned/unearned display.
- Task 6: Replaced mock data in `recompenses.tsx` with `useBadges()` hook. Same pattern as stickers — loading, error, retry, pull-to-refresh.
- Task 7: Created `rewards-widget.tsx` dashboard widget showing "X/Y stickers, X/Y badges" with Star/Trophy icons. Empty state with encouraging CTA. Taps navigate to respective modals. Added to dashboard index.
- Created `lib/constants/reward-visuals.ts` mapping all 19 achievement keys (11 stickers, 8 badges) to SVG component visual properties with fallback defaults.

### File List

New files:
- apps/expo/types/reward.ts
- apps/expo/lib/api/hooks/use-rewards.ts
- apps/expo/lib/constants/reward-visuals.ts
- apps/expo/components/stickers/sticker-grid.tsx
- apps/expo/app/(protected)/(tabs)/_components/rewards-widget.tsx

Modified files:
- apps/expo/lib/api/hooks/query-keys.ts
- apps/expo/components/badges/badge-item.tsx
- apps/expo/components/badges/badge-grid.tsx
- apps/expo/components/stickers/sticker-item.tsx
- apps/expo/app/(protected)/stickers.tsx
- apps/expo/app/(protected)/recompenses.tsx
- apps/expo/app/(protected)/(tabs)/index.tsx
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/13-1-stickers-and-badge-collections-mobile.md

## Senior Developer Review (AI)

**Reviewer:** Axel | **Date:** 2026-02-11 | **Outcome:** Approved with fixes applied

**Issues Found:** 3 High, 2 Medium, 2 Low — **All fixed**

| # | Severity | Issue | Fix Applied |
|---|----------|-------|-------------|
| H1 | HIGH | Loading skeleton was ActivityIndicator (AC#4/#5) | Replaced with placeholder skeleton grids in stickers.tsx and recompenses.tsx |
| H2 | HIGH | No earned indicator on earned items (AC#6) | Added green checkmark overlay to BadgeItem and StickerItem |
| H3 | HIGH | Missing query invalidation on screen focus | Added `refetchOnMount: 'always'` to both hooks |
| M1 | MEDIUM | Badge visual mapping semantically misleading | Added displayNumber/displayUnit overrides to BadgeItem + visual map |
| M2 | MEDIUM | Hardcoded close button icon color #3D2E2E | Replaced with `colors.foreground` reference |
| L1 | LOW | Dead code: BadgeData interface in badge-grid.tsx | Removed unused interface and export |
| L2 | LOW | Unnecessary re-export of rewardKeys in use-rewards.ts | Removed re-export |

## Change Log

- 2026-02-11: Code review fixes — replaced ActivityIndicator with loading skeletons, added earned checkmark indicators, added refetchOnMount:'always' for fresh data on modal open, fixed badge display labels for non-streak achievements, replaced hardcoded icon colors with theme reference, removed dead code.
- 2026-02-11: Initial implementation of Story 13.1 — Stickers & Badge Collections Mobile. Created reward type definitions, TanStack Query hooks, visual mapping constants, sticker grid component, rewards dashboard widget. Adapted badge/sticker SVG components for earned/unearned API states. Connected stickers and badges screens to real API endpoints with loading, error, pull-to-refresh states. Added rewards summary widget to dashboard.
