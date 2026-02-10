# Story 11.1: Mood Tracking (Mobile)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **mobile user**,
I want to record my daily mood and view mood charts from my phone,
So that I can track my emotional patterns on the go.

## Acceptance Criteria

1. **Given** an authenticated mobile user **When** they open the mood tracker screen **Then** they see 9 mood categories (calme, enervement, excitation, anxiete, tristesse, bonheur, ennui, nervosite, productivite) with an intensity slider, with today's mood pre-loaded if already recorded via `GET /api/v1/mood`

2. **Given** an authenticated mobile user who selects a mood category and intensity **When** they submit the mood check-in **Then** the mood is persisted via `POST /api/v1/mood` with `{ category, intensity }` and the UI updates to reflect the saved mood

3. **Given** an authenticated mobile user with mood entries **When** they view the weekly mood grid **Then** they see mood check-ins per day of the current week, fetched from `GET /api/v1/mood/week`

4. **Given** an authenticated mobile user with mood entries spanning multiple weeks **When** they view the weekly line chart **Then** they see a line chart rendered with victory-native connected to real API data from `GET /api/v1/mood/stats?period=week`

5. **Given** an authenticated mobile user with mood entries spanning months **When** they view the 6-month bar chart **Then** they see a bar chart with mood trends from `GET /api/v1/mood/trends`

6. **Given** an authenticated mobile user **When** they view the mood legend **Then** they see all 9 mood categories with associated colors (existing MoodLegend component — no change needed)

7. **Given** the existing Expo mood UI components **When** implementing this story **Then** replace mock data in `components/moodboard/` and `app/(protected)/moodboard/index.tsx` with TanStack Query hooks calling the mood API

8. **Given** an authenticated mobile user on the dashboard **When** the mood widget loads **Then** it shows today's mood status fetched from the API (or empty state if none)

## Tasks / Subtasks

