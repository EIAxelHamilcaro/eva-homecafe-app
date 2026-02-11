# Story 14.1: Settings & Preferences (Mobile)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **mobile user**,
I want to manage my preferences from the settings screen,
So that I can customize notifications, privacy, and appearance.

## Acceptance Criteria

1. **Given** an authenticated mobile user **When** they navigate to settings **Then** their current preferences are loaded from `GET /api/v1/settings` and reflected in all toggles, checkboxes, radio buttons, and dropdowns (replacing hardcoded useState defaults)

2. **Given** an authenticated mobile user **When** they toggle notification settings (email notifications, push notifications, new messages, friend activity, badges earned, journal reminders) **Then** changes are persisted via `PATCH /api/v1/settings` with the changed fields

3. **Given** an authenticated mobile user **When** they modify privacy settings (profile visibility toggle, rewards visibility dropdown) **Then** changes are persisted via `PATCH /api/v1/settings`

4. **Given** an authenticated mobile user **When** they change custom mode settings (theme mode, language) **Then** changes are persisted via `PATCH /api/v1/settings`

5. **Given** an authenticated mobile user on the settings screen **When** they tap "Se deconnecter" **Then** the sign-out mutation is executed (clear token, clear query cache, redirect to login)

6. **Given** an authenticated mobile user on the settings screen **When** they tap "Supprimer le compte" **Then** a confirmation Alert is shown; on confirm, the sign-out flow is executed (real DeleteAccountUseCase is Epic 15 — for now, sign out only with a warning that full deletion is coming)

7. **Given** an authenticated mobile user on the settings screen **When** they tap "Inviter des ami-es" **Then** the native share sheet opens with the user's friend invite link

8. **Given** the settings API call is loading **When** the screen is first rendered **Then** a loading skeleton is displayed for all preference sections (not a full-screen spinner)

9. **Given** the settings API call fails **When** an error occurs **Then** an error state with retry button is displayed, and an Alert.alert is shown

10. **Given** the profile tab screen **When** implementing the Preferences card (language, time format, profile visible) **Then** connect those dropdowns and toggle to the same `GET/PATCH /api/v1/settings` API, replacing the stub `DropdownField` components

## Tasks / Subtasks

