# HomeCafe Feature Development - Activity Log

## Current Status

**Last Updated:** 2026-01-21
**Tasks Completed:** 35/70
**Current Task:** Task 36 - Create GetPendingRequests Use Case
**Current Phase:** Phase 2 - Friends & Notifications

---

## Progress Summary

| Category | Total | Completed |
|----------|-------|-----------|
| Domain | 7 | 7 |
| Application | 18 | 13 |
| Infrastructure | 6 | 3 |
| Adapter | 10 | 3 |
| API | 3 | 1 |
| Expo | 19 | 5 |
| Testing | 4 | 1 |
| Validation | 3 | 2 |

---

## Phases

### Phase 1: Profile Feature (Tasks 1-22)
- Create Profile domain entity (separate from BetterAuth User)
- Full CRUD: Create, Read, Update profile
- Profile fields: displayName, bio, avatarUrl
- Profile tab in Expo app

### Phase 2: Friends & Notifications (Tasks 23-70)
- Friend request system (email + QR code invites)
- Notifications with real-time SSE updates
- Notifications tab in Expo app
- Friends list accessible from Profile

---

## Session Log

<!-- Agent will append dated entries below this line -->

### 2026-01-21

**Tasks 1-3 Completed: Profile Domain Layer**

Files created:
- `src/domain/profile/profile-id.ts` - ProfileId UUID class
- `src/domain/profile/profile.aggregate.ts` - Profile aggregate with userId, displayName, bio, avatarUrl
- `src/domain/profile/value-objects/display-name.vo.ts` - DisplayName VO (1-50 chars)
- `src/domain/profile/value-objects/bio.vo.ts` - Bio VO (max 500 chars)
- `src/domain/profile/events/profile-created.event.ts` - ProfileCreatedEvent
- `src/domain/profile/events/profile-updated.event.ts` - ProfileUpdatedEvent

Profile aggregate methods:
- `create()` - Creates new profile with event
- `reconstitute()` - Rebuilds from DB
- `updateDisplayName()`, `updateBio()`, `updateAvatar()` - Update methods with events

Type check: PASSED

**Tasks 4-5 Completed: Profile Repository Port & DTOs**

Files created:
- `src/application/ports/profile-repository.port.ts` - IProfileRepository interface extending BaseRepository
- `src/application/dto/profile/profile.dto.ts` - Shared profile DTO schema
- `src/application/dto/profile/create-profile.dto.ts` - Create profile input/output DTOs
- `src/application/dto/profile/update-profile.dto.ts` - Update profile input/output DTOs
- `src/application/dto/profile/get-profile.dto.ts` - Get profile input/output DTOs

Repository methods: findById, findByUserId, existsByUserId (extends BaseRepository<Profile>)

Type check: PASSED

**Task 6 Completed: CreateProfile Use Case**

Files created:
- `src/application/use-cases/profile/create-profile.use-case.ts`

Use case responsibilities:
- Check profile doesn't already exist for userId (existsByUserId)
- Validate and create DisplayName VO
- Optionally create Bio VO if provided
- Handle optional avatarUrl
- Create Profile aggregate and persist
- Return profile DTO

Type check: PASSED

**Task 7 Completed: GetProfile Use Case**

Files created:
- `src/application/use-cases/profile/get-profile.use-case.ts`

Use case responsibilities:
- Find profile by userId
- Return profile DTO or null (nullable output)
- Uses match pattern for Option handling

Type check: PASSED

**Task 8 Completed: UpdateProfile Use Case**

Files created:
- `src/application/use-cases/profile/update-profile.use-case.ts`

Use case responsibilities:
- Find profile by userId
- Verify profile exists (fail if not found)
- Update only provided fields (displayName, bio, avatarUrl)
- Handle nullable bio (can be set to null to clear)
- Persist updated profile
- Return updated profile DTO

Type check: PASSED

**Task 9 Completed: Create Drizzle Schema for Profile**

Files created:
- `packages/drizzle/src/schema/profile.ts`

Files modified:
- `packages/drizzle/src/schema/index.ts` - Added export for profile schema

Schema details:
- Table: `profile`
- Columns: id (text PK), userId (text unique FK to user.id with cascade delete), displayName (text), bio (text nullable), avatarUrl (text nullable), createdAt, updatedAt
- Index: unique index on userId
- Migration auto-generated: `0002_serious_santa_claus.sql`