- [x] Task 1: Create mood type definitions and query keys (AC: #1, #7)
  - [x] 1.1 Create `types/mood.ts` with `MoodCategory`, `MoodEntry`, `TodayMoodResponse`, `MoodWeekResponse`, `MoodStatsResponse`, `MoodTrendsResponse` interfaces matching backend DTOs
  - [x] 1.2 Add `moodKeys` factory to `lib/api/hooks/query-keys.ts` with keys: `all`, `today`, `week`, `stats(period)`, `trends`

- [x] Task 2: Create TanStack Query hooks for mood API (AC: #1, #2, #3, #4, #5)
  - [x] 2.1 Create `lib/api/hooks/use-mood.ts` with:
    - `useTodayMood()` — `useQuery` fetching `GET /api/v1/mood`
    - `useMoodWeek()` — `useQuery` fetching `GET /api/v1/mood/week`
    - `useMoodStats(period)` — `useQuery` fetching `GET /api/v1/mood/stats?period=week|6months`
    - `useMoodTrends()` — `useQuery` fetching `GET /api/v1/mood/trends`
    - `useRecordMood()` — `useMutation` posting to `POST /api/v1/mood` with `{ category, intensity }`, invalidating `moodKeys.all` on success

- [x] Task 3: Connect moodboard screen to real API (AC: #1, #2, #3, #4, #5, #6, #7)
  - [x] 3.1 Replace `MOCK_WEEK_MOODS` in `app/(protected)/moodboard/index.tsx` with `useMoodWeek()` data, mapping `{ date, dayOfWeek, category, intensity }` to `DayMood[]` format expected by `MoodGrid`
  - [x] 3.2 Replace `MOCK_WEEKLY_CHART_DATA` with `useMoodWeek()` data, mapping entries to `WeeklyDataPoint[]` format expected by `MoodLineChart`
  - [x] 3.3 Replace `MOCK_MONTHLY_CHART_DATA` with `useMoodTrends()` data, mapping `months[]` to `MonthlyDataPoint[]` format expected by `MoodBarChart`
  - [x] 3.4 Wire `MoodSlider` validate button to `useRecordMood()` mutation with selected category + intensity
  - [x] 3.5 Pre-load today's mood via `useTodayMood()` — if exists, set MoodSlider's initial value and selected mood category
  - [x] 3.6 Add loading skeletons while data fetches, error states with retry
  - [x] 3.7 Add pull-to-refresh to refetch all mood data

- [x] Task 4: Connect dashboard mood widget to real API (AC: #8)
  - [x] 4.1 Replace static emoji buttons in `app/(protected)/(tabs)/_components/mood-widget.tsx` with `useTodayMood()` data
  - [x] 4.2 Show today's recorded mood category + intensity if exists, or empty state with "Record your mood" CTA linking to `/moodboard`

## Dev Notes

### Backend API Contract (Existing -- DO NOT modify backend)

The web backend API is fully implemented. The mobile app consumes these endpoints:

| Method | Endpoint | Purpose | Request Body | Response Shape |
|--------|----------|---------|-------------|----------------|
| GET | `/api/v1/mood` | Get today's mood | — | `{ id, category, intensity, createdAt } \| null` |
| POST | `/api/v1/mood` | Record/update mood | `{ category, intensity }` | `{ id, userId, category, intensity, createdAt, isUpdate }` |
| GET | `/api/v1/mood/week` | Get current week entries | — | `{ entries: [{ date, dayOfWeek, category, intensity }] }` |
| GET | `/api/v1/mood/stats?period=week\|6months` | Get mood statistics | — | `{ categoryDistribution: [{ category, count, percentage }], averageIntensity, totalEntries, dominantMood }` |
| GET | `/api/v1/mood/trends` | Get 6-month trends | — | `{ months: [{ month, dominantCategory, averageIntensity, entryCount }] }` |

**Valid Mood Categories:** `calme`, `enervement`, `excitation`, `anxiete`, `tristesse`, `bonheur`, `ennui`, `nervosite`, `productivite`

**Intensity Range:** 1-10 (integer)

**Record Mood Behavior:** If user already recorded today, the existing entry is updated (`isUpdate: true`). Otherwise, a new entry is created (`isUpdate: false`, status 201).

### Architecture Compliance

- **API Client**: Use existing `lib/api/client.ts` — NEVER create a new client
- **Auth Tokens**: Handled automatically by `ApiClient` (SecureStore + in-memory cache)
- **TanStack Query**: Follow patterns from `use-journal.ts` and `use-posts.ts`
- **Query Keys**: Add `moodKeys` to existing `query-keys.ts` using factory pattern
- **Error Handling**: Use `ApiError` class, display via toast or inline error
- **NativeWind Styling**: All styles via Tailwind classNames, not StyleSheet
- **Type Everything**: No `any`, use proper TypeScript interfaces
- **SafeAreaView**: Import from `react-native-safe-area-context` (NOT from `react-native`)

### Existing Components to Reuse (DO NOT recreate)

| Component | Path | Purpose | What to Change |
|-----------|------|---------|----------------|
| `MoodSlider` | `components/moodboard/mood-slider.tsx` | Intensity slider with validate button | Wire `onValidate` to `useRecordMood()` mutation |
| `MoodGrid` | `components/moodboard/mood-grid.tsx` | 7-day weekly mood grid (L-D) | Replace local state with `useMoodWeek()` data |
| `MoodLegend` | `components/moodboard/mood-legend.tsx` | 9 mood categories with colors | **No change needed** — static display |
| `MoodLineChart` | `components/moodboard/mood-chart.tsx` | Weekly line chart (victory-native) | Replace mock data with `useMoodStats("week")` |
| `MoodBarChart` | `components/moodboard/mood-chart.tsx` | Monthly bar chart (victory-native) | Replace mock data with `useMoodTrends()` |
| `YearTrackerFull` | `components/moodboard/year-tracker.tsx` | 365-day year grid | **Phase 2** — no year endpoint exists yet |

### Existing Screen to Modify (replace mock data)

| Screen | Path | Current State | Action |
|--------|------|---------------|--------|
| Moodboard Main | `app/(protected)/moodboard/index.tsx` | `MOCK_WEEK_MOODS`, `MOCK_WEEKLY_CHART_DATA`, `MOCK_MONTHLY_CHART_DATA` | Replace all mock data with API hooks |
| Year Tracker | `app/(protected)/moodboard/tracker.tsx` | `generateMockYearData()` | **Leave as-is** — no year API endpoint exists |
| Dashboard Mood Widget | `app/(protected)/(tabs)/_components/mood-widget.tsx` | Static 5 emoji buttons | Replace with `useTodayMood()` data |

### Data Mapping: Backend DTO → Component Props

**MoodWeek → MoodGrid:**
```typescript
// Backend: { entries: [{ date: "2026-02-10", dayOfWeek: "Monday", category: "bonheur", intensity: 7 }] }
// Component expects: DayMood[] = [{ day: "L", mood: "bonheur" | null }]
const mapWeekToGrid = (entries: MoodWeekEntry[]): DayMood[] => {
  const dayMap: Record<string, DayOfWeek> = {
    Monday: "L", Tuesday: "M", Wednesday: "Me",
    Thursday: "J", Friday: "V", Saturday: "S", Sunday: "D"
  };
  return ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(day => {
    const entry = entries.find(e => e.dayOfWeek === day);
    return { day: dayMap[day], mood: entry?.category ?? null };
  });
};
```

**MoodStats → MoodLineChart:**
```typescript
// Backend: { categoryDistribution: [{ category, count, percentage }], averageIntensity, totalEntries, dominantMood }
// Component expects: WeeklyDataPoint[] = [{ day: 1-7, value: number, mood?: MoodType }]
// NOTE: The stats endpoint gives category distribution, NOT daily points.
// For the weekly chart, use /mood/week entries directly:
const mapWeekToChart = (entries: MoodWeekEntry[]): WeeklyDataPoint[] => {
  return entries.map((e, i) => ({
    day: i + 1,
    value: e.intensity,
    mood: e.category as MoodType,
  }));
};
```

**MoodTrends → MoodBarChart:**
```typescript
// Backend: { months: [{ month: "2026-01", dominantCategory: "bonheur", averageIntensity: 6.5, entryCount: 15 }] }
// Component expects: MonthlyDataPoint[] = [{ month: 1-6, value: number, mood?: MoodType }]
const mapTrendsToChart = (months: MoodTrendsMonth[]): MonthlyDataPoint[] => {
  return months.map((m, i) => ({
    month: i + 1,
    value: m.averageIntensity,
    mood: m.dominantCategory as MoodType,
  }));
};
```

### New Files to Create

```
apps/expo/
├── types/
│   └── mood.ts                          # Mood type definitions
└── lib/api/hooks/
    └── use-mood.ts                      # All mood TanStack Query hooks
```

Plus additions to existing:
- `lib/api/hooks/query-keys.ts` — add `moodKeys` factory

### Key Implementation Patterns (from story 10.1/10.2)

**Query key factory pattern:**
```typescript
export const moodKeys = {
  all: ["mood"] as const,
  today: () => [...moodKeys.all, "today"] as const,
  week: () => [...moodKeys.all, "week"] as const,
  stats: (period: string) => [...moodKeys.all, "stats", { period }] as const,
  trends: () => [...moodKeys.all, "trends"] as const,
};
```

**Query hook pattern (follow use-journal.ts):**
```typescript
export function useTodayMood() {
  return useQuery({
    queryKey: moodKeys.today(),
    queryFn: () => api.get<TodayMoodResponse>("/api/v1/mood"),
    staleTime: 1000 * 60, // 1 min
  });
}
```

**Mutation hook pattern:**
```typescript
export function useRecordMood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { category: string; intensity: number }) =>
      api.post<RecordMoodResponse>("/api/v1/mood", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodKeys.all });
    },
  });
}
```

### Library Versions (Already Installed -- DO NOT upgrade)

| Library | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | 5.67.3 | Server state management |
| `victory-native` | 41.20.2 | Line/bar charts |
| `@shopify/react-native-skia` | 2.4.14 | Chart rendering engine |
| `react-native-calendars` | 1.1313.0 | Calendar (not used in this story) |
| `react-native-draggable-flatlist` | 4.0.3 | Drag & drop (not used in this story) |
| `expo-router` | 6.0.21 | File-based routing |
| `nativewind` | 4.1.23 | Tailwind CSS for RN |

### Critical Guardrails

1. **DO NOT modify any backend code** — all mood APIs are implemented and working
2. **DO NOT recreate UI components** — reuse existing MoodSlider, MoodGrid, MoodLegend, MoodChart components
3. **DO NOT install new libraries** — everything needed is already installed
4. **DO NOT use Redux or Zustand** — use TanStack Query for server state, useState for local UI state
5. **Follow NativeWind styling** — all styles via Tailwind classNames, not StyleSheet
6. **Type everything** — no `any`, use proper TypeScript interfaces
7. **Handle loading and error states** — skeleton loaders, empty states, toast on error
8. **Invalidate caches on mutations** — `useRecordMood()` must invalidate `moodKeys.all` on success
9. **SafeAreaView** — import from `react-native-safe-area-context` (NOT from `react-native`)
10. **YearTracker stays mock** — no backend endpoint exists for year-long data; leave `tracker.tsx` as-is with `generateMockYearData()`
11. **MoodGrid category → MoodType mapping** — backend returns string categories (`"bonheur"`, `"calme"`) that map directly to `MoodType` enum in `MoodLegend`; cast safely
12. **Intensity slider range** — backend expects 1-10 integer; ensure MoodSlider's `min`/`max`/`step` match this range

### Project Structure Notes

- Alignment with monorepo: Mobile app at `apps/expo/`, shares no code with `apps/nextjs/` except `packages/`
- API hooks are mobile-specific — web uses Server Actions, mobile uses TanStack Query
- Navigation: Moodboard screen is at `app/(protected)/moodboard/index.tsx` (tab screen)
- Protected layout at `app/(protected)/_layout.tsx` handles auth guard
- Mood components are in `components/moodboard/` (not `components/mood/`)

### Previous Story Intelligence (10.1 & 10.2)

**Key Learnings:**
- SafeAreaView MUST be imported from `react-native-safe-area-context`, NOT from `react-native`
- Like handlers need local optimistic state for instant UI feedback — apply same pattern for mood recording
- All hooks should invalidate related keys on mutation success
- Follow `useInfiniteQuery` for paginated lists, `useQuery` for single resources
- `pnpm fix` may show 2 pre-existing warnings (console + dangerouslySetInnerHTML) — these are expected

**Code Review Fixes from 10.1/10.2 (avoid repeating):**
- H1: Mutation handlers must actually call the mutation (not just local state toggle)
- H4: SafeAreaView import consistency across all screens
- M1-M3: Extract shared utilities, don't duplicate across screens
- Bonus: Ensure correct data format sent to API (strings vs enums)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 11: Story 11.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture — Mood Tracker]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Client Strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/implementation-artifacts/10-2-social-feed-and-reactions-mobile.md — Previous story learnings]
- [Source: apps/nextjs/src/adapters/controllers/mood/mood.controller.ts — Backend mood controller]
- [Source: apps/nextjs/src/application/dto/mood/record-mood.dto.ts — Record mood DTO]
- [Source: apps/nextjs/src/application/dto/mood/get-today-mood.dto.ts — Today mood DTO]
- [Source: apps/nextjs/src/application/dto/mood/get-mood-week.dto.ts — Week mood DTO]
- [Source: apps/nextjs/src/application/dto/mood/get-mood-stats.dto.ts — Mood stats DTO]
- [Source: apps/nextjs/src/application/dto/mood/get-mood-trends.dto.ts — Mood trends DTO]
- [Source: apps/nextjs/src/domain/mood/value-objects/mood-category.vo.ts — 9 valid categories]
- [Source: apps/nextjs/app/api/v1/mood/route.ts — GET today + POST record]
- [Source: apps/nextjs/app/api/v1/mood/week/route.ts — GET week entries]
- [Source: apps/nextjs/app/api/v1/mood/stats/route.ts — GET mood stats]
- [Source: apps/nextjs/app/api/v1/mood/trends/route.ts — GET 6-month trends]
- [Source: apps/expo/components/moodboard/ — All mood UI components]
- [Source: apps/expo/app/(protected)/moodboard/index.tsx — Current screen with mock data]
- [Source: apps/expo/app/(protected)/(tabs)/_components/mood-widget.tsx — Dashboard widget]
- [Source: apps/expo/lib/api/client.ts — Base API client]
- [Source: apps/expo/lib/api/hooks/query-keys.ts — Query key factory pattern]
- [Source: apps/expo/lib/api/hooks/use-journal.ts — Reference query hook pattern]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — clean implementation with no blocking issues.

### Completion Notes List

- Task 1: Created `types/mood.ts` with 8 TypeScript interfaces matching all backend mood DTOs. Added `moodKeys` factory to `query-keys.ts` with `all`, `today`, `week`, `stats(period)`, `trends` keys.
- Task 2: Created `use-mood.ts` with 5 hooks: `useTodayMood()` (1min staleTime), `useMoodWeek()` (1min), `useMoodStats(period)` (5min), `useMoodTrends()` (5min), `useRecordMood()` (mutation with `moodKeys.all` invalidation).
- Task 3: Replaced all 3 mock data constants in moodboard screen with API hooks. Added 3 mapping functions (`mapWeekToGrid`, `mapWeekToChart`, `mapTrendsToChart`). Added inline mood category picker (9 pressable pills). Wired MoodSlider (min=1, max=10, step=1) to `useRecordMood()` mutation. Pre-loads today's mood via `useEffect`. Added `ActivityIndicator` loading state, error state with retry, `RefreshControl` pull-to-refresh. Charts conditionally render only when data exists.
- Task 4: Replaced static emoji buttons in dashboard mood widget with `useTodayMood()` data. Shows colored mood circle with intensity number and label when mood exists, or "Enregistre ton humeur du jour" CTA when empty. Entire widget is pressable → navigates to `/moodboard`. Uses `MOODS` array from mood-legend for labels (no duplication).
- Note: MoodLegend component unchanged (static display), YearTracker left as-is (no backend endpoint), no backend code modified.

### File List

- `apps/expo/types/mood.ts` (new) — Mood type definitions matching backend DTOs
- `apps/expo/lib/api/hooks/use-mood.ts` (new) — TanStack Query hooks for mood API
- `apps/expo/lib/api/hooks/query-keys.ts` (modified) — Added `moodKeys` factory
- `apps/expo/app/(protected)/moodboard/index.tsx` (modified) — Replaced mock data with API hooks, added category picker, loading/error states, pull-to-refresh, success feedback
- `apps/expo/app/(protected)/(tabs)/_components/mood-widget.tsx` (modified) — Replaced static emojis with useTodayMood() data
- `apps/expo/components/moodboard/mood-grid.tsx` (modified) — Made validate button conditional on onValidate prop

### Change Log

- 2026-02-10: Implemented story 11.1 — Mood Tracking Mobile. Created type definitions, TanStack Query hooks, connected moodboard screen and dashboard widget to real mood API. All mock data replaced with live API calls.
- 2026-02-10: Code review fixes — H1: scaled chart values (×10) to match domain 0-100. H2: added Alert success feedback after mood recording. M1: made MoodGrid validate button conditional. M2: stabilized onRefresh useCallback deps. M3: removed unnecessary as MoodType casts.

## Senior Developer Review (AI)

**Review Date:** 2026-02-10
**Review Outcome:** Changes Requested → Fixed
**Total Action Items:** 7 (2 High, 3 Medium, 2 Low)

### Action Items

- [x] [H1] Chart domain mismatch — intensity values 1-10 scaled ×10 to match chart domain 0-100
- [x] [H2] No success feedback after recording mood — added Alert.alert with update/create confirmation
- [x] [M1] MoodGrid orphan validate button — made conditional on onValidate prop being provided
- [x] [M2] onRefresh useCallback unstable deps — extracted stable refetch functions as deps
- [x] [M3] Unnecessary as MoodType casts — removed (structural typing compatibility confirmed by tsc)
- [ ] [L1] useMoodStats hook is unused dead code — not fixed (may be needed in future stories)
- [ ] [L2] MoodWeekEntry.dayOfWeek typed as string — not fixed (low risk, backend is trusted)
