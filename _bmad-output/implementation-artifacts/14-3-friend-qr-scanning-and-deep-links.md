# Story 14.3: Friend QR Scanning & Deep Links

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **mobile user**,
I want to scan a friend's QR code to add them instantly,
So that connecting with friends is frictionless.

## Acceptance Criteria

1. **Given** a mobile user **When** they open the QR scanner (expo-camera) **Then** scanning a valid friend QR code sends a friend request via API and shows a success confirmation

2. **Given** a user who receives a friend invite link **When** they tap the link on their phone **Then** they are deep-linked to the app with the friend code pre-filled (if authenticated, auto-accepts; if not, redirects to register with invite token preserved)

3. **Given** a mobile user on the add friend screen **When** they enter a friend invite code manually **Then** the invite is accepted via `/api/v1/friends/invite/accept` and a friend connection is established

4. **Given** a non-authenticated user who taps an invite deep link **When** they complete registration **Then** the invite token is automatically accepted post-registration (FR14: auto-connect on sign-up via friend code)

5. **Given** a mobile user on the QR code screen **When** they tap "Share" **Then** the native share sheet opens with the invite URL as shareable text (not a file)

6. **Given** an invite link shared via messaging or social media **When** the recipient taps the HTTPS link (production) **Then** Universal Links (iOS) / App Links (Android) open the app directly instead of the browser

7. **Given** any error during QR scan or invite acceptance (expired token, invalid code, self-invite, already friends) **When** the error occurs **Then** a clear, localized error message is displayed with an appropriate recovery action

## Tasks / Subtasks