Type check: PASSED

**Task 10 Completed: Run Database Migration for Profile**

Migration applied:
- Created `profile` table with columns: id, user_id, display_name, bio, avatar_url, created_at, updated_at
- Added foreign key constraint to user table with cascade delete
- Added unique index on user_id

Command: `pnpm drizzle-kit push --force`
Status: Changes applied successfully

**Task 11 Completed: Create Profile Mapper**

Files created:
- `src/adapters/mappers/profile.mapper.ts`

Mapper functions:
- `profileToDomain()` - Converts DB record to Profile aggregate (handles Bio VO, DisplayName VO, Option types)
- `profileToPersistence()` - Converts Profile aggregate to DB record format

Type check: PASSED

**Task 12 Completed: Create Profile Repository**

Files created:
- `src/adapters/repositories/profile.repository.ts`

Repository methods implemented:
- `create()` - Creates new profile in database
- `update()` - Updates existing profile
- `delete()` - Deletes profile by id
- `findById()` - Finds profile by ProfileId (returns Option)
- `findByUserId()` - Finds profile by userId (returns Option)
- `existsByUserId()` - Checks if profile exists for userId
- `findAll()` - Paginated list of all profiles
- `findMany()` - Filtered paginated list
- `findBy()` - Find by partial props
- `exists()` - Check if profile exists by id
- `count()` - Count total profiles

All methods follow Result<T> pattern for error handling and Option<T> for nullable values.

Type check: PASSED

**Task 13 Completed: Create Profile Controller**

Files created:
- `src/adapters/controllers/profile/profile.controller.ts`

Controller handlers:
- `getProfileController()` - Get current user's profile
- `getProfileByUserIdController()` - Get profile by userId (for viewing other profiles)
- `createProfileController()` - Create new profile for current user
- `updateProfileController()` - Update current user's profile

Helper function:
- `getAuthenticatedUser()` - Gets session via GetSessionUseCase, returns null if not authenticated

All handlers use authentication check and return proper HTTP status codes (401, 400, 404, 409, 500).

Type check: PASSED

**Task 14 Completed: Register Profile DI Module**

Files created:
- `common/di/modules/profile.module.ts`

Files modified:
- `common/di/types.ts` - Added IProfileRepository, CreateProfileUseCase, GetProfileUseCase, UpdateProfileUseCase symbols and types
- `common/di/container.ts` - Loaded ProfileModule

DI bindings:
- `IProfileRepository` → `DrizzleProfileRepository`
- `CreateProfileUseCase` → `CreateProfileUseCase` (depends on IProfileRepository)
- `GetProfileUseCase` → `GetProfileUseCase` (depends on IProfileRepository)
- `UpdateProfileUseCase` → `UpdateProfileUseCase` (depends on IProfileRepository)

Type check: PASSED

**Task 15 Completed: Create Profile API Routes**

Files created:
- `app/api/v1/profile/route.ts` - GET (current user profile), POST (create), PATCH (update)
- `app/api/v1/profile/[userId]/route.ts` - GET (profile by userId for viewing other profiles)

Routes:
- `GET /api/v1/profile` - Get current authenticated user's profile
- `POST /api/v1/profile` - Create profile for current user
- `PATCH /api/v1/profile` - Update current user's profile
- `GET /api/v1/profile/:userId` - Get profile by userId

Type check: PASSED

**Task 16 Completed: Create Expo Profile Types**

Files created:
- `apps/expo/types/profile.ts` - Profile, CreateProfileInput, UpdateProfileInput interfaces
- `apps/expo/types/index.ts` - Barrel export for types

Interfaces:
- `Profile` - id, userId, displayName, bio, avatarUrl, createdAt, updatedAt
- `CreateProfileInput` - displayName (required), bio, avatarUrl (optional)
- `UpdateProfileInput` - displayName, bio, avatarUrl (all optional)

Type check: PASSED

**Task 17 Completed: Create Expo Profile Hooks**

Files created:
- `apps/expo/lib/api/hooks/use-profile.ts` - Profile hooks using Tanstack Query