- [x] Task 1: Create types and API hooks for settings (AC: #1, #2, #3, #4, #8, #9)
  - [x] 1.1 Create `apps/expo/types/settings.ts` with `UserPreferences` interface matching backend DTO
  - [x] 1.2 Add `settingsKeys` to `lib/api/hooks/query-keys.ts`
  - [x] 1.3 Create `lib/api/hooks/use-settings.ts` with `useSettings()` query hook and `useUpdateSettings()` mutation hook

- [x] Task 2: Connect settings screen to real API — Load preferences (AC: #1, #8, #9)
  - [x] 2.1 Import `useSettings()` in settings/index.tsx
  - [x] 2.2 Replace all `useState` defaults with values from `useSettings().data`
  - [x] 2.3 Add loading skeleton state for all preference sections
  - [x] 2.4 Add error state with retry button and Alert.alert

- [x] Task 3: Connect Notifications card to API (AC: #2)
  - [x] 3.1 Map UI toggles to backend fields: emailNotifications, pushNotifications
  - [x] 3.2 Map UI checkboxes to backend fields: notifyNewMessages (rename from "Nouveaux messages"), add notifyFriendActivity, notifyBadgesEarned, notifyJournalReminder checkboxes
  - [x] 3.3 Replace `handleSaveNotifications` with `useUpdateSettings()` mutation call
  - [x] 3.4 Show loading state on save button, success/error feedback via Alert.alert

- [x] Task 4: Connect Privacy card to API (AC: #3)
  - [x] 4.1 Connect profileVisibility toggle to `useUpdateSettings()` — auto-save on toggle (no save button)
  - [x] 4.2 Connect rewardsVisibility dropdown to `useUpdateSettings()` — auto-save on change

- [x] Task 5: Connect Custom Mode card to API (AC: #4)
  - [x] 5.1 Connect themeMode radio group to backend (add "system" as third option)
  - [x] 5.2 Remove textSize checkboxes and animations toggle (not in backend — these are UI-only features not in the API)
  - [x] 5.3 Add language dropdown (options: "Francais" → "fr", "English" → "en")
  - [x] 5.4 Add time format dropdown (options: "24h" → "24h", "12h" → "12h")
  - [x] 5.5 Replace `handleSaveCustomMode` with `useUpdateSettings()` mutation call

- [x] Task 6: Implement action handlers (AC: #5, #6, #7)
  - [x] 6.1 Implement `handleLogout` using `useSignOut()` from use-auth.ts — on success, router.replace to login
  - [x] 6.2 Implement `handleDeleteAccount` with Alert.alert confirmation, then sign out (with message "La suppression definitive sera disponible prochainement")
  - [x] 6.3 Implement `handleInviteFriends` using `Share.share()` from react-native with invite link from `useGenerateInvite()`
  - [x] 6.4 Remove `handleDownloadData` stub (not in backend API — keep the button but show Alert "Bientot disponible")

- [x] Task 7: Connect profile tab preferences (AC: #10)
  - [x] 7.1 In `(tabs)/profile.tsx`, import `useSettings()` and `useUpdateSettings()`
  - [x] 7.2 Replace stub `DropdownField` for "Langue" with real Dropdown connected to settings.language
  - [x] 7.3 Replace stub `DropdownField` for "Format heure" with real Dropdown connected to settings.timeFormat
  - [x] 7.4 Connect "Profil visible" Switch to settings.profileVisibility
  - [x] 7.5 Replace "Valider les informations" button with auto-save behavior on change

- [x] Task 8: Remove dead code and clean up (AC: all)
  - [x] 8.1 Remove Security card entirely (twoFactorAuth and connectedDevices are not in backend API — this is mocked UI)
  - [x] 8.2 Remove unused local state variables (emailNotifications, pushNotifications, etc. — now from API)
  - [x] 8.3 Remove unused imports after cleanup
  - [x] 8.4 Run `pnpm fix` for Biome formatting

## Dev Notes

### Backend API Contract (Existing — DO NOT modify backend)

All backend APIs are fully implemented (Story 9.1). The mobile app consumes these endpoints:

| Method | Endpoint | Purpose | Response Shape |
|--------|----------|---------|----------------|
| GET | `/api/v1/settings` | Fetch user preferences (auto-creates defaults if missing) | `UserPreferences` |
| PATCH | `/api/v1/settings` | Update user preferences (partial update) | `UserPreferences` |

**Response Type (GET /api/v1/settings):**

```typescript
interface UserPreferences {
  id: string;
  userId: string;
  emailNotifications: boolean;       // default: true
  pushNotifications: boolean;        // default: true
  notifyNewMessages: boolean;        // default: true
  notifyFriendActivity: boolean;     // default: true
  notifyBadgesEarned: boolean;       // default: true
  notifyJournalReminder: boolean;    // default: true
  profileVisibility: boolean;        // default: true
  rewardsVisibility: "everyone" | "friends" | "nobody";  // default: "friends"
  themeMode: "light" | "dark" | "system";  // default: "system"
  language: "fr" | "en";            // default: "fr"
  timeFormat: "12h" | "24h";        // default: "24h"
  createdAt: string;
  updatedAt: string;
}
```

**Update Request (PATCH /api/v1/settings):**

```typescript
// All fields optional — only send changed fields
interface UpdateSettingsInput {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  notifyNewMessages?: boolean;
  notifyFriendActivity?: boolean;
  notifyBadgesEarned?: boolean;
  notifyJournalReminder?: boolean;
  profileVisibility?: boolean;
  rewardsVisibility?: "everyone" | "friends" | "nobody";
  themeMode?: "light" | "dark" | "system";
  language?: "fr" | "en";
  timeFormat?: "12h" | "24h";
}
```

### Architecture Compliance

- **API Client**: Use existing `lib/api/client.ts` — NEVER create a new client
- **Auth Tokens**: Handled automatically by `ApiClient` (SecureStore + in-memory cache)
- **TanStack Query**: Create new hooks following the exact pattern from `use-notifications.ts` / `use-mood.ts`
- **Error Handling**: Use `ApiError` class, display via Alert.alert for persistent errors
- **NativeWind Styling**: All styles via Tailwind classNames, not StyleSheet
- **Type Everything**: No `any`, use proper TypeScript interfaces from `types/` folder

### UI vs Backend Mapping (CRITICAL — Mismatch Resolution)

The current settings UI has sections that DO NOT match the backend. Here's the definitive mapping:

**Notifications Card — MODIFY to match backend:**

| Current UI | Backend Field | Action |
|------------|---------------|--------|
| "Notifications par e-mail" toggle | `emailNotifications` | Keep, connect |
| "Notifications push" toggle | `pushNotifications` | Keep, connect |
| "Nouveaux messages" checkbox | `notifyNewMessages` | Keep, connect |
| "Invitations" checkbox | ~~none~~ | **REPLACE** with `notifyFriendActivity` ("Activite des amis") |
| *(missing)* | `notifyBadgesEarned` | **ADD** checkbox "Badges obtenus" |
| *(missing)* | `notifyJournalReminder` | **ADD** checkbox "Rappel journal" |

**Security Card — REMOVE entirely:**

| Current UI | Backend Field | Action |
|------------|---------------|--------|
| "Double authentification" toggle | ~~none~~ | **REMOVE** (not in API) |
| "Appareils connectes" list | ~~none~~ | **REMOVE** (not in API) |

**Privacy Card — KEEP as-is, connect:**

| Current UI | Backend Field | Action |
|------------|---------------|--------|
| "Profil visible" toggle | `profileVisibility` | Connect |
| "Qui peut voir mes recompenses" dropdown | `rewardsVisibility` | Connect |
| "Telecharger mes donnees" button | ~~none~~ | Keep button, show "Bientot disponible" alert |

**Custom Mode Card — MODIFY to match backend:**

| Current UI | Backend Field | Action |
|------------|---------------|--------|
| Theme radio (light/dark) | `themeMode` | **ADD** "system" option |
| "Taille du texte" checkboxes | ~~none~~ | **REMOVE** (not in API) |
| "Animations" toggle | ~~none~~ | **REMOVE** (not in API) |
| *(missing)* | `language` | **ADD** language dropdown |
| *(missing)* | `timeFormat` | **ADD** time format dropdown |

### Existing Hooks to USE (already implemented)

| Hook | File | Purpose |
|------|------|---------|
| `useSignOut()` | `lib/api/hooks/use-auth.ts` | Sign out (clears token + cache) |
| `useGenerateInvite()` | `lib/api/hooks/use-invite.ts` | Get friend invite URL for sharing |

### New Hooks to CREATE

| Hook | File | Purpose |
|------|------|---------|
| `useSettings()` | `lib/api/hooks/use-settings.ts` | Fetch preferences from GET /api/v1/settings |
| `useUpdateSettings()` | `lib/api/hooks/use-settings.ts` | Update preferences via PATCH /api/v1/settings |

### New Files to Create

```
apps/expo/types/settings.ts                    # UserPreferences type + UpdateSettingsInput
apps/expo/lib/api/hooks/use-settings.ts        # useSettings() + useUpdateSettings()
```

### Files to Modify

```
apps/expo/app/(protected)/settings/index.tsx   # Major rewrite: connect all sections to API
apps/expo/app/(protected)/(tabs)/profile.tsx   # Connect preferences card to API
apps/expo/lib/api/hooks/query-keys.ts          # Add settingsKeys
```

### Hook Implementation Patterns (from existing codebase)

**Query hook pattern (follow use-notifications.ts):**
```typescript
export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.my(),
    queryFn: () => api.get<UserPreferences>("/api/v1/settings"),
    staleTime: 1000 * 60 * 5,  // 5 minutes
  });
}
```

**Mutation hook pattern (follow use-profile.ts):**
```typescript
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSettingsInput) =>
      api.patch<UserPreferences>("/api/v1/settings", input),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.my(), data);  // Direct cache update
    },
  });
}
```

### Save Strategy Decision

Two patterns for saving settings changes:

**Option A — Auto-save on change (Privacy card):** Each toggle/dropdown immediately PATCHes the changed field. Best for simple binary toggles where immediate feedback is expected.

**Option B — Explicit save button (Notifications card, Custom Mode card):** User makes multiple changes, then taps "Enregistrer" to batch-save. Best for grouped settings where users typically change multiple values.

**Recommendation:** Use Option A for Privacy (single toggles), Option B for Notifications and Custom Mode (grouped preferences with save button).

### Profile Tab Integration

The profile tab at `(tabs)/profile.tsx` has a "Preferences" card with stub dropdowns for Language and Time Format. These should connect to the SAME settings API. Share the `useSettings()` and `useUpdateSettings()` hooks.

Current profile tab code to replace:
```typescript
// Current: stub DropdownField component
function DropdownField({ label }: { label: string }) {
  return (
    <Pressable className="flex-row items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <ChevronDown size={16} color="#8D7E7E" />
    </Pressable>
  );
}
```

Replace with real Dropdown components connected to settings API.

### Library Versions (Already Installed — DO NOT upgrade or install new)

| Library | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | 5.67.3 | Server state management |
| `expo-router` | 6.0.21 | File-based routing |
| `nativewind` | 4.1.23 | Tailwind CSS for RN |
| `lucide-react-native` | (installed) | Icons |
| `react-native` | 0.81 | Core framework |

### Critical Guardrails

1. **DO NOT modify any backend code** — all APIs are implemented and working
2. **DO NOT install new libraries** — everything needed is already installed
3. **DO NOT create hooks that already exist** — check `lib/api/hooks/` first
4. **REMOVE Security card** — twoFactorAuth and connectedDevices are NOT in the backend API
5. **REMOVE textSize and animations** — NOT in the backend API; add language and timeFormat instead
6. **ADD missing notification types** — backend has 4 notification sub-types, UI only shows 2
7. **Share hooks between screens** — settings screen AND profile tab use same `useSettings()` hook
8. **Auto-save for privacy toggles** — don't require explicit save for binary privacy settings
9. **Alert.alert for feedback** — show success/error feedback via native alerts (learned from code review 13.1/13.2)
10. **Clean imports** — remove unused imports after dead code removal (Biome flags as errors)
11. **handleDeleteAccount is NOT the real delete** — Epic 15 implements DeleteAccountUseCase; for now, sign out only with disclaimer
12. **Share.share() for invite** — use React Native's built-in Share API, NOT a custom implementation

### Previous Story Intelligence (13.2 — Dashboard Widgets Real API Connection)

**Key Learnings:**
- Loading skeletons preferred over ActivityIndicator for visual consistency
- Remove dead code proactively (Biome flags unused imports as errors)
- Code review catches: always add loading/error/empty states
- Graceful degradation: widgets should still render even if API call fails
- Alert.alert for persistent error feedback
- Timezone bugs in date formatting — use explicit locale formatting

**Code Review Patterns to Follow:**
- H1: Use loading skeletons, not just ActivityIndicator
- M2: Hardcoded colors should use theme reference
- L1: Remove dead/unused code immediately

### Git Intelligence (Recent Commits)

```
15b8e84 docs: add epic 13 retrospective and update sprint status
f4a80a0 feat(expo): implement story 13.2 — dashboard widgets real API connection mobile with code review fixes
18a681f feat(expo): implement story 13.1 — stickers & badge collections mobile with code review fixes
```

**Pattern**: All mobile stories follow commit format: `feat(expo): implement story X.Y — description with code review fixes`.

### Project Structure Notes

- Settings screen: `apps/expo/app/(protected)/settings/index.tsx`
- Profile tab: `apps/expo/app/(protected)/(tabs)/profile.tsx`
- API hooks: `apps/expo/lib/api/hooks/`
- Query keys: `apps/expo/lib/api/hooks/query-keys.ts`
- Types: `apps/expo/types/`
- UI components (reusable): `apps/expo/components/ui/` (Button, Card, Toggle, Checkbox, Dropdown, RadioGroup)

### Scope Sizing

This is a **medium story** — 2 new files, 3 modified files. The main effort is in settings/index.tsx (significant rewrite) and profile.tsx (moderate changes). Estimated: ~200-300 lines changed/added total.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 14: Story 14.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Client Strategy — Platform-Native, No Sharing]
- [Source: _bmad-output/implementation-artifacts/13-2-dashboard-widgets-real-api-connection-mobile.md — Previous story learnings]
- [Source: apps/nextjs/src/adapters/controllers/settings/settings.controller.ts — Backend settings API]
- [Source: apps/nextjs/src/application/dto/user-preference/user-preference.dto.ts — Backend DTO schema]
- [Source: apps/expo/app/(protected)/settings/index.tsx — Current mobile settings UI (6 TODO handlers)]
- [Source: apps/expo/app/(protected)/(tabs)/profile.tsx — Profile tab with stub preferences]
- [Source: apps/expo/lib/api/hooks/use-auth.ts — useSignOut() hook]
- [Source: apps/expo/lib/api/hooks/use-invite.ts — useGenerateInvite() hook]
- [Source: apps/expo/lib/api/hooks/query-keys.ts — Query key patterns]
- [Source: apps/expo/lib/api/client.ts — API client with auth token management]
- [Source: apps/expo/types/profile.ts — Type file pattern to follow]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Created `UserPreferences` and `UpdateSettingsInput` types matching backend DTO exactly
- Created `useSettings()` query hook (staleTime: 5min) and `useUpdateSettings()` mutation hook with optimistic cache update
- Added `settingsKeys` to centralized query-keys.ts
- Rewrote settings screen: replaced all hardcoded useState with API-driven state via useEffect sync
- Added SettingsSkeleton component for loading state (3 card placeholders with animated bars)
- Added error state with retry button and Alert.alert feedback
- Notifications card: 2 toggles (email, push) + 4 checkboxes (newMessages, friendActivity, badgesEarned, journalReminder) with explicit save button
- Privacy card: auto-save on toggle/dropdown change (profileVisibility, rewardsVisibility)
- Custom Mode card: theme radio with "system" option, language/timeFormat dropdowns, explicit save button
- Removed Security card entirely (twoFactorAuth/connectedDevices not in backend)
- Removed textSize checkboxes and animations toggle (not in backend)
- Implemented handleLogout (useSignOut → router.replace to login)
- Implemented handleDeleteAccount (Alert confirmation → sign out with "disponible prochainement" message)
- Implemented handleInviteFriends (Share.share with invite URL from useGenerateInvite)
- handleDownloadData shows "Bientôt disponible" alert
- Profile tab: replaced stub DropdownField with real Dropdown components connected to settings API
- Profile tab: replaced Switch with Toggle component, auto-save on change
- Profile tab: removed "Valider les informations" button (auto-save behavior)
- Removed all unused imports (Monitor, Smartphone, ChevronDown, useState from profile, Switch)
- All quality checks pass: Biome clean, type-check clean, 389 tests passing

### Change Log

- 2026-02-11: Implemented story 14.1 — Settings & Preferences Mobile. Connected settings screen and profile tab to real GET/PATCH /api/v1/settings API. Removed dead Security card and UI-only features not backed by API. Added loading skeleton, error state, and proper action handlers.

### File List

New files:
- apps/expo/types/settings.ts
- apps/expo/lib/api/hooks/use-settings.ts

Modified files:
- apps/expo/lib/api/hooks/query-keys.ts
- apps/expo/app/(protected)/settings/index.tsx
- apps/expo/app/(protected)/(tabs)/profile.tsx
- _bmad-output/implementation-artifacts/sprint-status.yaml
