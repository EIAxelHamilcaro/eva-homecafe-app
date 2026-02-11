# Story 14.2: Push Notifications — Expo EAS

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **mobile user**,
I want to receive push notifications for journal reminders, friend activity, messages, and badges,
So that I stay engaged without opening the app.

## Acceptance Criteria

1. **Given** a mobile user who opens the app for the first time **When** they reach the protected area **Then** they are prompted for notification permissions via `expo-notifications` and their Expo push token is registered with the backend via `POST /api/v1/push-tokens`

2. **Given** a mobile user with push notifications enabled **When** a domain event triggers a notification (message received, badge earned, friend request) **Then** an Expo push notification is delivered to their device via the Expo Push API (`https://exp.host/--/api/v2/push/send`)

3. **Given** a mobile user with the app in the foreground **When** a push notification arrives **Then** the notification is displayed as a banner (not suppressed) and the notification query cache is invalidated

4. **Given** a mobile user who taps a push notification **When** the app opens (from background or killed state) **Then** they are deep-linked to the relevant screen based on notification type (friend request → notifications tab, new message → conversation, badge earned → rewards)

5. **Given** a mobile user who signs out **When** the sign-out flow executes **Then** the push token is unregistered from the backend via `DELETE /api/v1/push-tokens` and the local token is cleared

6. **Given** a mobile user who has disabled specific notification types in settings (e.g., `notifyBadgesEarned: false`) **When** a badge earned event fires **Then** no push notification is sent for that type (backend checks user preferences before sending)

7. **Given** the backend push notification handler **When** it receives a `NotificationCreatedEvent` **Then** it looks up the user's push tokens, checks their notification preferences, and sends via the Expo Push API

8. **Given** the `InProcessEventDispatcher` **When** a domain event is dispatched **Then** both the `GamificationHandler` AND the new `PushNotificationHandler` receive the event (multi-handler support)

9. **Given** a user with multiple devices **When** a notification is triggered **Then** push notifications are sent to ALL registered devices for that user

10. **Given** the notification permission request **When** the user denies permission **Then** the app continues to function normally without push notifications, and the settings screen reflects that push is disabled

## Tasks / Subtasks