Hooks implemented:
- `useProfile()` - Fetches current user's profile, returns `null` on 404
- `useProfileByUserId(userId)` - Fetches profile by userId for viewing other profiles
- `useCreateProfile()` - Mutation to create a new profile
- `useUpdateProfile()` - Mutation to update existing profile
- `useEnsureProfile()` - Helper hook that auto-creates profile if it doesn't exist

Query keys for cache management:
- `profileKeys.all` - Base key for all profiles
- `profileKeys.myProfile()` - Key for current user's profile
- `profileKeys.byUserId(userId)` - Key for profile by userId

Features:
- Proper 404 handling (returns `null` instead of throwing)
- Cache invalidation on create/update mutations
- 5 minute stale time for profile queries
- Retry logic that skips retries on 404 errors

Type check: PASSED

**Task 18 Completed: Create Profile Tab Screen**

Files created:
- `apps/expo/app/(protected)/(tabs)/profile.tsx` - Main profile tab screen
- `apps/expo/app/(protected)/profile/edit.tsx` - Placeholder for edit screen (Task 19)
- `apps/expo/app/(protected)/friends/index.tsx` - Placeholder for friends list (Task 62)

Profile screen features:
- Avatar display with pink background (User icon as fallback)
- Display name and member since date
- Bio card (shown when bio exists)
- Informations card with email and name
- Edit profile button (navigates to /profile/edit)
- Friends button (navigates to /friends)
- Sign out button with loading state

Uses:
- `useEnsureProfile()` hook for auto-creating profile
- `useSignOut()` hook for sign out
- `useAuth()` for current user info
- Pink theme colors from HomeCafe brand

Type check: PASSED

**Task 19 Completed: Create Edit Profile Screen**

Files created:
- `apps/expo/lib/validations/profile.ts` - Profile validation schema with Zod
- `apps/expo/app/(protected)/profile/edit.tsx` - Full edit profile screen implementation

Validation schema:
- `displayNameSchema` - Required, 1-50 chars
- `bioSchema` - Optional, max 500 chars
- `updateProfileSchema` - Combines displayName and bio with optional avatarUrl

Edit screen features:
- Header with back navigation (ArrowLeft icon)
- Avatar display with camera icon overlay (placeholder for future upload)
- Form with displayName input and bio textarea
- Bio character counter (0/500)
- Save button triggers `useUpdateProfile()` mutation
- Disabled save when form unchanged (`isDirty` check)
- Loading state during save
- Error handling with form field errors
- Cancel button to go back

Uses:
- `react-hook-form` with `zodResolver` for validation
- `useProfile()` hook to fetch current data
- `useUpdateProfile()` hook for mutation
- `KeyboardAvoidingView` for proper keyboard handling
- Form resets to current profile data on load

Type check: PASSED

**Task 20 Completed: Add Profile Tab to Layout**

Files modified:
- `apps/expo/app/(protected)/(tabs)/_layout.tsx` - Added Profile tab with User icon
- `apps/expo/app/(protected)/(tabs)/index.tsx` - Removed sign out button (moved to profile)

Changes:
- Added `User` icon import from lucide-react-native
- Added Profile tab with title "Profil" and User icon
- Removed sign out button from home screen (already in profile screen)
- Removed unused Button, CardFooter, useSignOut imports from home screen

Tab bar now has 3 tabs: Accueil, Messages, Profil

Type check: PASSED

**Task 21 Completed: Write Unit Tests for Profile Use Cases**

Files created:
- `src/application/use-cases/profile/__tests__/create-profile.use-case.test.ts`
- `src/application/use-cases/profile/__tests__/get-profile.use-case.test.ts`
- `src/application/use-cases/profile/__tests__/update-profile.use-case.test.ts`

CreateProfileUseCase tests:
- Happy path: create profile with all fields, without bio, without avatarUrl
- Validation: empty displayName, displayName > 50 chars, bio > 500 chars
- Business rules: profile already exists for user
- Error handling: repository errors

GetProfileUseCase tests:
- Happy path: return profile when found, return profile without bio
- Not found: return null when profile not found
- Error handling: repository errors

UpdateProfileUseCase tests:
- Happy path: update displayName, bio, avatarUrl, multiple fields at once
- Clear values: set bio to null, set avatarUrl to null
- Validation: empty displayName, displayName > 50 chars, bio > 500 chars
- Business rules: profile not found
- Error handling: repository errors

