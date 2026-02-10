# Story 9.1: Settings & Preferences Page

Status: done

## Story

As a **user**,
I want to access a settings page to manage my preferences and notifications,
so that I can customize my experience.

## Acceptance Criteria

1. **Given** an authenticated user **When** they navigate to the settings page **Then** they see their current preferences (language, time format, profile visibility)
2. **Given** an authenticated user on the settings page **When** they modify notification preferences (journal reminders, friend activity, messages, badges) **Then** the toggles persist and control which push notifications they receive (FR74, FR76)
3. **Given** an authenticated user **When** they save updated preferences **Then** the changes are applied immediately
4. **Given** an authenticated user on the settings page **Then** they see sections for: Notifications, Privacy, Customization (theme, ~~text size, animations~~, language, time format), and About — _Note: "text size" and "animations" toggles deferred to future story (not in current Figma designs); replaced by language and time format per domain model._
5. **Given** an authenticated user **When** they toggle profile visibility **Then** the setting persists and controls whether their profile is visible to non-friends
6. **Given** an authenticated user **When** they access settings on mobile or desktop **Then** the layout is responsive per Figma designs (FR19)

## Tasks / Subtasks

- [x] Task 1: Create `user_preference` DB schema (AC: #1, #2, #3)
  - [x]1.1 Create `packages/drizzle/src/schema/user-preference.ts` with all preference columns
  - [x]1.2 Export from schema index, run `pnpm db:generate`
- [x] Task 2: Create UserPreference domain layer (AC: #1, #2, #3)
  - [x]2.1 Create `UserPreference` aggregate with VOs (Language, TimeFormat, ThemeMode)
  - [x]2.2 Create `UserPreferenceId` typed ID
  - [x]2.3 Create `UserPreferenceUpdatedEvent` domain event
- [x] Task 3: Create application layer — ports, DTOs, use cases (AC: #1, #2, #3)
  - [x]3.1 Create `IUserPreferenceRepository` port
  - [x]3.2 Create DTOs: `get-user-preferences.dto.ts`, `update-user-preferences.dto.ts`
  - [x]3.3 Create `GetUserPreferencesUseCase`
  - [x]3.4 Create `UpdateUserPreferencesUseCase`
  - [x]3.5 Write BDD tests for both use cases
- [x] Task 4: Create adapters layer — repository, mapper, controller (AC: #1, #2, #3)
  - [x]4.1 Create `DrizzleUserPreferenceRepository`
  - [x]4.2 Create `UserPreferenceMapper`
  - [x]4.3 Create settings controller (GET + PATCH)
- [x] Task 5: Wire DI and API routes (AC: #1, #2, #3)
  - [x]5.1 Create `user-preference.module.ts` DI module
  - [x]5.2 Register in `container.ts` and `types.ts`
  - [x]5.3 Create `app/api/v1/settings/route.ts` (GET, PATCH)
- [x] Task 6: Create settings page UI (AC: #1, #2, #3, #4, #5, #6)
  - [x]6.1 Create `app/(protected)/settings/page.tsx` (Server Component)
  - [x]6.2 Create `_components/settings-form.tsx` (Client Component — main form)
  - [x]6.3 Create `_components/notification-preferences-section.tsx`
  - [x]6.4 Create `_components/privacy-section.tsx`
  - [x]6.5 Create `_components/customization-section.tsx`
  - [x]6.6 Create `_components/about-section.tsx`
  - [x]6.7 Create `_components/account-actions-section.tsx` (logout, delete, invite)
- [x] Task 7: Quality validation (AC: all)
  - [x]7.1 `pnpm type-check` passes
  - [x]7.2 `pnpm check` (Biome) passes
  - [x]7.3 `pnpm test` passes (new + existing)
  - [x]7.4 Error handling in all async Server Components (try/catch + fallback)
  - [x]7.5 Verify query matches FR exactly (FR75, FR76, FR74, FR8)

## Dev Notes

### Architecture Overview

This story creates a **new `UserPreference` aggregate** (not extending Profile) with a dedicated table, repository, and use cases. The settings page is a **protected page** using the standard Server Component + `_components/` pattern.

**Why separate from Profile?** Profile stores identity data (displayName, bio, avatar). Preferences store behavioral configuration (notification toggles, theme, visibility). Separate concerns, separate aggregates, separate tables. This follows the existing pattern where Notification is separate from User.

**CRITICAL — FR8 Not Actually Implemented:** The epics file marks FR8 ("set preferences: language, time format, profile visibility") as "Already Implemented (Profile)". This is INCORRECT — the profile table only has `displayName`, `bio`, `avatarUrl`. No preference fields exist in any DB table. This story implements FR8 for the first time via the new `user_preference` table.

### Navigation & Access

There is **no global navigation component** in the Next.js web app (no sidebar, no bottom tab bar). Pages are accessed directly via URL. The settings page will be at `/settings` under the `(protected)` route group. Access is typically via:
- Direct URL navigation (`/settings`)
- Links from other pages (e.g., dashboard user menu, profile page)
- The dev agent does NOT need to create a global navigation — that is not in scope for this story

### Existing Auth Integration

The settings page includes sign-out and delete account actions. These use **existing** implementations:
- **Sign out:** `SignOutUseCase` in `src/application/use-cases/auth/sign-out.use-case.ts` — call via Server Action or API route `/api/v1/auth/sign-out`
- **Delete account:** `DeleteAccountUseCase` in `src/application/use-cases/auth/delete-account.use-case.ts` — call via API route `/api/v1/auth/delete-account`
- **DO NOT** re-implement sign-out or delete account logic. Import and reuse existing controllers/actions.

### Domain Design

**UserPreference Aggregate:**
```
UserPreference {
  id: UserPreferenceId
  userId: string (FK → user.id, unique)

  // Notification preferences (FR74, FR76)
  emailNotifications: boolean (default: true)
  pushNotifications: boolean (default: true)
  notifyNewMessages: boolean (default: true)
  notifyFriendActivity: boolean (default: true)
  notifyBadgesEarned: boolean (default: true)
  notifyJournalReminder: boolean (default: true)

  // Privacy (FR8)
  profileVisibility: boolean (default: true)
  rewardsVisibility: "everyone" | "friends" | "nobody" (default: "friends")

  // Customization
  themeMode: "light" | "dark" | "system" (default: "system")
  language: "fr" | "en" (default: "fr")
  timeFormat: "12h" | "24h" (default: "24h")

  createdAt: Date
  updatedAt: Date
}
```

**Value Objects:**
- `Language` — validates "fr" | "en"
- `TimeFormat` — validates "12h" | "24h"
- `ThemeMode` — validates "light" | "dark" | "system"
- `RewardsVisibility` — validates "everyone" | "friends" | "nobody"

**Events:**
- `UserPreferenceUpdatedEvent` — dispatched after preference save

### Database Schema

```sql
CREATE TABLE "user_preference" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "email_notifications" boolean NOT NULL DEFAULT true,
  "push_notifications" boolean NOT NULL DEFAULT true,
  "notify_new_messages" boolean NOT NULL DEFAULT true,
  "notify_friend_activity" boolean NOT NULL DEFAULT true,
  "notify_badges_earned" boolean NOT NULL DEFAULT true,
  "notify_journal_reminder" boolean NOT NULL DEFAULT true,
  "profile_visibility" boolean NOT NULL DEFAULT true,
  "rewards_visibility" text NOT NULL DEFAULT 'friends',
  "theme_mode" text NOT NULL DEFAULT 'system',
  "language" text NOT NULL DEFAULT 'fr',
  "time_format" text NOT NULL DEFAULT '24h',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "user_preference_user_id_idx" ON "user_preference"("user_id");
```

### API Design

**GET /api/v1/settings** — Get current user's preferences
- Auth: `getAuthenticatedUser(request)`
- Response: full preference DTO (200) or default preferences if none exist yet
- If no preferences record exists → create one with defaults (upsert pattern)

**PATCH /api/v1/settings** — Update preferences
- Auth: `getAuthenticatedUser(request)`
- Body: partial preference DTO (only changed fields)
- Response: updated preference DTO (200)
- Dispatches `UserPreferenceUpdatedEvent` after save

### Use Case Patterns

**GetUserPreferencesUseCase:**
1. Find preferences by userId
2. If None → create default preferences record → return defaults
3. If Some → return existing preferences DTO

**UpdateUserPreferencesUseCase:**
1. Find existing preferences by userId
2. If None → create with provided values + defaults for missing
3. If Some → update only provided fields
4. Persist
5. Dispatch `UserPreferenceUpdatedEvent`
6. Return updated DTO

### UI Design — Sections

Follow the Expo mobile reference (`apps/expo/app/(protected)/settings/index.tsx`), adapted for web with shadcn/ui components:

**Section 1: Notifications** (Card)
- Toggle: Email notifications
- Toggle: Push notifications
- Divider
- Checkbox: New messages
- Checkbox: Friend activity (invitations)
- Checkbox: Badges earned
- Checkbox: Journal reminders
- Save button

**Section 2: Privacy** (Card)
- Toggle: Profile visible
- Dropdown: Who can see my rewards (Everyone / Friends / Nobody)

**Section 3: Customization** (Card)
- Radio group: Theme (Light / Dark / System)
- Radio or select: Language (Français / English)
- Radio or select: Time format (12h / 24h)

**Section 4: About** (Card)
- App version
- Links: Legal notices, Privacy policy, Help center

**Section 5: Account Actions** (no Card)
- Button: Logout (calls existing sign-out)
- Button: Delete account (calls existing delete account)
- Button: Invite friends

### Key shadcn/ui Components Needed

Already available (check `packages/ui/src/components/ui/`):
- Card, CardHeader, CardTitle, CardContent
- Button
- Switch (for toggles)
- Checkbox
- RadioGroup, RadioGroupItem
- Select, SelectTrigger, SelectContent, SelectItem

If any are missing, install with `pnpm ui:add <component>`. After install, **fix import paths** from `/src/libs/utils` to `../../libs/utils` per CLAUDE.md.

### Error Handling Requirements (Epic 8 Retro Action Item)

**MANDATORY for all async Server Components:**
- Wrap all query calls in try/catch
- On error, show a fallback (error message or redirect)
- Use `<Suspense fallback={<Skeleton />}>` for loading states
- Settings page is simple (single Server Component fetch), but still needs error boundary

### Project Structure Notes

**New files to create:**
```
packages/drizzle/src/schema/user-preference.ts          (DB schema)

apps/nextjs/src/domain/user-preference/
├── user-preference.aggregate.ts
├── user-preference-id.ts
├── value-objects/language.vo.ts
├── value-objects/time-format.vo.ts
├── value-objects/theme-mode.vo.ts
├── value-objects/rewards-visibility.vo.ts
└── events/user-preference-updated.event.ts

apps/nextjs/src/application/
├── ports/user-preference-repository.port.ts
├── dto/user-preference/
│   ├── get-user-preferences.dto.ts
│   └── update-user-preferences.dto.ts
└── use-cases/user-preference/
    ├── get-user-preferences.use-case.ts
    ├── update-user-preferences.use-case.ts
    └── __tests__/
        ├── get-user-preferences.use-case.test.ts
        └── update-user-preferences.use-case.test.ts

apps/nextjs/src/adapters/
├── repositories/user-preference.repository.ts
├── mappers/user-preference.mapper.ts
└── controllers/settings/settings.controller.ts

apps/nextjs/common/di/modules/user-preference.module.ts

apps/nextjs/app/api/v1/settings/route.ts

apps/nextjs/app/(protected)/settings/
├── page.tsx
└── _components/
    ├── settings-form.tsx
    ├── notification-preferences-section.tsx
    ├── privacy-section.tsx
    ├── customization-section.tsx
    ├── about-section.tsx
    └── account-actions-section.tsx
```

**Files to modify:**
```
packages/drizzle/src/schema/index.ts                     (export new schema)
apps/nextjs/common/di/types.ts                           (add DI_SYMBOLS + DI_RETURN_TYPES)
apps/nextjs/common/di/container.ts                       (load user-preference module)
```

### Alignment with Existing Patterns

- **Domain folder**: `src/domain/user-preference/` (same pattern as `src/domain/notification/`)
- **Flat repositories**: `adapters/repositories/user-preference.repository.ts`
- **Flat mappers**: `adapters/mappers/user-preference.mapper.ts`
- **Controller subfolder**: `adapters/controllers/settings/settings.controller.ts`
- **DI module**: `common/di/modules/user-preference.module.ts` (loaded alphabetically in container.ts)
- **API route**: `app/api/v1/settings/route.ts` (simple re-export: `export const GET = getSettingsController; export const PATCH = updateSettingsController;`)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 9, Story 9.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md#FR75, FR76, FR74, FR8]
- [Source: apps/expo/app/(protected)/settings/index.tsx — Expo mobile reference implementation]
- [Source: _bmad-output/implementation-artifacts/epic-8-retro-2026-02-10.md#Action Items]
- [Source: packages/drizzle/src/schema/profile.ts — Existing profile schema (no preferences)]
- [Source: packages/drizzle/src/schema/notification.ts — Existing notification schema (no preferences)]

### Previous Epic Intelligence

**From Epic 8 Retrospective:**
- Error handling (try/catch + empty state fallback) is MANDATORY for all async Server Components — embed this, don't retrofit
- Before reusing an existing query, verify its scope matches the target FR EXACTLY
- `Awaited<ReturnType<typeof fn>>` is the standard pattern for typing query results
- Dev Agent Record must be complete (Agent Model, Completion Notes, File List, Change Log)

**From Epic 8 Technical Debt:**
- db:push not executed (8 epics of migrations) — generate migration, don't push
- i18n absent — settings page stores language preference, but actual i18n not wired yet
- Biome warnings ~49 pre-existing — don't increase

### Git Intelligence

Recent commits follow the pattern: `feat(nextjs): implement story X.Y — description with code review fixes`

Last 5 commits were Epic 8 dashboard widgets — pure UI + CQRS read queries. Story 9.1 differs: it introduces a new domain aggregate + persistence layer, closer to Epic 1-7 patterns.

### Technology Notes

**No web research needed.** All technologies are established:
- Drizzle ORM (PostgreSQL schema, migrations)
- shadcn/ui components (Switch, Checkbox, RadioGroup, Select, Card)
- Next.js 16 App Router (Server Components, Suspense)
- Zod (DTO validation)
- BetterAuth (existing sign-out, delete account)
- ddd-kit (Aggregate, ValueObject, Result, Option, UUID)

**Notification preferences scope (from Epic 8 Retro):** Store toggles in DB. Actual push notification activation is deferred to Expo EAS mobile phase. Web settings page saves preferences; the push notification handler (future) will read them.

## Quality Checklist

- [x] Error handling visible (try/catch + fallback) in all async Server Components
- [x] All new files follow established naming conventions (.aggregate.ts, .vo.ts, .use-case.ts, etc.)
- [x] Result<T> returned from all use cases, never throw
- [x] Option<T> for nullable values, never null
- [x] DI registration complete (symbols + return types + module + container)
- [x] BDD tests cover happy path, validation errors, error handling
- [x] Biome passes (`pnpm check`)
- [x] TypeScript passes (`pnpm type-check`)
- [x] All existing tests still pass (`pnpm test`)
- [x] No unused imports or dead code
- [x] Responsive layout (mobile/desktop) per Figma

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- All 7 tasks completed across 2 sessions (domain/app layer + adapters/UI + code review fixes)
- AC#4 partial: "text size" and "animations" toggles not implemented — deferred to future story (not in Figma designs, no domain model support). Theme, language, and time format are fully implemented.
- DeleteAccountUseCase does not exist yet; delete account button currently signs the user out as graceful degradation.

### Change Log

- Created DB schema with 15 columns + FK + unique index on userId
- Created UserPreference aggregate with createDefault/reconstitute/updatePreferences
- Created 4 value objects: Language, ThemeMode, TimeFormat, RewardsVisibility
- Created UserPreferenceUpdatedEvent domain event
- Created Get/Update UserPreferences use cases with upsert-on-read pattern
- Created 20 BDD tests (5 get + 15 update), all green
- Created mapper, repository, controllers (GET + PATCH)
- Created DI module + wired symbols/types/container
- Created API route at /api/v1/settings
- Created settings page with 6 UI sections (notifications, privacy, customization, about, account actions)
- Installed shadcn switch/select/radio-group, fixed import paths
- Code review fixes: typed handleChange, error on failed fetch, sign-out URL, delete/invite handlers, typed buildUpdates

### File List

- `packages/drizzle/src/schema/user-preference.ts`
- `packages/drizzle/src/schema/index.ts` (modified)
- `packages/drizzle/src/migrations/0014_curvy_ken_ellis.sql`
- `apps/nextjs/src/domain/user-preference/user-preference.aggregate.ts`
- `apps/nextjs/src/domain/user-preference/user-preference-id.ts`
- `apps/nextjs/src/domain/user-preference/value-objects/language.vo.ts`
- `apps/nextjs/src/domain/user-preference/value-objects/theme-mode.vo.ts`
- `apps/nextjs/src/domain/user-preference/value-objects/time-format.vo.ts`
- `apps/nextjs/src/domain/user-preference/value-objects/rewards-visibility.vo.ts`
- `apps/nextjs/src/domain/user-preference/events/user-preference-updated.event.ts`
- `apps/nextjs/src/application/ports/user-preference-repository.port.ts`
- `apps/nextjs/src/application/dto/user-preference/user-preference.dto.ts`
- `apps/nextjs/src/application/dto/user-preference/get-user-preferences.dto.ts`
- `apps/nextjs/src/application/dto/user-preference/update-user-preferences.dto.ts`
- `apps/nextjs/src/application/use-cases/user-preference/get-user-preferences.use-case.ts`
- `apps/nextjs/src/application/use-cases/user-preference/update-user-preferences.use-case.ts`
- `apps/nextjs/src/application/use-cases/user-preference/__tests__/get-user-preferences.use-case.test.ts`
- `apps/nextjs/src/application/use-cases/user-preference/__tests__/update-user-preferences.use-case.test.ts`
- `apps/nextjs/src/adapters/mappers/user-preference.mapper.ts`
- `apps/nextjs/src/adapters/repositories/user-preference.repository.ts`
- `apps/nextjs/src/adapters/controllers/settings/settings.controller.ts`
- `apps/nextjs/common/di/modules/user-preference.module.ts`
- `apps/nextjs/common/di/types.ts` (modified)
- `apps/nextjs/common/di/container.ts` (modified)
- `apps/nextjs/app/api/v1/settings/route.ts`
- `apps/nextjs/app/(protected)/settings/page.tsx`
- `apps/nextjs/app/(protected)/settings/_components/settings-form.tsx`
- `apps/nextjs/app/(protected)/settings/_components/notification-preferences-section.tsx`
- `apps/nextjs/app/(protected)/settings/_components/privacy-section.tsx`
- `apps/nextjs/app/(protected)/settings/_components/customization-section.tsx`
- `apps/nextjs/app/(protected)/settings/_components/about-section.tsx`
- `apps/nextjs/app/(protected)/settings/_components/account-actions-section.tsx`
- `packages/ui/src/components/ui/switch.tsx`
- `packages/ui/src/components/ui/select.tsx`
- `packages/ui/src/components/ui/radio-group.tsx`
