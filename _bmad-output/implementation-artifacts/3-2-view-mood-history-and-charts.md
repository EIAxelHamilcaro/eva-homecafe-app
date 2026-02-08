# Story 3.2: View Mood History & Charts

Status: done

## Story

As a **user**,
I want to view my mood history as charts and trends,
so that I can understand my emotional patterns over time.

## Acceptance Criteria

1. **Given** an authenticated user with mood entries **When** they view mood check-ins per day of the week **Then** they see which moods were recorded on each day of the current week

2. **Given** an authenticated user with mood entries spanning multiple weeks **When** they view the weekly bar chart **Then** they see a bar chart summarizing mood distribution for the current week

3. **Given** an authenticated user with mood entries spanning months **When** they view the 6-month trend view **Then** they see mood trends over the last 6 months with visual indicators of dominant moods

4. **Given** an authenticated user **When** they view the mood legend **Then** they see all 9 mood categories with explanations and associated colors/icons

5. **Given** an authenticated user with no mood entries **When** they view the mood tracker page **Then** they see an empty state encouraging their first mood check-in

6. **Given** the mood stats API endpoint **When** queried with a time range (weekly or 6-month) **Then** it returns aggregated mood data formatted for chart rendering

## Tasks / Subtasks

- [x] Task 1: Install Recharts via shadcn/ui (AC: #2, #3)
  - [x] 1.1 Run `pnpm ui:add chart` from `packages/ui` to install Recharts + shadcn chart wrapper
  - [x] 1.2 Verify chart component generated at `packages/ui/src/components/ui/chart.tsx`
  - [x] 1.3 Fix import paths if needed (same issue as slider in Story 3.1: `../../libs/utils` instead of `/src/libs/utils`)

- [x] Task 2: Create Mood Stats DTOs (AC: #1, #2, #3, #6)
  - [x] 2.1 Create `src/application/dto/mood/get-mood-week.dto.ts` — input: `{ userId }`, output: `{ entries: { date: string, dayOfWeek: string, category: string, intensity: number }[] }`
  - [x] 2.2 Create `src/application/dto/mood/get-mood-stats.dto.ts` — input: `{ userId, period: "week" | "6months" }`, output: `{ categoryDistribution: { category: string, count: number, percentage: number }[], averageIntensity: number, totalEntries: number, dominantMood: string }`
  - [x] 2.3 Create `src/application/dto/mood/get-mood-trends.dto.ts` — input: `{ userId }`, output: `{ months: { month: string, dominantCategory: string, averageIntensity: number, entryCount: number }[] }`

- [x] Task 3: Create Mood CQRS Queries (AC: #1, #2, #3, #6)
  - [x] 3.1 Create `src/adapters/queries/mood-week.query.ts` — `getMoodWeek(userId)`: fetch mood entries for current week (Monday-Sunday), return per-day data. Direct Drizzle query with `BETWEEN` on `moodDate` column.
  - [x] 3.2 Create `src/adapters/queries/mood-stats.query.ts` — `getMoodStats(userId, period)`: aggregate category counts, average intensity, dominant mood for given period. Use SQL `COUNT`, `AVG`, `GROUP BY` on `moodCategory`.
  - [x] 3.3 Create `src/adapters/queries/mood-trends.query.ts` — `getMoodTrends(userId)`: aggregate by month for last 6 months. Use SQL `DATE_TRUNC('month', mood_date)` grouping. Return per-month dominant category and average intensity.

- [x] Task 4: Create Mood Stats Controllers (AC: #1, #2, #3, #6)
  - [x] 4.1 Add `getMoodWeekController` to `src/adapters/controllers/mood/mood.controller.ts` — GET handler, auth required, calls `getMoodWeek` query
  - [x] 4.2 Add `getMoodStatsController` to same file — GET handler, auth required, accepts `?period=week|6months` query param, calls `getMoodStats` query
  - [x] 4.3 Add `getMoodTrendsController` to same file — GET handler, auth required, calls `getMoodTrends` query

- [x] Task 5: Create API Routes (AC: #6)
  - [x] 5.1 Create `app/api/v1/mood/week/route.ts` — `export const GET = getMoodWeekController`
  - [x] 5.2 Create `app/api/v1/mood/stats/route.ts` — `export const GET = getMoodStatsController`
  - [x] 5.3 Create `app/api/v1/mood/trends/route.ts` — `export const GET = getMoodTrendsController`

- [x] Task 6: Create Mood Legend Data (AC: #4)
  - [x] 6.1 Create `app/(protected)/mood/_components/mood-legend.tsx` — client component displaying all 9 categories with color, icon, and French display name. Pure UI, no API call needed — data is static.

- [x] Task 7: Create Chart Components (AC: #1, #2, #3, #5)
  - [x] 7.1 Create `app/(protected)/mood/_components/mood-week-view.tsx` — client component: fetch `/api/v1/mood/week`, display 7-day grid showing mood per day with category color + intensity
  - [x] 7.2 Create `app/(protected)/mood/_components/mood-bar-chart.tsx` — client component: fetch `/api/v1/mood/stats?period=week`, render Recharts `<BarChart>` with `<ChartContainer>` wrapper showing category distribution
  - [x] 7.3 Create `app/(protected)/mood/_components/mood-trend-chart.tsx` — client component: fetch `/api/v1/mood/trends`, render Recharts `<LineChart>` or `<AreaChart>` showing 6-month trend with dominant moods
  - [x] 7.4 Create `app/(protected)/mood/_components/mood-empty-state.tsx` — empty state component when no mood entries exist, with CTA to record first mood

- [x] Task 8: Update Mood Page Layout (AC: #1, #2, #3, #4, #5)
  - [x] 8.1 Update `app/(protected)/mood/page.tsx` — compose all sections: MoodForm (existing, top), MoodWeekView, MoodBarChart, MoodTrendChart, MoodLegend. Conditionally show empty state if no entries.

- [x] Task 9: Write BDD Tests (AC: all)
  - [x] 9.1 Create `src/adapters/queries/__tests__/mood-week.query.test.ts` — test query returns correct entries for current week, handles empty results, filters by userId
  - [x] 9.2 Create `src/adapters/queries/__tests__/mood-stats.query.test.ts` — test aggregation for week and 6-month periods, handles empty results, validates category distribution math
  - [x] 9.3 Create `src/adapters/queries/__tests__/mood-trends.query.test.ts` — test 6-month grouping, handles partial months, validates dominant mood calculation

- [x] Task 10: Quality Checks
  - [x] 10.1 Run `pnpm fix` (Biome formatting)
  - [x] 10.2 Run `pnpm type-check`
  - [x] 10.3 Run `pnpm test`
  - [x] 10.4 Run `pnpm check:all` (duplication + unused pre-existing failures only)

## Dev Notes

### Architecture Patterns

- **CQRS for all reads**: Story 3.2 is 100% read operations. Use direct Drizzle queries (CQRS pattern), NO use cases needed. Follow `today-mood.query.ts`, `journal.query.ts`, `streak.query.ts` patterns.
- **No new domain code**: DB schema, aggregate, VOs, events all exist from Story 3.1. This story is purely queries + UI.
- **No DI changes**: CQRS queries are not injected via DI. Controllers call queries directly. No new DI_SYMBOLS or modules needed.
- **IEventDispatcher NOT wired** (Epic 7): Same as 3.1 — no event dispatch changes.

### Security Checklist (Epic 2 Retro Action Item #1)

- [ ] Every endpoint requires authentication (`getAuthenticatedUser()`)
- [ ] Users can only read their OWN mood entries (filter by `userId` from session, NOT from request body/params)
- [ ] No access to other users' mood data
- [ ] Query params validated with Zod safeParse (period param)

### Critical Anti-Patterns to Avoid (Cumulative from Epics 1-2)

1. **Do NOT create use cases for pure reads** — CQRS pattern: queries bypass domain layer entirely.
2. **Do NOT create unnecessary VOs or classes** — No new domain types needed. Reuse existing MoodCategory values for chart labels.
3. **Use explicit `: string` type annotation** for any VO.create() calls (if needed).
4. **Do NOT blindly copy patterns** — This story has NO writes. Don't create repository methods, use cases, or DI bindings.
5. **`getAuthenticatedUser()` duplication** — Continue using existing copy-paste pattern (extraction deferred). Copy from `src/adapters/controllers/mood/mood.controller.ts` (same file, already imported).
6. **Do NOT create dead code** — If a class or function isn't used, don't create it. Challenge every file: "Is this actually needed?"

### MoodCategory Display Mapping (from Story 3.1)

| DB Value | UI Display | Chart Color (suggested) |
|---|---|---|
| calme | Calme | #8EC8F0 (light blue) |
| enervement | Enervement | #F28C82 (coral red) |
| excitation | Excitation | #FFD166 (warm yellow) |
| anxiete | Anxiete | #B794C0 (lavender) |
| tristesse | Tristesse | #7BA7BC (steel blue) |
| bonheur | Bonheur | #81C784 (green) |
| ennui | Ennui | #BDBDBD (grey) |
| nervosite | Nervosite | #FF8A65 (orange) |
| productivite | Productivite | #4DB6AC (teal) |

NOTE: Final colors should come from the Figma design. These are placeholder suggestions for development. Check Figma before finalizing.

### Charting Library: Recharts via shadcn/ui

- **Library**: Recharts (installed via `pnpm ui:add chart`)
- **Wrapper**: shadcn/ui `<ChartContainer>`, `<ChartTooltip>`, `<ChartTooltipContent>`
- **Why**: Already using shadcn/ui; consistent styling; React 19 compatible; SSR-friendly pattern (fetch server-side, render client-side)
- **Pattern**: All chart components are `"use client"` — fetch data from API endpoints, render with Recharts
- **Fix for React 19**: If `react-is` peer dep conflict arises, add override in root `package.json`: `"overrides": { "react-is": "^19.0.0" }`

### SQL Query Patterns

**Current week (Monday-Sunday):**
```sql
SELECT * FROM mood_entry
WHERE user_id = $1
AND mood_date BETWEEN date_trunc('week', CURRENT_DATE)::date
AND (date_trunc('week', CURRENT_DATE) + interval '6 days')::date
ORDER BY mood_date ASC
```

**Category distribution (aggregation):**
```sql
SELECT mood_category, COUNT(*) as count
FROM mood_entry
WHERE user_id = $1
AND mood_date >= $2 -- start date based on period
GROUP BY mood_category
ORDER BY count DESC
```

**6-month trends (monthly grouping):**
```sql
SELECT DATE_TRUNC('month', mood_date::timestamp) as month,
       mode() WITHIN GROUP (ORDER BY mood_category) as dominant_category,
       AVG(mood_intensity) as avg_intensity,
       COUNT(*) as entry_count
FROM mood_entry
WHERE user_id = $1
AND mood_date >= (CURRENT_DATE - interval '6 months')::date
GROUP BY DATE_TRUNC('month', mood_date::timestamp)
ORDER BY month ASC
```

**Drizzle ORM equivalents**: Use `sql` template literal for complex aggregations. See existing patterns in `streak.query.ts` and `journal.query.ts` for Drizzle SQL usage.

**Timezone note**: `moodDate` column is a `date` type (no timezone). Server timezone dependency (known tech debt from Epic 1). Acceptable for now.

### DB Schema Reference (from Story 3.1)

```
mood_entry table:
  id          text PK
  user_id     text FK→user.id (cascade)
  mood_category   text NOT NULL
  mood_intensity  integer NOT NULL
  mood_date       date NOT NULL
  created_at      timestamp NOT NULL defaultNow()
  updated_at      timestamp

Indexes:
  - (user_id, created_at) — general lookup
  - UNIQUE (user_id, mood_date) — one mood per day per user
```

### Previous Story Intelligence (from Story 3.1)

**What worked well:**
- CQRS query pattern (`today-mood.query.ts`) was implemented cleanly — follow same pattern
- `moodDate` date column with unique constraint prevents duplicate entries — reliable for aggregation queries
- Mapper handles date conversion (moodDate stored as YYYY-MM-DD string) — queries return this format

**What to watch for:**
- shadcn/ui component install (`pnpm ui:add chart`) may fail via turbo — use `npx shadcn@latest add chart --yes` directly from `packages/ui` as fallback
- Fix import path in generated chart.tsx if needed (same issue as slider: `../../libs/utils` not `/src/libs/utils`)
- Biome will flag unused imports as errors — clean them up immediately

**Code review findings applied in 3.1:**
- [HIGH] `moodDate` column + unique index prevents race conditions — queries can rely on this
- [MEDIUM] Controller returns 422 (not 500) for use case failures — follow same pattern for stats controllers
- [MEDIUM] Exported `moodCategorySchema` from VO — reuse for validation if needed

### Git Intelligence (recent commits)

Last commit: `559d990 feat(nextjs): implement story 3.1 — record daily mood with code review fixes`
- All mood domain/application/adapter files created
- DB schema with `moodDate` column + unique index
- 182 tests pass (16 mood + 166 existing)

Pattern from commits: single-commit stories with code review fixes folded in. All quality checks pass before commit.

### Project Structure Notes

```
# New files to create
src/application/dto/mood/get-mood-week.dto.ts                  # DTO
src/application/dto/mood/get-mood-stats.dto.ts                  # DTO
src/application/dto/mood/get-mood-trends.dto.ts                 # DTO
src/adapters/queries/mood-week.query.ts                         # CQRS query
src/adapters/queries/mood-stats.query.ts                        # CQRS query
src/adapters/queries/mood-trends.query.ts                       # CQRS query
src/adapters/queries/__tests__/mood-week.query.test.ts          # Tests
src/adapters/queries/__tests__/mood-stats.query.test.ts         # Tests
src/adapters/queries/__tests__/mood-trends.query.test.ts        # Tests
app/api/v1/mood/week/route.ts                                   # API route
app/api/v1/mood/stats/route.ts                                  # API route
app/api/v1/mood/trends/route.ts                                 # API route
app/(protected)/mood/_components/mood-week-view.tsx              # UI component
app/(protected)/mood/_components/mood-bar-chart.tsx              # UI component
app/(protected)/mood/_components/mood-trend-chart.tsx            # UI component
app/(protected)/mood/_components/mood-legend.tsx                 # UI component
app/(protected)/mood/_components/mood-empty-state.tsx            # UI component

# Files to modify
src/adapters/controllers/mood/mood.controller.ts                # Add 3 GET controllers
app/(protected)/mood/page.tsx                                   # Compose new components
```

### Golden Reference Files

| Purpose | Source File | Adaptation |
|---|---|---|
| CQRS query | `src/adapters/queries/today-mood.query.ts` | Add date range filtering, aggregation |
| CQRS query (complex) | `src/adapters/queries/journal.query.ts` | Similar date-based filtering pattern |
| Streak query | `src/adapters/queries/streak.query.ts` | SQL aggregation pattern reference |
| Controller (GET) | `src/adapters/controllers/mood/mood.controller.ts` | Extend with 3 new GET handlers |
| DTO pattern | `src/application/dto/mood/get-today-mood.dto.ts` | Same Zod schema pattern |
| API route | `app/api/v1/mood/route.ts` | Same re-export pattern |
| Client component | `app/(protected)/mood/_components/mood-form.tsx` | Same fetch + render pattern |
| Page composition | `app/(protected)/mood/page.tsx` | Add new component imports |
| shadcn chart | `packages/ui/src/components/ui/chart.tsx` | Generated by `pnpm ui:add chart` |

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture - Mood Tracker]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Conventions]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md#FR30-FR35]
- [Source: _bmad-output/implementation-artifacts/3-1-record-daily-mood.md#Dev Notes]
- [Source: _bmad-output/implementation-artifacts/epic-2-retro-2026-02-08.md#Action Items]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- All 10 tasks completed successfully
- 195 tests pass (13 new mood query tests + 182 existing)
- Type-check passes cleanly
- Biome lint/format passes (warnings are pre-existing)
- check:duplication and check:unused failures are pre-existing (not introduced by this story)
- Fixed card.tsx import path (overwritten by shadcn chart install `--overwrite`)
- Created MoodHistory wrapper component for conditional empty state rendering

### Code Review Notes

**Review Date:** 2026-02-08
**Reviewer:** Claude Opus 4.6 (adversarial review)

**Issues Found: 9** (2 HIGH, 4 MEDIUM, 3 LOW)
**Issues Fixed: 6** (2 HIGH + 4 MEDIUM)
**Issues Deferred: 3** (LOW — cosmetic/i18n)

| ID | Severity | Description | Resolution |
|---|---|---|---|
| HIGH-1 | HIGH | N+1 query in mood-trends.query.ts | Fixed: rewrote to single SQL query using `mode() WITHIN GROUP` |
| HIGH-2 | HIGH | Double fetch of stats?period=week | Fixed: MoodHistory checks entries via `period=6months` |
| MEDIUM-1 | MEDIUM | File List missing packages/ui files | Fixed: added to File List |
| MEDIUM-2 | MEDIUM | getMoodColor/getMoodLabel duplicated in 3 files | Fixed: extracted to mood-legend.tsx, imported in all charts |
| MEDIUM-3 | MEDIUM | Empty state only checks current week | Fixed: uses 6months period (combined with HIGH-2) |
| MEDIUM-4 | MEDIUM | Import order inconsistency | Fixed: Biome auto-sorted |
| LOW-1 | LOW | UI text in English (app targets French) | Deferred: i18n story |
| LOW-2 | LOW | formatMonth hardcoded en-US locale | Deferred: i18n story |
| LOW-3 | LOW | Unnecessary "use client" in mood-empty-state | Fixed |

### File List

**New files:**
- `apps/nextjs/src/application/dto/mood/get-mood-week.dto.ts`
- `apps/nextjs/src/application/dto/mood/get-mood-stats.dto.ts`
- `apps/nextjs/src/application/dto/mood/get-mood-trends.dto.ts`
- `apps/nextjs/src/adapters/queries/mood-week.query.ts`
- `apps/nextjs/src/adapters/queries/mood-stats.query.ts`
- `apps/nextjs/src/adapters/queries/mood-trends.query.ts`
- `apps/nextjs/src/adapters/queries/__tests__/mood-week.query.test.ts`
- `apps/nextjs/src/adapters/queries/__tests__/mood-stats.query.test.ts`
- `apps/nextjs/src/adapters/queries/__tests__/mood-trends.query.test.ts`
- `apps/nextjs/app/api/v1/mood/week/route.ts`
- `apps/nextjs/app/api/v1/mood/stats/route.ts`
- `apps/nextjs/app/api/v1/mood/trends/route.ts`
- `apps/nextjs/app/(protected)/mood/_components/mood-week-view.tsx`
- `apps/nextjs/app/(protected)/mood/_components/mood-bar-chart.tsx`
- `apps/nextjs/app/(protected)/mood/_components/mood-trend-chart.tsx`
- `apps/nextjs/app/(protected)/mood/_components/mood-legend.tsx`
- `apps/nextjs/app/(protected)/mood/_components/mood-empty-state.tsx`
- `apps/nextjs/app/(protected)/mood/_components/mood-history.tsx`

**Modified files:**
- `apps/nextjs/src/adapters/controllers/mood/mood.controller.ts` (added 3 GET controllers)
- `apps/nextjs/app/(protected)/mood/page.tsx` (compose new components)
- `packages/ui/src/components/ui/chart.tsx` (generated by shadcn, fixed import path)
- `packages/ui/src/components/ui/card.tsx` (fixed import path after shadcn overwrite)
- `packages/ui/package.json` (recharts + react-resizable-panels deps added by shadcn chart)
- `pnpm-lock.yaml` (lockfile updated)