Test patterns used:
- vitest with describe/it/expect
- vi.mock for repository mocks
- Result and Option from ddd-kit for return types
- Profile.reconstitute() for creating mock profiles

Type check: PASSED

**Task 22 Completed: Profile Feature Validation**

Validation steps:
1. `pnpm type-check` - PASSED
2. `pnpm check` - PASSED (after `pnpm fix` for auto-formatting)
3. `pnpm test` - PASSED after fixing vitest path alias resolution

Issue fixed:
- Tests failed with "Cannot find package '@/domain/profile/profile.aggregate'"
- Root cause: vitest wasn't resolving TypeScript path aliases (`@/`) for transitive imports
- Solution: Added `vite-tsconfig-paths` plugin to `apps/nextjs/vitest.config.ts`

Test results:
- 31 tests passed (6 existing + 25 new profile tests)
- CreateProfileUseCase: 9 tests
- GetProfileUseCase: 4 tests
- UpdateProfileUseCase: 12 tests

Files modified:
- `apps/nextjs/vitest.config.ts` - Added vite-tsconfig-paths plugin
- `apps/nextjs/package.json` - Added vite-tsconfig-paths dependency

**PHASE 1 COMPLETE** - Profile Feature fully implemented and tested!

**Tasks 23-25 Completed: FriendRequest Domain Layer**

Files created:
- `src/domain/friend/friend-request-id.ts` - FriendRequestId UUID class
- `src/domain/friend/friend-request.aggregate.ts` - FriendRequest aggregate with senderId, receiverId, status, createdAt, respondedAt
- `src/domain/friend/value-objects/friend-request-status.vo.ts` - FriendRequestStatus VO with enum (pending, accepted, rejected)
- `src/domain/friend/events/friend-request-sent.event.ts` - FriendRequestSentEvent
- `src/domain/friend/events/friend-request-accepted.event.ts` - FriendRequestAcceptedEvent
- `src/domain/friend/events/friend-request-rejected.event.ts` - FriendRequestRejectedEvent

FriendRequest aggregate methods:
- `create()` - Creates new friend request with pending status, emits FriendRequestSentEvent
- `reconstitute()` - Rebuilds from DB
- `accept()` - Accepts pending request, updates status and respondedAt, emits FriendRequestAcceptedEvent
- `reject()` - Rejects pending request, updates status and respondedAt, emits FriendRequestRejectedEvent

Business rules implemented:
- Cannot send friend request to yourself (validation in create())
- Can only accept/reject pending requests

FriendRequestStatus VO:
- Uses Zod enum validation
- Factory methods: createPending(), createAccepted(), createRejected()
- Convenience getters: isPending, isAccepted, isRejected

Type check: PASSED

**Tasks 26-27 Completed: Notification Domain Layer**

Files created:
- `src/domain/notification/notification-id.ts` - NotificationId UUID class
- `src/domain/notification/notification.aggregate.ts` - Notification aggregate with userId, type, title, body, data, readAt, createdAt
- `src/domain/notification/value-objects/notification-type.vo.ts` - NotificationType VO with enum (friend_request, friend_accepted, new_message)
- `src/domain/notification/events/notification-created.event.ts` - NotificationCreatedEvent
- `src/domain/notification/events/notification-read.event.ts` - NotificationReadEvent

Notification aggregate methods:
- `create()` - Creates new notification, emits NotificationCreatedEvent
- `reconstitute()` - Rebuilds from DB
- `markAsRead()` - Marks notification as read, emits NotificationReadEvent (idempotent - fails if already read)

NotificationType VO:
- Uses Zod enum validation
- Factory methods: createFriendRequest(), createFriendAccepted(), createNewMessage()
- Convenience getters: isFriendRequest, isFriendAccepted, isNewMessage

Type check: PASSED

**DOMAIN LAYER COMPLETE** - All 7 domain tasks completed!

**Tasks 28-30 Completed: Repository Ports**

Files created:
- `src/application/ports/friend-request-repository.port.ts` - IFriendRequestRepository interface
- `src/application/ports/invite-token-repository.port.ts` - IInviteTokenRepository interface with InviteToken type
- `src/application/ports/notification-repository.port.ts` - INotificationRepository interface

