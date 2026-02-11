# Story 13.2: Dashboard Widgets — Real API Connection (Mobile)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **mobile user**,
I want my dashboard widgets to show real data instead of mock data,
So that I have an accurate overview of all my content.

## Acceptance Criteria

1. **Given** an authenticated mobile user **When** they view the home dashboard **Then** the Messagerie widget displays the real unread notification count fetched from `GET /api/v1/notifications/unread-count`, replacing the hardcoded `MOCK_UNREAD_MESSAGES = 3`

2. **Given** an authenticated mobile user with mood entries **When** they view the Suivi (tracking) widgets **Then** the monthly bar chart displays real 6-month mood trends from `GET /api/v1/mood/trends` (dominant mood intensity per month), replacing `MOCK_MONTHLY_DATA`

3. **Given** an authenticated mobile user with mood entries **When** they view the Suivi widgets **Then** the weekly dot chart displays real mood entries for the current week from `GET /api/v1/mood/week` (intensity per day), replacing `MOCK_WEEKLY_DATA`

4. **Given** an authenticated mobile user **When** they view the Journal widget **Then** it displays the user's current journal streak count fetched from `GET /api/v1/journal/streak`, showing "X jours de suite" or encouraging first entry

5. **Given** an authenticated mobile user with cards that have due dates **When** they view the Calendar widget **Then** it displays today's date plus the count of upcoming events for today fetched from `GET /api/v1/boards/chronology`

6. **Given** a new user with no data **When** they view any updated widget **Then** widgets show appropriate empty states (0 messages, no mood data, no streak, no events) — NOT mock/hardcoded values

7. **Given** any updated widget **When** loading data from the API **Then** a loading state (skeleton or ActivityIndicator) is displayed during fetch, and an error state with retry option is displayed on failure

8. **Given** the dashboard-mock-data.ts file **When** all mock references are removed from widgets **Then** the unused mock constants (`MOCK_UNREAD_MESSAGES`, `MOCK_MONTHLY_DATA`, `MOCK_WEEKLY_DATA`) are deleted from the mock data file (keep `MOCK_GALLERY_IMAGES` and `MOCK_TODO_ITEMS` only if still referenced elsewhere, otherwise delete entire file)

## Tasks / Subtasks