- [x] Task 1: Fix QR scanning token extraction bug — CRITICAL (AC: #1, #7)
  - [x] 1.1 In `app/(protected)/friends/scan.tsx`, fix `extractTokenFromUrl()` — current code searches `urlObj.searchParams.get("token")` but the QR URL format is `evahomecafeapp://invite/UUID` (token is in the PATH, not query params). Fix: extract token from URL pathname via `new URL(url).pathname.split("/").pop()`, with fallback to `url.split("/").pop()` for malformed URLs, and final fallback to raw string if 32-36 chars (bare UUID)
  - [x] 1.2 Add handling for both URL formats: custom scheme (`evahomecafeapp://invite/TOKEN`) and HTTPS (`https://homecafe.app/invite/TOKEN`) — both should extract the token correctly
  - [x] 1.3 Add better error messages: "QR code invalide" → differentiate between "QR code non reconnu" (not a URL) and "Lien d'invitation invalide" (URL but no token)

- [x] Task 2: Fix share button on QR code screen (AC: #5)
  - [x] 2.1 In `app/(protected)/friends/qr-code.tsx`, replace `import * as Sharing from "expo-sharing"` with `import { Share } from "react-native"`
  - [x] 2.2 Replace `Sharing.shareAsync(data.inviteUrl, { dialogTitle: "..." })` with `Share.share({ message: data.inviteUrl, title: "Rejoins-moi sur HomeCafe" })`
  - [x] 2.3 Remove `expo-sharing` import (keep the package installed — may be used elsewhere)

- [x] Task 3: Add friend code/token manual input to add screen (AC: #3)
  - [x] 3.1 In `app/(protected)/friends/add.tsx`, add a segmented toggle at the top: "Email" | "Code d'invitation" (two input modes)
  - [x] 3.2 "Email" mode: keep existing email input + `useSendFriendRequest()` flow (unchanged)
  - [x] 3.3 "Code d'invitation" mode: show a text input for invite token/code (UUID format), with placeholder "Collez le code d'invitation"
  - [x] 3.4 Code mode submit: call `useAcceptInvite()` with the entered token — handle success (friend added) and errors (expired, invalid, self-invite, already friends)
  - [x] 3.5 Update status messages for code mode: add appropriate French status text for accept results
  - [x] 3.6 Auto-detect pasted content: if the user pastes a full URL (`evahomecafeapp://invite/TOKEN` or `https://...`), auto-extract the token portion

- [x] Task 4: Handle invite param in register screen — FR14 auto-connect (AC: #2, #4)
  - [x] 4.1 In `app/(auth)/register.tsx`, read the `invite` search param via `useLocalSearchParams()` from expo-router
  - [x] 4.2 After successful sign-up (`onSuccess`), check if `invite` param exists
  - [x] 4.3 If invite token present: call `useAcceptInvite()` to auto-accept the invite before navigating to protected area
  - [x] 4.4 Handle accept failure gracefully: if the invite accept fails (expired, invalid), still proceed to the app — don't block registration flow. Show a brief toast/alert: "L'invitation a expire, demandez un nouveau code a votre ami"
  - [x] 4.5 Verify the redirect from `invite/[token].tsx` passes the token correctly: `<Redirect href={/(auth)/register?invite=${token}} />`

- [x] Task 5: Configure Universal Links (iOS) and App Links (Android) (AC: #6)
  - [x] 5.1 In `app.json`, add iOS `associatedDomains`: `["applinks:homecafe.app"]` (domain TBD — use placeholder, will be finalized in Epic 15)
  - [x] 5.2 In `app.json`, add Android `intentFilters` for HTTPS deep links:
    ```json
    "intentFilters": [{
      "action": "VIEW",
      "autoVerify": true,
      "data": [{ "scheme": "https", "host": "homecafe.app", "pathPrefix": "/invite" }],
      "category": ["BROWSABLE", "DEFAULT"]
    }]
    ```
  - [x] 5.3 NOTE: The server-side verification files (`apple-app-site-association` for iOS, `.well-known/assetlinks.json` for Android) will be created during production deployment (Story 15.1). For now, the app-side config is prepared.
  - [x] 5.4 Ensure `expo-router` linking configuration handles both custom scheme and HTTPS deep link URLs correctly

- [x] Task 6: Polish deep link flow and error handling (AC: #2, #7)
  - [x] 6.1 In `invite/[token].tsx`, improve error messages: map API errors to user-friendly French messages:
    - "Invalid or expired invite token" → "Ce lien d'invitation a expire. Demandez un nouveau code a votre ami."
    - "Cannot accept your own invite" → "Vous ne pouvez pas accepter votre propre invitation."
    - "Already friends with this user" → "Vous etes deja amis !"
  - [x] 6.2 In `invite/[token].tsx`, for "Already friends" case: show success state (green) instead of error (red) — being already friends is a positive outcome
  - [x] 6.3 In `scan.tsx`, add the same error message mapping for API errors from `acceptInviteMutation`
  - [x] 6.4 Invalidate `friendRequestKeys` and `friendKeys` query caches on successful invite accept (in both scan.tsx and invite/[token].tsx)

- [x] Task 7: Quality checks (AC: all)
  - [x] 7.1 Run `pnpm fix` for Biome formatting
  - [x] 7.2 Run `pnpm type-check` — verify no type errors
  - [x] 7.3 Run `pnpm test` — verify all existing tests still pass (48 files, 411 tests, 0 failures)
  - [x] 7.4 Run `pnpm check` — clean lint (850 files, no fixes needed)

## Dev Notes

### Architecture Overview — Friend QR & Deep Link Flow

```
QR Code Flow (In-App Scanner):
  1. User A: GET /api/v1/friends/invite → { inviteUrl, token, expiresAt }
  2. User A: QR code displays inviteUrl = "evahomecafeapp://invite/UUID"
  3. User A: Can share inviteUrl via native Share sheet
  4. User B: Opens in-app scanner (expo-camera) → scans QR
  5. User B: extractTokenFromUrl(scannedData) → extracts UUID from path
  6. User B: POST /api/v1/friends/invite/accept { token: UUID }
  7. System: Creates friendship, returns { friendId }

Deep Link Flow (External — tapping link):
  1. User B receives invite URL (via message, social share)
  2. User B taps link → OS opens app via custom scheme or Universal Links
  3. expo-router matches /invite/[token] → invite/[token].tsx
  4. If authenticated: auto-accept invite
  5. If NOT authenticated: redirect to register?invite=TOKEN
     → After registration: auto-accept invite (FR14)

Manual Code Flow:
  1. User A shares invite code (token UUID) verbally or via text
  2. User B: Opens add friend screen → "Code d'invitation" tab
  3. User B: Enters/pastes token UUID
  4. User B: POST /api/v1/friends/invite/accept { token: UUID }
```

### CRITICAL BUG: Token Extraction in scan.tsx

**Current broken code:**
```typescript
function extractTokenFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("token"); // ← WRONG: token is in PATH, not query params
  } catch {
    if (url.length === 36 || url.length === 32) return url; // ← Fallback: raw UUID only
    return null; // ← Returns null for "evahomecafeapp://invite/UUID" (55+ chars)
  }
}
```

**QR code value format:** `evahomecafeapp://invite/a1b2c3d4-e5f6-7890-abcd-ef1234567890`

When parsed with `new URL()`:
- `protocol`: `evahomecafeapp:`
- `hostname`: `invite` (or `host` depending on parsing)
- `pathname`: `/a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- `searchParams.get("token")`: **null** ← BUG

**Fixed code:**
```typescript
function extractTokenFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Check query params first (future-proof for ?token=X format)
    const queryToken = urlObj.searchParams.get("token");
    if (queryToken) return queryToken;
    // Extract from path: /invite/UUID → UUID
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    const lastSegment = pathParts[pathParts.length - 1];
    if (lastSegment && lastSegment.length >= 20) return lastSegment;
    // Try hostname as path segment for custom schemes
    // evahomecafeapp://invite/UUID → hostname="invite", pathname="/UUID"
    const pathSegment = urlObj.pathname.replace(/^\//, "");
    if (pathSegment && pathSegment.length >= 20) return pathSegment;
    return null;
  } catch {
    // Not a valid URL — check for raw UUID
    const trimmed = url.trim();
    if (trimmed.length >= 20 && trimmed.length <= 50) return trimmed;
    return null;
  }
}
```

### BUG: Share Button Uses Wrong API

**Current broken code in qr-code.tsx:**
```typescript
import * as Sharing from "expo-sharing";
// ...
const isAvailable = await Sharing.isAvailableAsync();
if (isAvailable) {
  await Sharing.shareAsync(data.inviteUrl, {
    dialogTitle: "Partager le lien d'invitation",
  });
}
```

`expo-sharing.shareAsync()` expects a **local file URI**, not an HTTP/custom scheme URL. This either fails silently or shares the URL as a file path string.

**Fixed code:**
```typescript
import { Share } from "react-native";
// ...
await Share.share({
  message: data.inviteUrl,
  title: "Rejoins-moi sur HomeCafe",
});
```

### BUG: Register Screen Ignores Invite Token

**Current flow (broken for FR14):**
1. `invite/[token].tsx` redirects unauth to `/(auth)/register?invite=${token}`
2. `register.tsx` never reads the `invite` param
3. After registration, user navigates to home — invite is LOST

**Fixed flow:**
1. `invite/[token].tsx` redirects unauth to `/(auth)/register?invite=${token}` (unchanged)
2. `register.tsx` reads `invite` param via `useLocalSearchParams()`
3. After successful sign-up, calls `acceptInvite({ token: invite })` before navigating
4. If accept fails: graceful degradation — user enters app anyway, shows toast

### Add Friend Screen — Dual Input Mode

**Current:** Email-only input
**After:** Segmented toggle with "Email" | "Code d'invitation"

```
┌─────────────────────────────────┐
│  [  Email  ] [ Code d'invitation ]  ← Segmented toggle
│                                   │
│  ┌─────────────────────────────┐ │
│  │ 🔗 Collez le code...       │ │  ← TextInput (code mode)
│  └─────────────────────────────┘ │
│                                   │
│  ℹ️ Entrez le code d'invitation  │
│     partagé par votre ami        │
│                                   │
│  [ Accepter l'invitation ]       │  ← Submit button
└─────────────────────────────────┘
```

The code input should:
- Accept raw UUID tokens (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
- Auto-extract token if a full URL is pasted (`evahomecafeapp://invite/UUID` or `https://homecafe.app/invite/UUID`)
- Call `useAcceptInvite()` on submit

### Universal Links / App Links Configuration

**app.json additions:**

```json
{
  "ios": {
    "associatedDomains": ["applinks:homecafe.app"]
  },
  "android": {
    "intentFilters": [{
      "action": "VIEW",
      "autoVerify": true,
      "data": [{ "scheme": "https", "host": "homecafe.app", "pathPrefix": "/invite" }],
      "category": ["BROWSABLE", "DEFAULT"]
    }]
  }
}
```

**Server-side files (deferred to Story 15.1):**
- iOS: `https://homecafe.app/.well-known/apple-app-site-association`
- Android: `https://homecafe.app/.well-known/assetlinks.json`

**Note:** The domain `homecafe.app` is a placeholder. Replace with the actual production domain when available. The app-side configuration is prepared now so that only the server-side files need to be created at deployment time.

### API Contract (Already Exists — No Backend Changes)

| Method | Endpoint | Purpose | Body |
|--------|----------|---------|------|
| GET | `/api/v1/friends/invite` | Generate invite link + token | — |
| POST | `/api/v1/friends/invite/accept` | Accept invite by token | `{ token: string }` |
| POST | `/api/v1/friends` | Send friend request by email | `{ receiverEmail: string }` |
| GET | `/api/v1/friends` | List friends | Query: `?page=N&limit=N` |
| GET | `/api/v1/friends/requests` | List pending requests | Query: `?page=N&limit=N` |
| POST | `/api/v1/friends/requests/[id]/respond` | Accept/reject request | `{ accept: boolean }` |

**Invite URL format:** `evahomecafeapp://invite/{UUID-TOKEN}`
- Generated by `GetInviteLinkUseCase` with `MOBILE_APP_SCHEME` env var
- Default: `evahomecafeapp://invite`
- Token expires in 24 hours

**Error responses from accept endpoint:**
- `404`: "Invalid or expired invite token"
- `400`: "Cannot accept your own invite"
- `409`: "Already friends with this user"

### Project Structure Notes

- **NO backend changes** — all work is Expo-side
- All friend screens already exist in `app/(protected)/friends/`
- Deep link handler exists at `app/invite/[token].tsx`
- API hooks exist in `lib/api/hooks/use-invite.ts` and `use-friends.ts`
- Types defined in `types/friend.ts`

### Files to Modify

```
apps/expo/app/(protected)/friends/scan.tsx         — Fix token extraction (CRITICAL)
apps/expo/app/(protected)/friends/qr-code.tsx      — Fix share button
apps/expo/app/(protected)/friends/add.tsx           — Add code/token input mode
apps/expo/app/(auth)/register.tsx                   — Handle invite param post-signup
apps/expo/app/invite/[token].tsx                    — Polish error messages
apps/expo/app.json                                  — Universal Links / App Links config
```

### No New Files Needed

All required screens, hooks, types, and API endpoints already exist. This story is purely about bug fixes, UX enhancements, and configuration.

### Existing Hooks and Files to Reuse

| File | Purpose | Action |
|------|---------|--------|
| `lib/api/hooks/use-invite.ts` | useGenerateInvite(), useAcceptInvite() | USE as-is |
| `lib/api/hooks/use-friends.ts` | useFriends(), useSendFriendRequest() | USE as-is |
| `lib/api/hooks/query-keys.ts` | friendKeys, inviteKeys, friendRequestKeys | USE — invalidate on success |
| `types/friend.ts` | Friend, InviteLink, AcceptInviteInput types | USE as-is |
| `components/ui/button.tsx` | Button component | USE as-is |
| `lib/api/client.ts` | ApiClient with auth | USE as-is |

### Critical Guardrails

1. **DO NOT create new backend endpoints** — the friend API is complete and working
2. **DO NOT modify existing API hooks** — they work correctly, only the UI code needs fixes
3. **DO NOT change the invite URL format** — `evahomecafeapp://invite/TOKEN` is the established contract
4. **DO NOT block registration on invite accept failure** — graceful degradation is critical
5. **DO NOT remove expo-sharing package** — only change the import in qr-code.tsx to use React Native's Share
6. **ALWAYS invalidate friend query caches** after successful invite acceptance
7. **ALWAYS handle the "already friends" case as success** — show green confirmation, not error
8. **Universal Links domain is placeholder** — use `homecafe.app`, will be finalized in production
9. **extractTokenFromUrl must handle BOTH URL formats** — custom scheme and HTTPS
10. **Commit format**: `feat(expo): implement story 14.3 — friend qr scanning and deep links with code review fixes`

### Previous Story Intelligence (14.2 — Push Notifications Expo EAS)

**Key Learnings:**
- Loading skeletons preferred over ActivityIndicator
- Alert.alert for persistent error feedback
- Remove dead code proactively (Biome flags unused imports as errors)
- Commit format: `feat(expo): implement story X.Y — description with code review fixes`
- expo-camera already installed (`^17.0.10`) — uses `CameraView` + `useCameraPermissions()`
- Deep linking patterns established: notification tap → router.push to specific screens
- PushNotificationSetup integrated in providers.tsx
- useSignOut includes push token cleanup — do not break this flow

**What 14.2 established that 14.3 builds on:**
- expo-camera is configured and working (used in scan.tsx)
- Deep link navigation from notification taps works (push-notifications.ts)
- expo-notifications plugin is in app.json plugins array
- Notification preferences are connected to backend API

### Git Intelligence

```
ad601a6 feat(expo): implement story 14.2 — push notifications expo eas with code review fixes
bbe2c73 feat(expo): implement story 14.1 — settings & preferences mobile with code review fixes
15b8e84 docs: add epic 13 retrospective and update sprint status
```

Pattern: All mobile stories use `feat(expo): implement story X.Y — description with code review fixes`.

### Library Versions (All Already Installed)

| Library | Version | Status |
|---------|---------|--------|
| `expo-camera` | ^17.0.10 | ALREADY INSTALLED |
| `react-native-qrcode-svg` | ^6.3.21 | ALREADY INSTALLED |
| `expo-sharing` | ^14.0.8 | ALREADY INSTALLED (keep, but use RN Share for URLs) |
| `expo-router` | 6.0.21 | ALREADY INSTALLED |
| `expo-linking` | 8.0.11 | ALREADY INSTALLED |
| `@tanstack/react-query` | 5.67.3 | ALREADY INSTALLED |

### Scope Sizing

This is a **small-medium story** — 6 files to modify, 0 new files. The main complexity is in the token extraction fix (parsing custom scheme URLs correctly) and the register screen invite flow. Estimated: ~150-250 lines of code changes.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 14: Story 14.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Client Strategy — Platform-Native]
- [Source: _bmad-output/planning-artifacts/architecture.md#Push Notifications — Domain Event Handlers]
- [Source: _bmad-output/implementation-artifacts/14-2-push-notifications-expo-eas.md — Previous story learnings]
- [Source: _bmad-output/implementation-artifacts/14-1-settings-and-preferences-mobile.md — Settings patterns]
- [Source: apps/expo/app/(protected)/friends/scan.tsx — QR scanner with broken token extraction]
- [Source: apps/expo/app/(protected)/friends/qr-code.tsx — QR display with broken share]
- [Source: apps/expo/app/(protected)/friends/add.tsx — Email-only add friend screen]
- [Source: apps/expo/app/invite/[token].tsx — Deep link handler]
- [Source: apps/expo/app/(auth)/register.tsx — Register screen missing invite handling]
- [Source: apps/expo/app.json — Custom scheme config, no Universal Links]
- [Source: apps/expo/lib/api/hooks/use-invite.ts — useGenerateInvite, useAcceptInvite hooks]
- [Source: apps/expo/lib/api/hooks/use-friends.ts — useFriends, useSendFriendRequest hooks]
- [Source: apps/expo/types/friend.ts — Friend, InviteLink types]
- [Source: apps/nextjs/common/di/modules/friend.module.ts — MOBILE_APP_SCHEME = "evahomecafeapp://invite"]
- [Source: apps/nextjs/src/application/use-cases/friend/get-invite-link.use-case.ts — inviteUrl = baseUrl/token]
- [Source: apps/nextjs/src/adapters/controllers/friend/friend.controller.ts — Full friend API contract]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No debug issues encountered. All tasks completed cleanly in a single pass.

### Completion Notes List

- **Task 1**: Fixed critical `extractTokenFromUrl()` bug in scan.tsx — token was extracted from query params but QR URL format puts token in the pathname. Now correctly parses both custom scheme (`evahomecafeapp://invite/UUID`) and HTTPS (`https://homecafe.app/invite/UUID`) formats. Added `mapApiError()` and `isAlreadyFriendsError()` helpers. Added differentiated error messages ("QR code non reconnu" vs "Lien d'invitation invalide"). Added cache invalidation for friendKeys and friendRequestKeys on success. "Already friends" now shows success state.
- **Task 2**: Replaced `expo-sharing` (file-based) with React Native's `Share` API (text-based) in qr-code.tsx. The share sheet now correctly shares the invite URL as text.
- **Task 3**: Added dual-mode input to add.tsx with segmented toggle ("Email" | "Code d'invitation"). Code mode accepts raw UUIDs and auto-extracts tokens from pasted URLs. Uses `useAcceptInvite()` with full error handling and French localized messages.
- **Task 4**: Register screen now reads `invite` param via `useLocalSearchParams()`. After successful sign-up, auto-accepts invite token. Graceful degradation: if invite accept fails, user still enters app with Alert feedback.
- **Task 5**: Added iOS `associatedDomains` and Android `intentFilters` to app.json for Universal Links / App Links (domain `homecafe.app` as placeholder). Server-side verification files deferred to Story 15.1.
- **Task 6**: Polished error messages in `invite/[token].tsx` — mapped API errors to French user-friendly messages. "Already friends" case shows success (green) state. Added cache invalidation on success.
- **Task 7**: All quality checks pass — Biome formatting clean, TypeScript types valid, 411 tests passing, no lint issues.

### File List

- `apps/expo/app/(protected)/friends/scan.tsx` — Modified: fixed extractTokenFromUrl, added error mapping, cache invalidation, "already friends" as success
- `apps/expo/app/(protected)/friends/qr-code.tsx` — Modified: replaced expo-sharing with React Native Share API
- `apps/expo/app/(protected)/friends/add.tsx` — Modified: added segmented toggle with dual input mode (email + invite code)
- `apps/expo/app/(auth)/register.tsx` — Modified: added invite param handling post-signup with graceful degradation
- `apps/expo/app/invite/[token].tsx` — Modified: added error mapping, "already friends" as success, cache invalidation
- `apps/expo/app.json` — Modified: added iOS associatedDomains and Android intentFilters for Universal Links / App Links
- `apps/expo/lib/utils/invite-errors.ts` — Created: shared invite error mapping utilities (code review fix)
- `apps/expo/lib/utils/invite-token.ts` — Created: shared token extraction utilities (code review fix)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Modified: story status ready-for-dev → in-progress → review → done

### Change Log

- 2026-02-11: Implemented Story 14.3 — Friend QR Scanning & Deep Links. Fixed 3 critical bugs (token extraction, share button, register invite flow), added invite code manual input mode, configured Universal Links/App Links, and polished all error messages with French localization.
- 2026-02-11: Code review fixes — Fixed infinite useEffect loop in invite/[token].tsx (useRef guard), fixed QR scan race condition in scan.tsx (ref-based debounce), extracted shared utilities (invite-errors.ts, invite-token.ts), added try-catch on Share.share(), fixed register.tsx fire-and-forget pattern for invite acceptance, removed duplicate cache invalidation.