IFriendRequestRepository methods:
- Extends BaseRepository<FriendRequest>
- `findById()` - Find by FriendRequestId
- `findByUsers()` - Find by senderId and receiverId
- `findPendingForUser()` - Get pending requests for a user
- `findFriendsForUser()` - Get accepted friendships for a user
- `existsBetweenUsers()` - Check if request exists between two users

IInviteTokenRepository methods:
- `create()` - Create new invite token
- `findByToken()` - Find by token string
- `markAsUsed()` - Mark token as used
- `deleteExpired()` - Clean up expired tokens

INotificationRepository methods:
- Extends BaseRepository<Notification>
- `findById()` - Find by NotificationId
- `findByUserId()` - Get all notifications for a user (paginated)
- `findUnreadByUserId()` - Get unread notifications for a user (paginated)
- `markAsRead()` - Mark notification as read
- `countUnread()` - Count unread notifications for a user

Type check: PASSED

**Task 31 Completed: Friend DTOs**

Files created:
- `src/application/dto/friend/friend-request.dto.ts` - Shared schemas: friendRequestDtoSchema, friendDtoSchema
- `src/application/dto/friend/send-friend-request.dto.ts` - Input: receiverEmail, Output: requestId, status, message
- `src/application/dto/friend/respond-friend-request.dto.ts` - Input: requestId, accept, Output: success, message
- `src/application/dto/friend/get-friends.dto.ts` - Input: userId, pagination, Output: friends array with pagination
- `src/application/dto/friend/get-pending-requests.dto.ts` - Input: userId, pagination, Output: requests with sender info and pagination
- `src/application/dto/friend/get-invite-link.dto.ts` - Input: userId, Output: inviteUrl, token, expiresAt
- `src/application/dto/friend/accept-invite.dto.ts` - Input: token, userId, Output: success, friendId, friendName, message

Type check: PASSED

**Task 32 Completed: Notification DTOs**

Files created:
- `src/application/dto/notification/notification.dto.ts` - Shared schemas: notificationDtoSchema, notificationTypeSchema
- `src/application/dto/notification/get-notifications.dto.ts` - Input: userId, unreadOnly, pagination, Output: notifications array, unreadCount, pagination
- `src/application/dto/notification/mark-notification-read.dto.ts` - Input: notificationId, userId, Output: success, message

Type check: PASSED

**Task 33 Completed: SendFriendRequest Use Case**

Files created:
- `src/application/use-cases/friend/send-friend-request.use-case.ts`

Use case responsibilities:
- Inject IUserRepository, IFriendRequestRepository, INotificationRepository, IEmailProvider, appUrl
- Look up receiver by email in user repository
- If user exists:
  - Validate sender is not the receiver (cannot friend yourself)
  - Check no existing friend request between users
  - Create FriendRequest aggregate (pending status)
  - Create Notification for receiver (friend_request type)
  - Return status: "request_sent" or "already_friends"
- If user doesn't exist:
  - Send invitation email via IEmailProvider with signup link
  - Return status: "invitation_sent"
- Uses match pattern for Option handling

Type check: PASSED

**Task 34 Completed: RespondFriendRequest Use Case**

Files created:
- `src/application/use-cases/friend/respond-friend-request.use-case.ts`

Use case responsibilities:
- Inject IFriendRequestRepository, INotificationRepository, IProfileRepository
- Find friend request by ID (FriendRequestId)
- Verify current user is the receiver (authorization)
- Call accept() or reject() on FriendRequest aggregate based on input
- Persist updated friend request
- If accepted: create notification for sender (friend_accepted type) with acceptor's display name
- Return success/message response

Type check: PASSED

**Task 35 Completed: GetFriends Use Case**

Files created:
- `src/application/use-cases/friend/get-friends.use-case.ts`

Use case responsibilities:
- Inject IFriendRequestRepository, IUserRepository, IProfileRepository
- Query accepted friend requests via findFriendsForUser()
- For each request, determine friend user ID (sender or receiver based on current user)
- Map each friend to IFriendDto with user details (email, name) and profile details (displayName, avatarUrl)
- Returns paginated friends array

Key patterns:
- Uses `UserId.create(new UUID(friendUserId))` to convert string ID to UserId VO
- Uses match pattern for Option handling on profile data
- Handles case where user is not found gracefully (returns null, skips friend)

Type check: PASSED