- [x] Task 1: Connect MessagerieWidget to real unread count (AC: #1, #6, #7)
  - [x] 1.1 Import `useUnreadCount()` from `lib/api/hooks/use-notifications.ts` (hook already exists)
  - [x] 1.2 Replace `MOCK_UNREAD_MESSAGES` with `unreadCount` from the hook's `data?.unreadCount`
  - [x] 1.3 Add loading state (subtle, inline — e.g., small ActivityIndicator or skeleton text)
  - [x] 1.4 Handle error gracefully (show widget without count, or "—")
  - [x] 1.5 Show "Aucun message non lu" or hide count line when `unreadCount === 0`

- [x] Task 2: Connect SuiviWidgets monthly chart to real mood trends (AC: #2, #6, #7)
  - [x] 2.1 Import `useMoodTrends()` from `lib/api/hooks/use-mood.ts` (hook already exists)
  - [x] 2.2 Map `MoodTrendsResponse.months[]` to chart data: `{ month: string, value: number }` where value = `averageIntensity` (0-10 scale)
  - [x] 2.3 Replace `MOCK_MONTHLY_DATA` with mapped real data
  - [x] 2.4 Handle empty data: show flat bars or "Pas encore de donnees" message
  - [x] 2.5 Add loading skeleton for the chart area

- [x] Task 3: Connect SuiviWidgets weekly chart to real mood week data (AC: #3, #6, #7)
  - [x] 3.1 Import `useMoodWeek()` from `lib/api/hooks/use-mood.ts` (hook already exists)
  - [x] 3.2 Map `MoodWeekResponse.entries[]` to chart data: `{ day: string, value: number }` where day = first letter of `dayOfWeek` and value = `intensity`
  - [x] 3.3 Handle missing days (not all 7 days may have entries): show dots at 0 or no dot for missing days
  - [x] 3.4 Replace `MOCK_WEEKLY_DATA` with mapped real data
  - [x] 3.5 Add loading skeleton for the chart area

- [x] Task 4: Enhance JournalWidget with streak data (AC: #4, #6, #7)
  - [x] 4.1 Import `useJournalStreak()` from `lib/api/hooks/use-journal-streak.ts` (hook already exists)
  - [x] 4.2 Display streak count below title: "X jours de suite" when `currentStreak > 0`
  - [x] 4.3 Display "Commence ton journal" or keep current "Ecrire une entree" when `currentStreak === 0`
  - [x] 4.4 Optionally show a flame/fire emoji or icon next to streak count for visual emphasis

- [x] Task 5: Enhance CalendarWidget with event count (AC: #5, #6, #7)
  - [x] 5.1 Import `useChronology()` from `lib/api/hooks/use-boards.ts` (hook already exists)
  - [x] 5.2 Count events for today from `ChronologyResponse.eventDates[todayKey]`
  - [x] 5.3 Display event count below date: "X evenement(s) aujourd'hui" when events > 0
  - [x] 5.4 Display "Pas d'evenement" or keep current display when no events today
  - [x] 5.5 Handle loading gracefully (don't block date display)

- [x] Task 6: Clean up mock data file (AC: #8)
  - [x] 6.1 Remove `MOCK_UNREAD_MESSAGES` from `constants/dashboard-mock-data.ts`
  - [x] 6.2 Remove `MOCK_MONTHLY_DATA` from `constants/dashboard-mock-data.ts`
  - [x] 6.3 Remove `MOCK_WEEKLY_DATA` from `constants/dashboard-mock-data.ts`
  - [x] 6.4 Check if `MOCK_GALLERY_IMAGES` and `MOCK_TODO_ITEMS` are still imported anywhere; if not, delete entire file
  - [x] 6.5 Remove any unused imports from widget files after mock data removal

## Dev Notes

### Backend API Contract (Existing — DO NOT modify backend)

All backend APIs are fully implemented. The mobile app consumes these endpoints:

| Method | Endpoint | Purpose | Response Shape | Hook |
|--------|----------|---------|----------------|------|
| GET | `/api/v1/notifications/unread-count` | Unread notification count | `{ unreadCount: number }` | `useUnreadCount()` |
| GET | `/api/v1/mood/trends` | 6-month mood trends | `MoodTrendsResponse` | `useMoodTrends()` |
| GET | `/api/v1/mood/week` | Current week mood entries | `MoodWeekResponse` | `useMoodWeek()` |
| GET | `/api/v1/journal/streak` | Journal streak stats | `StreakResponse` | `useJournalStreak()` |
| GET | `/api/v1/boards/chronology` | Cards with due dates | `ChronologyResponse` | `useChronology()` |

**Response Type Details:**

```typescript
// Notification unread count
{ unreadCount: number }

// MoodTrendsResponse — 6 months of mood data
{
  months: Array<{
    month: string;           // "2026-01", "2026-02", etc.
    dominantCategory: MoodCategory; // "bonheur", "calme", etc.
    averageIntensity: number;  // 0-10 scale
    entryCount: number;
  }>
}

// MoodWeekResponse — current week entries
{
  entries: Array<{
    date: string;            // "2026-02-10"
    dayOfWeek: string;       // "lundi", "mardi", etc.
    category: MoodCategory;
    intensity: number;       // 0-10 scale
  }>
}

// StreakResponse — journal streak
{
  currentStreak: number;     // consecutive days with private posts
  longestStreak: number;
  lastPostDate: string | null;
}

// ChronologyResponse — calendar events
{
  cards: Array<{
    id: string;
    title: string;
    dueDate: string;         // "YYYY-MM-DD"
    isCompleted: boolean;
    boardTitle: string;
    boardType: "todo" | "kanban";
  }>,
  eventDates: {
    [dateKey: string]: {     // e.g., "2026-02-11"
      count: number;
      boards: Array<{ id: string; title: string }>
    }
  }
}
```

### Architecture Compliance

- **API Client**: Use existing `lib/api/client.ts` — NEVER create a new client
- **Auth Tokens**: Handled automatically by `ApiClient` (SecureStore + in-memory cache)
- **TanStack Query**: ALL hooks already exist — import and use them directly
- **Error Handling**: Use `ApiError` class, display via inline error state or graceful degradation
- **NativeWind Styling**: All styles via Tailwind classNames, not StyleSheet
- **Type Everything**: No `any`, use proper TypeScript interfaces from `types/` folder

### Existing Hooks to Use (ALL ALREADY IMPLEMENTED — DO NOT create new hooks)

| Hook | File | Returns |
|------|------|---------|
| `useUnreadCount()` | `lib/api/hooks/use-notifications.ts` | `{ unreadCount: number }` |
| `useMoodTrends()` | `lib/api/hooks/use-mood.ts` | `MoodTrendsResponse` |
| `useMoodWeek()` | `lib/api/hooks/use-mood.ts` | `MoodWeekResponse` |
| `useJournalStreak()` | `lib/api/hooks/use-journal-streak.ts` | `StreakResponse` |
| `useChronology()` | `lib/api/hooks/use-boards.ts` | `ChronologyResponse` |

### Components to Modify

| Component | File | Current State | Action |
|-----------|------|---------------|--------|
| MessagerieWidget | `(tabs)/_components/messagerie-widget.tsx` | Uses `MOCK_UNREAD_MESSAGES = 3` | **Replace** with `useUnreadCount()` |
| SuiviWidgets | `(tabs)/_components/suivi-widgets.tsx` | Uses `MOCK_MONTHLY_DATA` + `MOCK_WEEKLY_DATA` | **Replace** with `useMoodTrends()` + `useMoodWeek()` |
| JournalWidget | `(tabs)/_components/journal-widget.tsx` | Navigation only, no data | **Enhance** with `useJournalStreak()` |
| CalendarWidget | `(tabs)/_components/calendar-widget.tsx` | Just shows today's date | **Enhance** with `useChronology()` |
| Mock data file | `constants/dashboard-mock-data.ts` | 5 mock constants | **Clean up** unused mocks |

### Widgets Already Using Real Data (DO NOT touch)

These widgets are fully connected and should NOT be modified:

| Widget | Hook(s) | Status |
|--------|---------|--------|
| GalleryWidget | `useGallery(1, 4)` | ✅ Real data |
| MoodWidget | `useTodayMood()` | ✅ Real data |
| TodoWidget | `useBoards("todo", 1, 5)` | ✅ Real data |
| MoodboardWidget | `useMoodboards(1, 1)` | ✅ Real data |
| RewardsWidget | `useStickers()` + `useBadges()` | ✅ Real data (Story 13.1) |

### Data Mapping Details

**SuiviWidgets — Monthly Chart Mapping:**
```typescript
// useMoodTrends() returns months like: [{ month: "2026-01", averageIntensity: 7.2, ... }]
// Map to chart format:
const monthlyData = trends?.months.map(m => ({
  month: new Date(m.month + "-01").toLocaleDateString("fr-FR", { month: "short" }),
  // e.g., "Jan", "Fev", "Mar"
  value: Math.round(m.averageIntensity * 10), // Scale 0-10 → 0-100 for chart height
})) ?? [];
```

**SuiviWidgets — Weekly Chart Mapping:**
```typescript
// useMoodWeek() returns entries like: [{ dayOfWeek: "lundi", intensity: 7, ... }]
// Map to chart format:
const DAYS_ORDER = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

const weeklyData = DAYS_ORDER.map((day, i) => {
  const entry = weekEntries?.entries.find(e => e.dayOfWeek === day);
  return { day: DAY_LABELS[i], value: entry?.intensity ?? 0 };
});
```

**CalendarWidget — Today's Events:**
```typescript
// useChronology() returns eventDates like: { "2026-02-11": { count: 3, boards: [...] } }
const today = new Date().toISOString().split("T")[0]; // "2026-02-11"
const todayEvents = chronology?.eventDates?.[today]?.count ?? 0;
```

### New Files to Create

**None** — this story only modifies existing files.

### Files to Modify

```
apps/expo/app/(protected)/(tabs)/_components/
├── messagerie-widget.tsx     # Replace mock → useUnreadCount()
├── suivi-widgets.tsx          # Replace mock → useMoodTrends() + useMoodWeek()
├── journal-widget.tsx         # Enhance → useJournalStreak()
└── calendar-widget.tsx        # Enhance → useChronology()

apps/expo/constants/
└── dashboard-mock-data.ts     # Remove unused mock constants
```

### Key Implementation Patterns (from stories 10.1–13.1)

**Graceful degradation pattern (for lightweight widgets):**
```typescript
// MessagerieWidget — don't block the widget if API fails
export function MessagerieWidget() {
  const router = useRouter();
  const { data, isLoading } = useUnreadCount();
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <Pressable onPress={() => router.push("/(protected)/(tabs)/messages")} ...>
      {/* Always show widget, count is optional enhancement */}
      <Text>Messagerie</Text>
      {isLoading ? (
        <Text className="text-sm text-muted-foreground">...</Text>
      ) : unreadCount > 0 ? (
        <Text>{unreadCount} message{unreadCount > 1 ? "s" : ""} non lu{unreadCount > 1 ? "s" : ""}</Text>
      ) : (
        <Text>Aucun message non lu</Text>
      )}
    </Pressable>
  );
}
```

**Loading skeleton for chart area:**
```typescript
// SuiviWidgets — show skeleton bars while loading
{isLoading ? (
  <View className="h-24 flex-row items-end justify-between">
    {Array.from({ length: 6 }).map((_, i) => (
      <View key={i} className="items-center">
        <View className="w-6 rounded-t-md bg-muted" style={{ height: 20 + Math.random() * 40 }} />
        <View className="mt-1 h-3 w-4 rounded bg-muted" />
      </View>
    ))}
  </View>
) : (
  // Real chart rendering
)}
```

### Library Versions (Already Installed — DO NOT upgrade or install new)

| Library | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | 5.67.3 | Server state management |
| `expo-router` | 6.0.21 | File-based routing |
| `nativewind` | 4.1.23 | Tailwind CSS for RN |
| `lucide-react-native` | (installed) | Icons |

### Critical Guardrails

1. **DO NOT modify any backend code** — all APIs are implemented and working
2. **DO NOT install new libraries** — everything needed is already installed
3. **DO NOT create new hooks** — all 5 required hooks already exist
4. **DO NOT touch working widgets** — Gallery, Mood, Todo, Moodboard, Rewards are production-ready
5. **DO NOT modify dashboard index.tsx** — widget composition is correct, only modify individual widget components
6. **Graceful degradation** — widgets should still render even if their API call fails (show widget structure without data)
7. **Follow NativeWind styling** — all styles via Tailwind classNames, not StyleSheet
8. **Type everything** — no `any`, use proper TypeScript interfaces
9. **Alert feedback** — show Alert.alert on persistent errors (learned from previous stories code review)
10. **Clean imports** — remove unused imports after mock data removal (Biome will flag as errors)

### Previous Story Intelligence (13.1 — Stickers & Badge Collections Mobile)

**Key Learnings:**
- Loading skeletons preferred over ActivityIndicator for visual consistency
- `refetchOnMount: 'always'` for data that may have changed while navigating
- Remove dead code proactively (Biome flags unused imports as errors)
- Code review catches: always add loading/error/empty states
- Map API data to existing visual component props (don't restructure components)

**Code Review Patterns to Follow:**
- H1: Use loading skeletons, not just ActivityIndicator
- M2: Hardcoded colors should use theme reference (`colors.*`)
- L1: Remove dead/unused code immediately

### Git Intelligence (Recent Commits)

```
18a681f feat(expo): implement story 13.1 — stickers & badge collections mobile with code review fixes
67a8128 docs: add epic 12 retrospective and update sprint status
31c4761 feat(expo): implement stories 12.1 & 12.2 — photo gallery & moodboard management mobile with code review fixes
```

**Pattern**: All mobile stories follow commit format: `feat(expo): implement story X.Y — description with code review fixes`.

### Project Structure Notes

- All widget components in `apps/expo/app/(protected)/(tabs)/_components/`
- API hooks in `apps/expo/lib/api/hooks/`
- Types in `apps/expo/types/`
- Mock data in `apps/expo/constants/dashboard-mock-data.ts`
- Dashboard main screen: `apps/expo/app/(protected)/(tabs)/index.tsx`

### Scope Sizing

This is a **small story** — no new files, no new hooks, no new types. Only 4 widget component modifications + 1 cleanup file. Each widget modification is 10-30 lines of code change. Estimated: ~100-150 lines changed total.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 13: Story 13.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Dashboard Widgets — Server Components with Suspense]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Client Strategy — Platform-Native, No Sharing]
- [Source: _bmad-output/implementation-artifacts/13-1-stickers-and-badge-collections-mobile.md — Previous story learnings]
- [Source: apps/expo/app/(protected)/(tabs)/index.tsx — Dashboard main screen]
- [Source: apps/expo/app/(protected)/(tabs)/_components/messagerie-widget.tsx — Mock unread count]
- [Source: apps/expo/app/(protected)/(tabs)/_components/suivi-widgets.tsx — Mock chart data]
- [Source: apps/expo/app/(protected)/(tabs)/_components/journal-widget.tsx — Navigation only]
- [Source: apps/expo/app/(protected)/(tabs)/_components/calendar-widget.tsx — Date display only]
- [Source: apps/expo/constants/dashboard-mock-data.ts — Mock data to remove]
- [Source: apps/expo/lib/api/hooks/use-notifications.ts — useUnreadCount() hook]
- [Source: apps/expo/lib/api/hooks/use-mood.ts — useMoodTrends(), useMoodWeek() hooks]
- [Source: apps/expo/lib/api/hooks/use-journal-streak.ts — useJournalStreak() hook]
- [Source: apps/expo/lib/api/hooks/use-boards.ts — useChronology() hook]
- [Source: apps/expo/types/mood.ts — MoodTrendsResponse, MoodWeekResponse types]
- [Source: apps/expo/types/post.ts — StreakResponse type]
- [Source: apps/expo/types/board.ts — ChronologyResponse type]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed Biome `noArrayIndexKey` errors in suivi-widgets.tsx skeleton loading by using stable key arrays instead of Array.from index
- Fixed TypeScript error in calendar-widget.tsx: `split("T")[0]` returns `string | undefined`, replaced with `slice(0, 10)` which returns `string`

### Completion Notes List

- **Task 1**: MessagerieWidget connected to `useUnreadCount()`. Loading skeleton, error graceful degradation ("—"), empty state ("Aucun message non lu"), and count display with pluralization
- **Tasks 2-3**: SuiviWidgets monthly + weekly charts connected to `useMoodTrends()` and `useMoodWeek()`. API data mapped to chart format (intensity × 10 for monthly, 7-day fixed grid for weekly). Loading skeletons with deterministic heights, empty/error states
- **Task 4**: JournalWidget enhanced with `useJournalStreak()`. Flame icon + "X jours de suite" when streak > 0, "Commence ton journal" when 0, loading skeleton
- **Task 5**: CalendarWidget enhanced with `useChronology()`. Today's event count displayed below date, loading skeleton that doesn't block date display
- **Task 6**: Entire `dashboard-mock-data.ts` deleted — MOCK_GALLERY_IMAGES and MOCK_TODO_ITEMS were not imported anywhere, so full file removal was safe

### Change Log

- 2026-02-11: Implemented story 13.2 — connected 4 dashboard widgets to real API data, removed all mock data dependencies
- 2026-02-11: Code review fixes — added retry on error for all 4 widgets (H1/AC#7), fixed French pluralization rendering bug (M1), fixed timezone bugs in monthly chart and calendar widget (M2/M3), added explicit weekly chart empty state (M4), added isError handling to JournalWidget and CalendarWidget (L1/L2)

### File List

- `apps/expo/app/(protected)/(tabs)/_components/messagerie-widget.tsx` — Modified: replaced MOCK_UNREAD_MESSAGES with useUnreadCount() hook
- `apps/expo/app/(protected)/(tabs)/_components/suivi-widgets.tsx` — Modified: replaced MOCK_MONTHLY_DATA + MOCK_WEEKLY_DATA with useMoodTrends() + useMoodWeek() hooks
- `apps/expo/app/(protected)/(tabs)/_components/journal-widget.tsx` — Modified: added useJournalStreak() hook with streak display and flame icon
- `apps/expo/app/(protected)/(tabs)/_components/calendar-widget.tsx` — Modified: added useChronology() hook with today's event count
- `apps/expo/constants/dashboard-mock-data.ts` — Deleted: all mock constants removed, no remaining references
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Modified: story status updated
- `_bmad-output/implementation-artifacts/13-2-dashboard-widgets-real-api-connection-mobile.md` — Modified: tasks marked complete, dev record updated