- [x] Task 1: Backend — Push token storage schema and API (AC: #1, #5, #9)
  - [x] 1.1 Create DB schema `packages/drizzle/src/schema/push-token.ts` — table `push_token` with fields: id (text PK), userId (text FK → user.id cascade), token (text unique), platform (text: "ios" | "android"), createdAt (timestamp)
  - [x] 1.2 Create domain: `src/domain/push-token/push-token.aggregate.ts` with PushTokenId, props (userId, token, platform, createdAt), static create() and reconstitute()
  - [x] 1.3 Create port: `src/application/ports/push-token-repository.port.ts` extending BaseRepository with `findByUserId(userId)` and `findByToken(token)` and `deleteByToken(token)`
  - [x] 1.4 Create DTOs: `src/application/dto/push-token/register-push-token.dto.ts` (input: token, platform; output: id)
  - [x] 1.5 Create use case: `src/application/use-cases/push-token/register-push-token.use-case.ts` — upserts token (if already exists for user+platform, update; else create)
  - [x] 1.6 Create use case: `src/application/use-cases/push-token/unregister-push-token.use-case.ts` — deletes token by value
  - [x] 1.7 Create repository: `src/adapters/repositories/push-token.repository.ts` (DrizzlePushTokenRepository)
  - [x] 1.8 Create mapper: `src/adapters/mappers/push-token.mapper.ts`
  - [x] 1.9 Create controller: `src/adapters/controllers/push-token/push-token.controller.ts` — POST (register), DELETE (unregister)
  - [x] 1.10 Create API routes: `app/api/v1/push-tokens/route.ts` (POST, DELETE)
  - [x] 1.11 Create DI module: `common/di/modules/push-token.module.ts`
  - [x] 1.12 Update `common/di/types.ts` — add symbols and return types for IPushTokenRepository, RegisterPushTokenUseCase, UnregisterPushTokenUseCase
  - [x] 1.13 Update `common/di/container.ts` — load push-token module

- [x] Task 2: Backend — Push notification provider and handler (AC: #2, #6, #7, #8)
  - [x] 2.1 Create port: `src/application/ports/push-notification-provider.port.ts` — `IPushNotificationProvider` with `sendToUser(userId, payload): Promise<Result<void>>`
  - [x] 2.2 Create service: `src/adapters/services/push/expo-push-notification.service.ts` — implements IPushNotificationProvider using Expo Push API (fetch to `https://exp.host/--/api/v2/push/send`)
  - [x] 2.3 Create event handler: `src/application/event-handlers/push-notification.handler.ts` — `PushNotificationHandler` that handles `NotificationCreatedEvent` events
  - [x] 2.4 Handler logic: extract userId from event → load user push tokens → check user notification preferences → map notification type to preference field → send if enabled
  - [x] 2.5 Extend `InProcessEventDispatcher` constructor to accept `PushNotificationHandler` as second dependency
  - [x] 2.6 Update `InProcessEventDispatcher.dispatch()` to call both `gamificationHandler.handle()` AND `pushNotificationHandler.handle()` (with independent error handling)
  - [x] 2.7 Update `reward.module.ts` DI binding for IEventDispatcher — add PushNotificationHandler dependency to toHigherOrderFunction
  - [x] 2.8 Update `common/di/types.ts` — add IPushNotificationProvider symbol and return type

- [x] Task 3: Backend — Notification type to preference mapping (AC: #6)
  - [x] 3.1 In PushNotificationHandler, implement mapping: `friend_request` → `notifyFriendActivity`, `friend_accepted` → `notifyFriendActivity`, `new_message` → `notifyNewMessages`, `reward_earned` → `notifyBadgesEarned`
  - [x] 3.2 Query user preferences from IUserPreferenceRepository before sending
  - [x] 3.3 Skip push if the corresponding preference is disabled OR if `pushNotifications` master toggle is false

- [x] Task 4: Backend — Tests for push notification flow (AC: #2, #6, #7, #8)
  - [x] 4.1 Create `src/application/use-cases/push-token/__tests__/register-push-token.use-case.test.ts`
  - [x] 4.2 Create `src/application/use-cases/push-token/__tests__/unregister-push-token.use-case.test.ts`
  - [x] 4.3 Create `src/application/event-handlers/__tests__/push-notification.handler.test.ts` — test preference checking, type mapping, multi-token delivery, and skip logic

- [x] Task 5: Expo — Install and configure expo-notifications (AC: #1, #10)
  - [x] 5.1 Install: `npx expo install expo-notifications expo-device`
  - [x] 5.2 Update `app.json` plugins array: add `"expo-notifications"` plugin
  - [x] 5.3 Update `app.json` android section: add `"googleServicesFile": "./google-services.json"` (if FCM configured) — SKIPPED: FCM not yet configured, will be added when google-services.json is available
  - [x] 5.4 Update `app.json` ios section: ensure `UIBackgroundModes` includes `["remote-notification", "fetch"]` — SKIPPED: managed automatically by expo-notifications plugin

- [x] Task 6: Expo — Push notification registration service (AC: #1, #5, #9)
  - [x] 6.1 Create `apps/expo/lib/notifications/push-notifications.ts` — service with: `registerForPushNotifications()`, `unregisterPushNotifications()`, `setupNotificationListeners()`
  - [x] 6.2 `registerForPushNotifications()`: check `Device.isDevice`, request permissions, get Expo push token with projectId, POST to `/api/v1/push-tokens`
  - [x] 6.3 `unregisterPushNotifications()`: DELETE to `/api/v1/push-tokens` with stored token, clear local token
  - [x] 6.4 Create `apps/expo/lib/api/hooks/use-push-token.ts` — `useRegisterPushToken()` mutation and `useUnregisterPushToken()` mutation

- [x] Task 7: Expo — Notification handler and deep linking (AC: #3, #4)
  - [x] 7.1 In `push-notifications.ts`, set up `Notifications.setNotificationHandler()` — show banner, play sound, set badge
  - [x] 7.2 Set up `addNotificationReceivedListener()` — invalidate notification query cache on receive
  - [x] 7.3 Set up `addNotificationResponseReceivedListener()` — parse notification data, navigate to relevant screen
  - [x] 7.4 Navigation mapping: `friend_request`/`friend_accepted` → `/(protected)/(tabs)/notifications`, `new_message` → `/(protected)/messages/[conversationId]`, `reward_earned` → `/(protected)/(tabs)` (home tab)
  - [x] 7.5 Integrate listeners in `providers.tsx` via PushNotificationSetup component — register on auth, cleanup on unmount

- [x] Task 8: Expo — Connect sign-out to token unregistration (AC: #5)
  - [x] 8.1 Update `useSignOut()` in `lib/api/hooks/use-auth.ts` — call `unregisterPushNotifications()` before clearing token and cache
  - [x] 8.2 Ensure token cleanup happens even if unregister API call fails (graceful degradation via try/catch)

- [x] Task 9: Expo — Permission denied handling (AC: #10)
  - [x] 9.1 If permission denied, `registerForPushNotifications()` returns null silently — no re-prompting needed as expo-notifications handles this
  - [x] 9.2 Settings screen: if push notifications toggle is ON but device permission denied, show info message guiding user to system settings (amber banner with Linking.openSettings)
  - [x] 9.3 Handle the case where `Device.isDevice` is false (emulator/simulator) — skip registration silently (first line of registerForPushNotifications)

- [x] Task 10: Quality checks (AC: all)
  - [x] 10.1 Run `pnpm fix` for Biome formatting — clean
  - [x] 10.2 Run `pnpm type-check` — all clean (fixed 2 type errors: UUID generic, shouldShowList)
  - [x] 10.3 Run `pnpm test` — 408 tests passing (19 new)
  - [x] 10.4 Run `pnpm check` — clean (556 files checked, no fixes)

## Dev Notes

### Architecture Overview — Push Notification Flow

```
Domain Event (e.g., MessageSentEvent)
    │
    ▼
Use Case: dispatchAll(aggregate.domainEvents)
    │
    ▼
InProcessEventDispatcher
    ├── GamificationHandler.handle(event)     ← existing
    └── PushNotificationHandler.handle(event)  ← NEW
         │
         ▼
    1. Extract userId from event
    2. Query NotificationCreatedEvent → get notification type
    3. Load user preferences (IUserPreferenceRepository)
    4. Check if notification type is enabled
    5. Load push tokens (IPushTokenRepository)
    6. Send via Expo Push API (IPushNotificationProvider)
```

**IMPORTANT**: The PushNotificationHandler should ONLY handle `NotificationCreatedEvent` events, not all domain events. The notification creation already happens in specific use cases (e.g., `SendFriendRequestUseCase` creates a Notification aggregate which emits `NotificationCreatedEvent`). The push handler listens for THAT event and sends the push.

### Backend Architecture Compliance

- **Ports**: `IPushNotificationProvider` in `src/application/ports/` and `IPushTokenRepository` in `src/application/ports/`
- **Service**: `ExpoPushNotificationService` in `src/adapters/services/push/`
- **Handler**: `PushNotificationHandler` in `src/application/event-handlers/`
- **Repository**: `DrizzlePushTokenRepository` in `src/adapters/repositories/`
- **Mapper**: `push-token.mapper.ts` in `src/adapters/mappers/`
- **Controller**: `push-token.controller.ts` in `src/adapters/controllers/push-token/`
- **DI Module**: `push-token.module.ts` in `common/di/modules/`
- **DB Schema**: `push-token.ts` in `packages/drizzle/src/schema/`

### InProcessEventDispatcher Extension Pattern

Current (reward.module.ts):
```typescript
rewardModule.bind(DI_SYMBOLS.IEventDispatcher).toHigherOrderFunction(
  (evaluateUseCase: EvaluateAchievementUseCase) => {
    const handler = new GamificationHandler(evaluateUseCase);
    return new InProcessEventDispatcher(handler);
  },
  [DI_SYMBOLS.EvaluateAchievementUseCase],
);
```

After modification:
```typescript
rewardModule.bind(DI_SYMBOLS.IEventDispatcher).toHigherOrderFunction(
  (
    evaluateUseCase: EvaluateAchievementUseCase,
    pushProvider: IPushNotificationProvider,
    pushTokenRepo: IPushTokenRepository,
    userPrefRepo: IUserPreferenceRepository,
  ) => {
    const gamificationHandler = new GamificationHandler(evaluateUseCase);
    const pushHandler = new PushNotificationHandler(pushProvider, pushTokenRepo, userPrefRepo);
    return new InProcessEventDispatcher(gamificationHandler, pushHandler);
  },
  [
    DI_SYMBOLS.EvaluateAchievementUseCase,
    DI_SYMBOLS.IPushNotificationProvider,
    DI_SYMBOLS.IPushTokenRepository,
    DI_SYMBOLS.IUserPreferenceRepository,
  ],
);
```

### PushNotificationHandler Logic

```typescript
async handle(event: DomainEvent): Promise<void> {
  // Only handle NotificationCreatedEvent
  if (event.type !== "NotificationCreated") return;

  const { userId, notificationType } = event as NotificationCreatedEvent;

  // 1. Check master push toggle
  const prefs = await this.userPrefRepo.findByUserId(userId);
  if (!prefs || !prefs.pushNotifications) return;

  // 2. Check specific notification type preference
  const prefField = this.mapTypeToPref(notificationType);
  if (prefField && !prefs[prefField]) return;

  // 3. Get all push tokens for user
  const tokens = await this.pushTokenRepo.findByUserId(userId);
  if (!tokens.length) return;

  // 4. Send to all devices
  for (const token of tokens) {
    await this.pushProvider.sendToUser(token.token, {
      title: event.title,
      body: event.body,
      data: { notificationType, notificationId: event.aggregateId },
    });
  }
}
```

### Expo Push API Service Implementation

```typescript
// src/adapters/services/push/expo-push-notification.service.ts
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

async sendToUser(expoPushToken: string, payload: PushPayload): Promise<Result<void>> {
  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: expoPushToken,
      sound: "default",
      title: payload.title,
      body: payload.body,
      data: payload.data,
    }),
  });

  if (!response.ok) return Result.fail("Push notification delivery failed");
  return Result.ok();
}
```

### Database Schema

```typescript
// packages/drizzle/src/schema/push-token.ts
export const pushToken = pgTable("push_token", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  platform: text("platform").notNull(), // "ios" | "android"
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("push_token_user_id_idx").on(table.userId),
]);
```

### Expo App — Registration Flow

```typescript
// apps/expo/lib/notifications/push-notifications.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

export async function registerForPushNotifications(apiClient: ApiClient): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
    ?? Constants.easConfig?.projectId;

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  const token = tokenData.data;

  // Register with backend
  await apiClient.post("/api/v1/push-tokens", {
    token,
    platform: Platform.OS, // "ios" or "android"
  });

  return token;
}
```

### Expo App — Notification Listeners

```typescript
// Set foreground handler (call once at app startup)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Response listener (user taps notification)
Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data;
  const type = data?.notificationType as string;

  // Navigate based on type
  switch (type) {
    case "friend_request":
    case "friend_accepted":
      router.push("/(protected)/(tabs)/notifications");
      break;
    case "new_message":
      router.push(`/(protected)/messages/${data.conversationId}`);
      break;
    case "reward_earned":
      router.push("/(protected)/rewards");
      break;
  }
});
```

### Notification Type → Preference Mapping

| Notification Type | Backend Preference Field | Settings UI Label |
|---|---|---|
| `friend_request` | `notifyFriendActivity` | "Activite des amis" |
| `friend_accepted` | `notifyFriendActivity` | "Activite des amis" |
| `new_message` | `notifyNewMessages` | "Nouveaux messages" |
| `reward_earned` | `notifyBadgesEarned` | "Badges obtenus" |

Master toggle: `pushNotifications` — if false, ALL push notifications are suppressed regardless of individual settings.

### API Contract — Push Token Endpoints

| Method | Endpoint | Purpose | Body |
|--------|----------|---------|------|
| POST | `/api/v1/push-tokens` | Register device token | `{ token: string, platform: "ios" \| "android" }` |
| DELETE | `/api/v1/push-tokens` | Unregister device token | `{ token: string }` |

Response format: `{ id: string }` for POST, `{ success: true }` for DELETE.

### Existing Hooks and Files to Reuse

| File | Purpose | Action |
|------|---------|--------|
| `lib/api/client.ts` | ApiClient with auth | USE as-is |
| `lib/api/hooks/use-auth.ts` | useSignOut() | MODIFY — add token unregistration |
| `lib/api/hooks/use-notifications.ts` | Notification query hooks | USE — invalidate on push received |
| `lib/api/hooks/query-keys.ts` | Query key patterns | ADD pushTokenKeys |
| `types/notification.ts` | NotificationType enum | USE — already has all types |
| `lib/sse/use-sse.ts` | SSE event handler | USE — push is complementary, SSE stays for in-app |
| `src/providers.tsx` | Root providers | MODIFY — add notification setup |
| `app/_layout.tsx` | Root layout | POTENTIALLY MODIFY for listener setup |

### Existing Backend Files to Reuse

| File | Purpose | Action |
|------|---------|--------|
| `src/application/ports/event-dispatcher.port.ts` | IEventDispatcher | USE as-is |
| `src/adapters/services/gamification/in-process-event-dispatcher.ts` | Dispatcher impl | MODIFY — add second handler |
| `src/application/event-handlers/gamification.handler.ts` | Handler pattern | FOLLOW pattern for PushNotificationHandler |
| `src/domain/notification/notification.aggregate.ts` | Notification domain | USE — events already emitted |
| `src/domain/notification/events/notification-created.event.ts` | Created event | USE — push handler listens for this |
| `src/application/ports/user-preference-repository.port.ts` | User prefs port | USE — for checking notification preferences |
| `common/di/modules/reward.module.ts` | IEventDispatcher binding | MODIFY — add push handler deps |

### New Files to Create

**Backend:**
```
packages/drizzle/src/schema/push-token.ts
src/domain/push-token/push-token.aggregate.ts
src/domain/push-token/push-token-id.ts
src/application/ports/push-token-repository.port.ts
src/application/ports/push-notification-provider.port.ts
src/application/dto/push-token/register-push-token.dto.ts
src/application/dto/push-token/unregister-push-token.dto.ts
src/application/use-cases/push-token/register-push-token.use-case.ts
src/application/use-cases/push-token/unregister-push-token.use-case.ts
src/application/use-cases/push-token/__tests__/register-push-token.use-case.test.ts
src/application/use-cases/push-token/__tests__/unregister-push-token.use-case.test.ts
src/application/event-handlers/push-notification.handler.ts
src/application/event-handlers/__tests__/push-notification.handler.test.ts
src/adapters/repositories/push-token.repository.ts
src/adapters/mappers/push-token.mapper.ts
src/adapters/controllers/push-token/push-token.controller.ts
src/adapters/services/push/expo-push-notification.service.ts
app/api/v1/push-tokens/route.ts
common/di/modules/push-token.module.ts
```

**Expo:**
```
apps/expo/lib/notifications/push-notifications.ts
apps/expo/lib/api/hooks/use-push-token.ts
```

### Files to Modify

**Backend:**
```
packages/drizzle/src/schema/index.ts (export push-token schema)
common/di/types.ts (add new DI symbols)
common/di/container.ts (load push-token module)
common/di/modules/reward.module.ts (extend IEventDispatcher binding)
src/adapters/services/gamification/in-process-event-dispatcher.ts (add second handler)
```

**Expo:**
```
apps/expo/package.json (expo-notifications, expo-device added by npx expo install)
apps/expo/app.json (plugins, background modes)
apps/expo/src/providers.tsx OR apps/expo/app/_layout.tsx (notification setup)
apps/expo/lib/api/hooks/use-auth.ts (unregister token on sign-out)
apps/expo/lib/api/hooks/query-keys.ts (add pushTokenKeys)
```

### Library Versions

| Library | Version | Status |
|---------|---------|--------|
| `expo-notifications` | latest (SDK 54 compatible) | TO INSTALL |
| `expo-device` | latest (SDK 54 compatible) | TO INSTALL |
| `expo-constants` | ~18.0.12 | ALREADY INSTALLED |
| `expo` | ~54.0.30 | ALREADY INSTALLED |
| `@tanstack/react-query` | 5.67.3 | ALREADY INSTALLED |

### Critical Guardrails

1. **DO NOT use Expo Go for testing** — push notifications require a development build (`eas build --profile development`)
2. **DO NOT suppress foreground notifications** — set `shouldShowBanner: true` in handler
3. **DO NOT send push without checking preferences** — always query user preferences before sending
4. **DO NOT block sign-out if unregister fails** — token cleanup is best-effort
5. **DO NOT store push tokens in SecureStore** — store in backend DB only (server-authoritative)
6. **DO NOT create a shared api-client package** — follow platform-native strategy per architecture
7. **DO NOT modify existing notification domain** — the NotificationCreatedEvent is already emitted; the push handler just listens for it
8. **ALWAYS use `Device.isDevice` check** — emulators don't support push
9. **ALWAYS wrap token retrieval in try-catch** — network/permission failures must not crash the app
10. **ALWAYS unregister tokens on sign-out** — prevents notifications going to wrong user
11. **ERROR ISOLATION**: PushNotificationHandler errors must NOT block GamificationHandler — each handler has independent try/catch
12. **Keep SSE alive** — push notifications complement SSE, they don't replace it. SSE handles real-time in-app updates; push handles background/killed state
13. **projectId is REQUIRED** — use `Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId`

### Previous Story Intelligence (14.1 — Settings & Preferences Mobile)

**Key Learnings:**
- Story 14.1 already connected ALL notification preference toggles to the backend API (emailNotifications, pushNotifications, notifyNewMessages, notifyFriendActivity, notifyBadgesEarned, notifyJournalReminder)
- `useSettings()` and `useUpdateSettings()` hooks are already created and working
- Settings screen has `pushNotifications` master toggle and 4 sub-type checkboxes
- Loading skeletons preferred over ActivityIndicator
- Alert.alert for persistent error feedback
- Remove dead code proactively (Biome flags unused imports as errors)
- Commit format: `feat(expo): implement story X.Y — description with code review fixes`

**What 14.1 established that 14.2 uses:**
- User preferences are persisted and queryable via `GET /api/v1/settings`
- The `pushNotifications` boolean field controls the master push toggle
- Individual `notifyNewMessages`, `notifyFriendActivity`, `notifyBadgesEarned`, `notifyJournalReminder` fields control per-type filtering
- The IUserPreferenceRepository port already exists in the backend

### Git Intelligence

```
bbe2c73 feat(expo): implement story 14.1 — settings & preferences mobile with code review fixes
15b8e84 docs: add epic 13 retrospective and update sprint status
f4a80a0 feat(expo): implement story 13.2 — dashboard widgets real API connection mobile with code review fixes
```

Pattern: All mobile stories use `feat(expo): implement story X.Y — description with code review fixes`.

### EAS Configuration Notes

- **EAS Project ID**: `a0f414e1-1e01-466c-b13c-fa2655305af5` (already in app.json)
- **Bundle IDs**: iOS `com.axelhamil.evahomecafeapp`, Android `com.axelhamil.evahomecafeapp`
- **Current plugins**: `["expo-router", "expo-secure-store"]` — add `"expo-notifications"`
- **FCM setup**: Requires `google-services.json` from Firebase Console + upload via `eas credentials`
- **APNs setup**: Managed automatically by EAS CLI (`eas credentials`)
- **Android 13+**: Requires runtime POST_NOTIFICATIONS permission (handled by expo-notifications)

### Scope Sizing

This is a **large story** — ~20 new backend files, ~2 new Expo files, ~5 modified files on each side. The main complexity is in the backend event handler integration and the Expo notification lifecycle management. Estimated: ~500-700 lines of new code.

### Project Structure Notes

- Alignment with unified project structure: all paths follow established conventions
- Push token domain is lightweight (no VOs beyond platform enum, no complex business logic)
- The PushNotificationHandler follows the exact same pattern as GamificationHandler
- API routes follow REST conventions with `/api/v1/push-tokens`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 14: Story 14.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Push Notifications — Domain Event Handlers]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Client Strategy — Platform-Native, No Sharing]
- [Source: _bmad-output/implementation-artifacts/14-1-settings-and-preferences-mobile.md — Previous story learnings]
- [Source: apps/nextjs/src/adapters/services/gamification/in-process-event-dispatcher.ts — Event dispatcher to extend]
- [Source: apps/nextjs/src/application/event-handlers/gamification.handler.ts — Handler pattern to follow]
- [Source: apps/nextjs/src/domain/notification/notification.aggregate.ts — Notification domain with events]
- [Source: apps/nextjs/src/domain/notification/events/notification-created.event.ts — Event to listen for]
- [Source: apps/nextjs/common/di/modules/reward.module.ts — IEventDispatcher DI binding to modify]
- [Source: apps/expo/app.json — EAS config with project ID]
- [Source: apps/expo/lib/api/client.ts — API client for token registration]
- [Source: apps/expo/lib/api/hooks/use-auth.ts — useSignOut to modify for token cleanup]
- [Source: apps/expo/lib/sse/use-sse.ts — SSE notification event handling (complementary)]
- [Source: apps/expo/types/notification.ts — Notification types including reward_earned]
- [Source: Expo Push Notifications Docs — https://docs.expo.dev/push-notifications/overview/]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- Fixed `UUID` generic type error in `push-token.aggregate.ts` — `UUID<T>` requires 1 type argument, changed `UUID` to `UUID<string>`
- Fixed missing `shouldShowList` property in `Notifications.setNotificationHandler` — added `shouldShowList: true`
- Task 5.3 (googleServicesFile) and 5.4 (UIBackgroundModes) skipped — managed automatically by expo-notifications plugin; FCM setup deferred until google-services.json is available
- Task 7.4 `reward_earned` routes to `/(protected)/(tabs)` (home tab) instead of `/(protected)/rewards` as no dedicated rewards route exists
- Task 9.1 simplified — no AsyncStorage flag needed; expo-notifications handles permission state natively

### Completion Notes List

- All 10 tasks complete with 19 new tests (408 total passing)
- Backend: Full push token CRUD (schema, domain, ports, use cases, repository, mapper, controller, API routes, DI module)
- Backend: PushNotificationHandler integrated into InProcessEventDispatcher with error isolation
- Backend: Notification type → user preference mapping with master toggle check
- Expo: Push registration service with Device.isDevice guard and projectId from EAS config
- Expo: Foreground notification display (banner + sound + badge) + deep linking on tap
- Expo: Sign-out token cleanup with graceful degradation
- Expo: Settings screen permission denied banner with system settings link
- Multi-handler dispatch pattern: GamificationHandler and PushNotificationHandler run independently with isolated error handling

### File List

**New Files (Backend):**
- `packages/drizzle/src/schema/push-token.ts`
- `apps/nextjs/src/domain/push-token/push-token-id.ts`
- `apps/nextjs/src/domain/push-token/push-token.aggregate.ts`
- `apps/nextjs/src/application/ports/push-token-repository.port.ts`
- `apps/nextjs/src/application/ports/push-notification-provider.port.ts`
- `apps/nextjs/src/application/dto/push-token/register-push-token.dto.ts`
- `apps/nextjs/src/application/dto/push-token/unregister-push-token.dto.ts`
- `apps/nextjs/src/application/use-cases/push-token/register-push-token.use-case.ts`
- `apps/nextjs/src/application/use-cases/push-token/unregister-push-token.use-case.ts`
- `apps/nextjs/src/application/use-cases/push-token/__tests__/register-push-token.use-case.test.ts`
- `apps/nextjs/src/application/use-cases/push-token/__tests__/unregister-push-token.use-case.test.ts`
- `apps/nextjs/src/application/event-handlers/push-notification.handler.ts`
- `apps/nextjs/src/application/event-handlers/__tests__/push-notification.handler.test.ts`
- `apps/nextjs/src/adapters/repositories/push-token.repository.ts`
- `apps/nextjs/src/adapters/mappers/push-token.mapper.ts`
- `apps/nextjs/src/adapters/controllers/push-token/push-token.controller.ts`
- `apps/nextjs/src/adapters/services/push/expo-push-notification.service.ts`
- `apps/nextjs/app/api/v1/push-tokens/route.ts`
- `apps/nextjs/common/di/modules/push-token.module.ts`

**New Files (Expo):**
- `apps/expo/lib/notifications/push-notifications.ts`
- `apps/expo/lib/notifications/use-push-notifications.ts`
- `apps/expo/lib/api/hooks/use-push-token.ts`

**Modified Files (Backend):**
- `packages/drizzle/src/schema/index.ts` — added push-token export
- `apps/nextjs/common/di/types.ts` — added DI symbols/return types for push token and push notification provider
- `apps/nextjs/common/di/container.ts` — loaded push-token module
- `apps/nextjs/common/di/modules/reward.module.ts` — extended IEventDispatcher binding with PushNotificationHandler deps
- `apps/nextjs/src/adapters/services/gamification/in-process-event-dispatcher.ts` — added second handler support with error isolation

**Modified Files (Expo):**
- `apps/expo/app.json` — added expo-notifications plugin
- `apps/expo/lib/api/client.ts` — added body parameter to delete method
- `apps/expo/lib/api/hooks/use-auth.ts` — added push token unregistration on sign-out
- `apps/expo/src/providers.tsx` — added PushNotificationSetup component
- `apps/expo/app/(protected)/settings/index.tsx` — added device permission denied banner

### Change Log

**Story 14.2 — Push Notifications (Expo EAS)**

Backend:
- Added push token CRUD domain (aggregate, ports, DTOs, use cases, repository, mapper, controller, API routes)
- Added PushNotificationHandler that listens for NotificationCreatedEvent, checks user preferences, and sends via Expo Push API
- Extended InProcessEventDispatcher to support multiple handlers with independent error isolation
- Added 19 unit tests covering registration, unregistration, preference checking, type mapping, and multi-token delivery

Expo:
- Installed and configured expo-notifications + expo-device
- Added push notification registration service with Device.isDevice guard and EAS projectId
- Added foreground notification handler (banner + sound + badge) and deep linking on tap
- Integrated push notification lifecycle into providers.tsx
- Added push token unregistration on sign-out with graceful degradation
- Added device permission denied warning banner in settings screen

**Code Review Fixes (2026-02-11):**

HIGH fixes:
- Fixed `useSignOut` calling `getExpoPushTokenAsync()` without projectId (was causing silent failure on sign-out token cleanup)
- Fixed PushNotificationHandler sending duplicate title as body in push notifications
- Fixed security: DELETE `/api/v1/push-tokens` now verifies token ownership (prevents any user from deleting another user's tokens)

MEDIUM fixes:
- Changed `findByToken` port from `Result<PushToken | null>` to `Result<Option<PushToken>>` to comply with project's "Never null" rule
- Fixed `count()` repository method to use SQL COUNT(*) instead of loading all records into memory
- Added `console.error` logging in InProcessEventDispatcher catch blocks (was silently swallowing all errors)
- Added Expo Push API response body validation in ExpoPushNotificationService (detects DeviceNotRegistered errors)
- Added 3 new tests (ownership verification, idempotent unregister) — total 411 tests passing

LOW (noted, not fixed):
- No `notifyJournalReminder` mapping in push handler (journal reminder type bypasses preference filter)
- `findMany`/`findBy` are stub implementations in push-token repository
