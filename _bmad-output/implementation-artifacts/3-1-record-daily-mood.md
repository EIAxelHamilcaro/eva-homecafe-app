# Story 3.1: Record Daily Mood

Status: done

## Story

As a **user**,
I want to record my daily mood by selecting a category and intensity,
so that I can track how I feel over time.

## Acceptance Criteria

1. **Given** an authenticated user **When** they open the mood tracker **Then** they see 9 predefined mood categories (Calme, Enervement, Excitation, Anxiete, Tristesse, Bonheur, Ennui, Nervosite, Productivite) **And** they can select one category and adjust intensity via a slider

2. **Given** an authenticated user who selects a mood and intensity **When** they submit the mood check-in **Then** the mood entry is persisted with category, intensity, userId, and timestamp **And** a MoodRecordedEvent domain event is added **And** response time is under 500ms (NFR5)

3. **Given** an authenticated user who already recorded a mood today **When** they open the mood tracker **Then** they see their current mood for today and can update it

4. **Given** an authenticated user **When** they submit a mood check-in without selecting a category **Then** the system returns a validation error

5. **Given** the MoodEntry aggregate **When** created **Then** it includes: MoodCategory VO (one of 9 values), MoodIntensity VO (slider range 1-10), userId, createdAt **And** the mood DB schema (mood_entry table) is created

## Tasks / Subtasks

- [x] Task 1: Create MoodEntry DB Schema (AC: #5)
  - [x] 1.1 Create `packages/drizzle/src/schema/mood.ts` — `mood_entry` table: `id` text PK, `userId` text FK→user.id (cascade), `moodCategory` text NOT NULL, `moodIntensity` integer NOT NULL, `createdAt` timestamp NOT NULL defaultNow(), `updatedAt` timestamp nullable
  - [x] 1.2 Add index on `(userId, createdAt)` for daily mood lookups
  - [x] 1.3 Export from `packages/drizzle/src/schema/index.ts`

- [x] Task 2: Create Mood Domain Layer (AC: #1, #4, #5)
  - [x] 2.1 Create `src/domain/mood/mood-entry-id.ts` — `MoodEntryId extends UUID` with `[Symbol.toStringTag] = "MoodEntryId"` and static `create()`
  - [x] 2.2 Create `src/domain/mood/value-objects/mood-category.vo.ts` — `MoodCategory extends ValueObject<string>`, validate against 9 values: `["calme", "enervement", "excitation", "anxiete", "tristesse", "bonheur", "ennui", "nervosite", "productivite"]` using Zod enum. Store lowercase, display with French accents in UI only.
  - [x] 2.3 Create `src/domain/mood/value-objects/mood-intensity.vo.ts` — `MoodIntensity extends ValueObject<number>`, validate with Zod `z.number().int().min(1).max(10)`
  - [x] 2.4 Create `src/domain/mood/events/mood-recorded.event.ts` — `MoodRecordedEvent` with payload `{ moodEntryId, userId, category, intensity }`
  - [x] 2.5 Create `src/domain/mood/mood-entry.aggregate.ts` — `MoodEntry extends Aggregate<IMoodEntryProps>` with `create()`, `reconstitute()`, `update(category, intensity)` methods. Only `get id()` getter.

- [x] Task 3: Create Mood DTOs (AC: #1, #2, #3, #4)
  - [x] 3.1 Create `src/application/dto/mood/record-mood.dto.ts` — input: `{ userId, category, intensity }`, output: `{ id, userId, category, intensity, createdAt }`
  - [x] 3.2 Create `src/application/dto/mood/get-today-mood.dto.ts` — input: `{ userId }`, output: `{ id, category, intensity, createdAt } | null`

- [x] Task 4: Create Mood Port & Repository (AC: #2, #3, #5)
  - [x] 4.1 Create `src/application/ports/mood-repository.port.ts` — `IMoodRepository extends BaseRepository<MoodEntry>` with `findTodayByUserId(userId: string): Promise<Result<Option<MoodEntry>>>`
  - [x] 4.2 Create `src/adapters/mappers/mood.mapper.ts` — `moodEntryToPersistence()` and `moodEntryToDomain()` functions
  - [x] 4.3 Create `src/adapters/repositories/mood.repository.ts` — `DrizzleMoodRepository implements IMoodRepository` with `findTodayByUserId()` using SQL DATE comparison on createdAt

- [x] Task 5: Create Mood Use Cases (AC: #1, #2, #3, #4)
  - [x] 5.1 Create `src/application/use-cases/mood/record-mood.use-case.ts` — `RecordMoodUseCase`: check if mood exists today → if yes, update; if no, create. Validate VOs, persist, add domain event, return DTO.

- [x] Task 6: Create Mood Query for Today (AC: #3)
  - [x] 6.1 Create `src/adapters/queries/today-mood.query.ts` — CQRS query `getTodayMood(userId)` returning today's mood entry or null. Direct Drizzle query, no Use Case needed for pure read.

- [x] Task 7: Create Mood Controllers & API Routes (AC: #1, #2, #3, #4)
  - [x] 7.1 Create `src/adapters/controllers/mood/mood.controller.ts` — `recordMoodController` (POST), `getTodayMoodController` (GET)
  - [x] 7.2 Create `app/api/v1/mood/route.ts` — export `POST = recordMoodController`, `GET = getTodayMoodController`

- [x] Task 8: Register in DI (AC: all)
  - [x] 8.1 Add `IMoodRepository`, `RecordMoodUseCase` to `common/di/types.ts` (DI_SYMBOLS + DI_RETURN_TYPES + imports)
  - [x] 8.2 Create `common/di/modules/mood.module.ts` — bind `IMoodRepository` → `DrizzleMoodRepository`, bind `RecordMoodUseCase` → `[DI_SYMBOLS.IMoodRepository]`
  - [x] 8.3 Register mood module in `common/di/container.ts` alphabetically (between MessageModule and NotificationModule)

- [x] Task 9: Create Mood UI Page & Components (AC: #1, #3)
  - [x] 9.1 Install `slider` shadcn component: `pnpm ui:add slider`
  - [x] 9.2 Create `app/(protected)/mood/page.tsx` — server component with `requireAuth()`, composes mood form
  - [x] 9.3 Create `app/(protected)/mood/_components/mood-form.tsx` — client component: mood category grid (9 options), intensity slider (1-10), submit button. On load, fetch today's mood via GET /api/v1/mood; on submit, POST /api/v1/mood.
  - [N/A] 9.4 Add mood page link to sidebar/navigation if applicable — No existing sidebar/navigation component found to modify

- [x] Task 10: Write BDD Tests (AC: all)
  - [x] 10.1 Create `src/application/use-cases/mood/__tests__/record-mood.use-case.test.ts` — happy path (create new), happy path (update existing), validation errors (invalid category, intensity out of range, missing fields), repository error handling

- [x] Task 11: Quality Checks
  - [x] 11.1 Run `pnpm fix` (Biome formatting)
  - [x] 11.2 Run `pnpm type-check`
  - [x] 11.3 Run `pnpm test`
  - [x] 11.4 Run `pnpm check:all`

## Dev Notes

### Architecture Patterns

- **New standalone domain**: `src/domain/mood/` — completely independent from post/user domains
- **CQRS**: RecordMoodUseCase for writes, CQRS query for today's mood read
- **Performance**: Mood check-in response < 500ms (NFR5) — single DB write, no complex joins
- **IEventDispatcher NOT wired** (Epic 7): Add events via `addEvent()` in aggregate but do NOT dispatch. No `eventDispatcher` in use case constructor.

### Security Checklist (Epic 2 Retro Action Item #1)

- [x] Every endpoint requires authentication (`getAuthenticatedUser()`)
- [x] Users can only read/write their OWN mood entries (filter by `userId` from session, not from request body for reads)
- [x] Zod safeParse on ALL controller inputs
- [x] No access to other users' mood data

### Critical Anti-Patterns to Avoid (Epic 2 Retro Learnings)

1. **Do NOT create VOs without domain logic justification** — Only create MoodCategory and MoodIntensity VOs. Do NOT create unnecessary wrapper classes.
2. **Do NOT blindly copy patterns** — MoodEntry is simpler than Post. No need for WatchedList, no images, no isPrivate flag.
3. **Use explicit `: string` type annotation** for VO.create() calls to prevent TypeScript literal inference issues.
4. **Prefer imperative `isSome()`/`unwrap()`** over async `match()` when practical.
5. **`getAuthenticatedUser()` duplication** — Continue using the existing copy-paste pattern (extraction deferred). Copy from any existing controller (e.g., `src/adapters/controllers/post/post.controller.ts`).

### MoodCategory Values (stored lowercase in DB, display with accents in UI)

| DB Value | UI Display |
|---|---|
| calme | Calme |
| enervement | Énervement |
| excitation | Excitation |
| anxiete | Anxiété |
| tristesse | Tristesse |
| bonheur | Bonheur |
| ennui | Ennui |
| nervosite | Nervosité |
| productivite | Productivité |

### Mood Intensity

- Range: 1-10 (integer)
- UI: Slider component from shadcn/ui
- 1 = very low intensity, 10 = very high intensity

### "Update Today's Mood" Logic

- AC#3 requires checking if a mood was already recorded today
- Use `findTodayByUserId()` which queries WHERE `userId = ?` AND `DATE(createdAt) = CURRENT_DATE`
- If found: update existing entry (call `moodEntry.update(category, intensity)`)
- If not found: create new entry
- **Timezone note**: DATE() depends on server timezone (known tech debt from Epic 1). Acceptable for now.

### Project Structure Notes

```
# New files to create
packages/drizzle/src/schema/mood.ts                              # DB schema
src/domain/mood/mood-entry-id.ts                                  # ID class
src/domain/mood/mood-entry.aggregate.ts                           # Aggregate
src/domain/mood/value-objects/mood-category.vo.ts                 # VO
src/domain/mood/value-objects/mood-intensity.vo.ts                # VO
src/domain/mood/events/mood-recorded.event.ts                     # Domain event
src/application/dto/mood/record-mood.dto.ts                       # DTOs
src/application/dto/mood/get-today-mood.dto.ts                    # DTOs
src/application/ports/mood-repository.port.ts                     # Port interface
src/application/use-cases/mood/record-mood.use-case.ts            # Use case
src/application/use-cases/mood/__tests__/record-mood.use-case.test.ts  # Tests
src/adapters/mappers/mood.mapper.ts                               # Mapper (flat)
src/adapters/repositories/mood.repository.ts                      # Repository (flat)
src/adapters/controllers/mood/mood.controller.ts                  # Controller
src/adapters/queries/today-mood.query.ts                          # CQRS query
common/di/modules/mood.module.ts                                  # DI module
app/api/v1/mood/route.ts                                          # API route
app/(protected)/mood/page.tsx                                     # Page
app/(protected)/mood/_components/mood-form.tsx                    # UI component

# Files to modify
packages/drizzle/src/schema/index.ts                              # Add mood export
common/di/types.ts                                                # Add DI symbols + return types
common/di/container.ts                                            # Load mood module
```

### Golden Reference Files

| Purpose | Source File | Adaptation |
|---|---|---|
| Aggregate pattern | `src/domain/post/post.aggregate.ts` | Simpler: no WatchedList, no images, no isPrivate |
| ID pattern | `src/domain/post/post-id.ts` | Identical pattern |
| VO pattern | `src/domain/post/value-objects/post-content.vo.ts` | Same pattern, different validation |
| Domain event | `src/domain/post/events/post-created.event.ts` | Same structure |
| Use case pattern | `src/application/use-cases/post/create-post.use-case.ts` | Add upsert logic (create or update) |
| DTO pattern | `src/application/dto/post/create-post.dto.ts` | Same Zod schema pattern |
| Port pattern | `src/application/ports/post-repository.port.ts` | Add `findTodayByUserId()` |
| Repository | `src/adapters/repositories/post.repository.ts` | Same Drizzle pattern |
| Mapper | `src/adapters/mappers/post.mapper.ts` | Same toPersistence/toDomain pattern |
| Controller | `src/adapters/controllers/post/post.controller.ts` | Same auth + validate + execute pattern |
| CQRS query | `src/adapters/queries/journal.query.ts` | Same direct Drizzle query |
| DI module | `common/di/modules/post.module.ts` | Same bind pattern |
| DB schema | `packages/drizzle/src/schema/post.ts` | Same table definition pattern |
| API route | `app/api/v1/posts/route.ts` | Same re-export pattern |
| Page | `app/(protected)/journal/page.tsx` | Same server component + requireAuth |
| Component | `app/(protected)/journal/_components/journal-entries.tsx` | Client component with fetch |

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1]
- [Source: _bmad-output/planning-artifacts/Architecture.md#Data Architecture - Mood Tracker]
- [Source: _bmad-output/planning-artifacts/Architecture.md#Naming Conventions]
- [Source: _bmad-output/planning-artifacts/prd.md#FR30-FR35]
- [Source: _bmad-output/implementation-artifacts/epic-2-retro-2026-02-08.md#Action Items]
- [Source: _bmad-output/implementation-artifacts/epic-1-retro-2026-02-08.md#Key Insights]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 2.2: Used `z.string().refine()` instead of `z.enum()` due to TypeScript readonly array incompatibility with Zod's enum tuple requirement
- Task 9.1: `pnpm ui:add slider` failed via turbo; used `npx shadcn@latest add slider --yes` directly from packages/ui
- Task 9.1: Fixed slider.tsx import path from `/src/libs/utils` to `../../libs/utils` (shadcn generation issue)
- Task 9.4: Skipped — no existing sidebar/navigation component found to modify
- Task 10: Applied `as number` / `as string` casts on VO.create() calls to avoid TypeScript literal inference trap (Epic 1 lesson)
- Task 11: Fixed unused imports flagged by Biome (Result in aggregate, MoodEntryId in tests)
- All 181 tests pass (15 new mood tests + 166 existing), zero regressions
- type-check passes across all 6 packages
- Biome: 0 errors on mood files (3 pre-existing errors + 40 pre-existing warnings elsewhere)

**Code Review Fixes (Claude Opus 4.6):**
- [HIGH] Added `moodDate` date column + unique index `(userId, moodDate)` to prevent race condition duplicates
- [HIGH] Changed `MoodEntry.create()` return type to `Result<MoodEntry>` (consistent with Post.create())
- [HIGH] Repository `findTodayByUserId` now uses `moodDate` column instead of `DATE(createdAt)`
- [MEDIUM] Exported `moodCategorySchema` from VO; DTO reuses it (eliminated validation duplication)
- [MEDIUM] Extracted `toOutputDto()` private method in RecordMoodUseCase (eliminated DTO mapping duplication)
- [MEDIUM] Fixed double `res.json()` in mood-form.tsx (parse once, branch on result)
- [MEDIUM] Removed comment in mood-form.tsx; fetch error now sets user-visible error state
- [MEDIUM] Added test for empty string category (16 tests total now)
- [MEDIUM] Controller returns 422 instead of 500 for use case failures
- [LOW] Fixed mapper double-get on `updatedAt` (stored in variable)
- [LOW] Made `MoodEntryPersistence.createdAt` required (removed unnecessary optionality)
- Post-review: 182 tests pass (16 mood + 166 existing), type-check OK, Biome clean on mood files

### File List

**New files created:**
- `packages/drizzle/src/schema/mood.ts`
- `apps/nextjs/src/domain/mood/mood-entry-id.ts`
- `apps/nextjs/src/domain/mood/mood-entry.aggregate.ts`
- `apps/nextjs/src/domain/mood/value-objects/mood-category.vo.ts`
- `apps/nextjs/src/domain/mood/value-objects/mood-intensity.vo.ts`
- `apps/nextjs/src/domain/mood/events/mood-recorded.event.ts`
- `apps/nextjs/src/application/dto/mood/record-mood.dto.ts`
- `apps/nextjs/src/application/dto/mood/get-today-mood.dto.ts`
- `apps/nextjs/src/application/ports/mood-repository.port.ts`
- `apps/nextjs/src/application/use-cases/mood/record-mood.use-case.ts`
- `apps/nextjs/src/application/use-cases/mood/__tests__/record-mood.use-case.test.ts`
- `apps/nextjs/src/adapters/mappers/mood.mapper.ts`
- `apps/nextjs/src/adapters/repositories/mood.repository.ts`
- `apps/nextjs/src/adapters/controllers/mood/mood.controller.ts`
- `apps/nextjs/src/adapters/queries/today-mood.query.ts`
- `apps/nextjs/common/di/modules/mood.module.ts`
- `apps/nextjs/app/api/v1/mood/route.ts`
- `apps/nextjs/app/(protected)/mood/page.tsx`
- `apps/nextjs/app/(protected)/mood/_components/mood-form.tsx`
- `packages/drizzle/migrations/0008_concerned_warhawk.sql`

**Modified files:**
- `packages/drizzle/src/schema/index.ts` — Added mood export
- `packages/drizzle/migrations/meta/_journal.json` — Updated migration journal
- `packages/ui/src/components/ui/slider.tsx` — Fixed import path
- `packages/ui/package.json` — Added slider dependency
- `apps/nextjs/common/di/types.ts` — Added IMoodRepository + RecordMoodUseCase symbols/types
- `apps/nextjs/common/di/container.ts` — Added MoodModule registration
- `pnpm-lock.yaml` — Updated lockfile
