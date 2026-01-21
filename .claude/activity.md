# HomeCafe Feature Development - Activity Log

## Current Status

**Last Updated:** 2026-01-21
**Tasks Completed:** 71/71
**Current Task:** All Complete
**Current Phase:** Phase 2 - Friends & Notifications (COMPLETE)

---

## Progress Summary

| Category | Total | Completed |
|----------|-------|-----------|
| Domain | 7 | 7 |
| Application | 18 | 18 |
| Infrastructure | 6 | 6 |
| Adapter | 10 | 10 |
| API | 3 | 3 |
| Expo | 19 | 16 |
| Testing | 4 | 3 |
| Validation | 3 | 3 |

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

Type check: PASSED Re

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

**Task 36 Completed: GetPendingRequests Use Case**

Files created:
- `src/application/use-cases/friend/get-pending-requests.use-case.ts`

Use case responsibilities:
- Inject IFriendRequestRepository, IUserRepository, IProfileRepository
- Query pending friend requests via findPendingForUser()
- For each request, get sender user and profile details
- Map to IPendingRequestWithSenderDto with full request info plus sender details
- Returns paginated requests array

Key patterns:
- Uses `UserId.create(new UUID(senderId))` to convert string ID to UserId VO
- Uses match pattern for Option handling on profile data and respondedAt
- respondedAt is Option<Date> so use match to convert to ISO string or null

Type check: PASSED

**Task 37 Completed: GetInviteLink Use Case**

Files created:
- `src/application/use-cases/friend/get-invite-link.use-case.ts`

Use case responsibilities:
- Inject IInviteTokenRepository and appUrl (for building invite URL)
- Generate unique invite token using UUID
- Set token expiry to 24 hours from now
- Persist token via inviteTokenRepo.create()
- Return invite URL in format: {appUrl}/invite/{token}

Key patterns:
- Uses `new UUID<string>().value.toString()` to generate unique token
- Expiry calculated by adding 24 hours to current date
- Returns token, inviteUrl, and expiresAt as ISO string

Type check: PASSED

**Task 38 Completed: AcceptInviteLink Use Case**

Files created:
- `src/application/use-cases/friend/accept-invite-link.use-case.ts`

Use case responsibilities:
- Inject IInviteTokenRepository, IFriendRequestRepository, IUserRepository, IProfileRepository, INotificationRepository
- Validate invite token exists, not already used, and not expired
- Check that acceptor is not the inviter (cannot accept own invite)
- Check if already friends using existsBetweenUsers()
- Get inviter user info and validate they still exist
- Create FriendRequest with status=accepted directly (using FriendRequestStatus.createAccepted())
- Mark invite token as used
- Create notifications for both users (inviter and acceptor) with friend_accepted type
- Return success with friendId and friendName

Key patterns:
- Uses `FriendRequestStatus.createAccepted()` to create accepted status directly
- Uses `OptionClass.some(new Date())` for respondedAt on accepted request
- Uses match pattern for profile handling with proper type inference
- Returns user-friendly error messages for invalid/expired/used tokens

Type check: PASSED

**Task 39 Completed: GetNotifications Use Case**

Files created:
- `src/application/use-cases/notification/get-notifications.use-case.ts`

Use case responsibilities:
- Inject INotificationRepository
- Support pagination (page, limit with defaults)
- Support filtering by unreadOnly (uses findUnreadByUserId vs findByUserId)
- Get unread count separately for badge display
- Map notification aggregates to DTOs

Key patterns:
- Uses match pattern to handle Option<Date> for readAt
- Returns notifications array, unreadCount, and pagination metadata
- Notification type cast to enum string union for DTO

Type check: PASSED

**Task 40 Completed: MarkNotificationRead Use Case**

Files created:
- `src/application/use-cases/notification/mark-notification-read.use-case.ts`

Use case responsibilities:
- Inject INotificationRepository
- Find notification by ID (NotificationId)
- Verify current user owns the notification (userId check)
- Handle idempotent read (return success if already read)
- Call markAsRead() on aggregate and persist

Key patterns:
- Uses NotificationId.create(new UUID(stringId)) for domain ID conversion
- Uses notification.isRead getter to check current state
- Returns user-friendly messages for success cases

Type check: PASSED

**APPLICATION LAYER COMPLETE** - All 18 application tasks completed!

**Task 41 Completed: Create Drizzle Schema for Friends**

Files created:
- `packages/drizzle/src/schema/friend.ts` - Friend request and invite token tables

Files modified:
- `packages/drizzle/src/schema/index.ts` - Added friend export

Tables defined:

`friend_request` table:
- id (text, primary key)
- senderId (text, FK to user.id, cascade delete)
- receiverId (text, FK to user.id, cascade delete)
- status (text, not null)
- createdAt (timestamp, default now)
- respondedAt (timestamp, nullable)
- Indexes: sender_id_idx, receiver_id_idx, unique (senderId, receiverId)

`invite_token` table:
- id (text, primary key)
- userId (text, FK to user.id, cascade delete)
- token (text, not null, unique index)
- expiresAt (timestamp, not null)
- usedAt (timestamp, nullable)
- createdAt (timestamp, default now)
- Indexes: unique token_idx, user_id_idx

Migration generated: `migrations/0003_sad_unus.sql`

Type check: PASSED

**Task 42 Completed: Create Drizzle Schema for Notifications**

Files created:
- `packages/drizzle/src/schema/notification.ts` - Notification table

Files modified:
- `packages/drizzle/src/schema/index.ts` - Added notification export

`notification` table:
- id (text, primary key)
- userId (text, FK to user.id, cascade delete)
- type (text, not null)
- title (text, not null)
- body (text, not null)
- data (jsonb, not null, typed as Record<string, unknown>)
- readAt (timestamp, nullable)
- createdAt (timestamp, default now)
- Indexes: (userId, createdAt), (userId, readAt)

Migration generated: `migrations/0004_flippant_drax.sql`

Type check: PASSED

**Task 43 Completed: Run Database Migration for Friends & Notifications**

Migration applied using `npx drizzle-kit push --force`:

Tables created:
- `friend_request` - Friend request records
- `invite_token` - Invite link tokens
- `notification` - User notifications

Foreign keys:
- `friend_request.sender_id` → `user.id` (cascade delete)
- `friend_request.receiver_id` → `user.id` (cascade delete)
- `invite_token.user_id` → `user.id` (cascade delete)
- `notification.user_id` → `user.id` (cascade delete)

Indexes created:
- `friend_request_sender_id_idx`
- `friend_request_receiver_id_idx`
- `friend_request_pair_idx` (unique)
- `invite_token_token_idx` (unique)
- `invite_token_user_id_idx`
- `notification_user_id_created_at_idx`
- `notification_user_id_read_at_idx`

**INFRASTRUCTURE LAYER COMPLETE** - All 6 infrastructure tasks completed!

**Task 44 Completed: Create FriendRequest Mapper**

Files created:
- `src/adapters/mappers/friend-request.mapper.ts`

Mapper functions:
- `friendRequestToDomain(record)` - Converts DB record to FriendRequest aggregate
  - Reconstitutes FriendRequestStatus VO from string
  - Uses Option.fromNullable() for respondedAt (nullable timestamp)
  - Creates FriendRequestId from UUID
- `friendRequestToPersistence(friendRequest)` - Converts FriendRequest aggregate to DB record
  - Extracts status value from VO
  - Handles Option<Date> for respondedAt (converts to Date | null)
  - Converts ID to string

Type inference: Uses `typeof friendRequestTable.$inferSelect` for record type

Type check: PASSED

**Task 45 Completed: Create Notification Mapper**

Files created:
- `src/adapters/mappers/notification.mapper.ts`

Mapper functions:
- `notificationToDomain(record)` - Converts DB record to Notification aggregate
  - Reconstitutes NotificationType VO from string
  - Uses Option.fromNullable() for readAt (nullable timestamp)
  - Passes through data field as Record<string, unknown> (JSONB)
  - Creates NotificationId from UUID
- `notificationToPersistence(notification)` - Converts Notification aggregate to DB record
  - Extracts type value from VO
  - Handles Option<Date> for readAt (converts to Date | null)
  - Passes through data field directly
  - Converts ID to string

Type inference: Uses `typeof notificationTable.$inferSelect` for record type

Type check: PASSED

**Task 46 Completed: Create FriendRequest Repository**

Files created:
- `src/adapters/repositories/friend-request.repository.ts`

Repository methods implemented:
- `create()` - Creates new friend request in database (with transaction support)
- `update()` - Updates existing friend request (status, respondedAt)
- `delete()` - Deletes friend request by id
- `findById()` - Finds friend request by FriendRequestId (returns Option)
- `findByUsers()` - Finds request between two users (either direction)
- `findPendingForUser()` - Paginated pending requests where user is receiver
- `findFriendsForUser()` - Paginated accepted friendships where user is sender or receiver
- `existsBetweenUsers()` - Checks if any request exists between two users
- `findAll()` - Paginated list of all friend requests
- `findMany()` - Filtered paginated list by senderId/receiverId
- `findBy()` - Find by partial props (delegates to findByUsers)
- `exists()` - Check if friend request exists by id
- `count()` - Count total friend requests

Key patterns used:
- `and()`, `or()`, `eq()`, `desc()` operators from drizzle-orm for complex queries
- `FriendRequestStatusEnum.PENDING/ACCEPTED` for status filtering
- Transaction support via `getDb(trx)` pattern
- `DEFAULT_PAGINATION`, `createPaginatedResult()` for pagination

Type check: PASSED

**Task 47 Completed: Create InviteToken Repository**

Files created:
- `src/adapters/repositories/invite-token.repository.ts`

Repository methods implemented:
- `create()` - Creates new invite token in database with generated UUID
- `findByToken()` - Finds invite token by token string (returns Option)
- `markAsUsed()` - Updates token with usedAt timestamp
- `deleteExpired()` - Deletes all tokens where expiresAt < now, returns count

Key patterns used:
- `eq()`, `lt()` operators from drizzle-orm
- Simple InviteToken type (not a domain aggregate, just a data structure)
- UUID generation for token IDs

Type check: PASSED

**Task 48 Completed: Create Notification Repository**

Files created:
- `src/adapters/repositories/notification.repository.ts`

Repository methods implemented:
- `create()` - Creates new notification in database (with transaction support)
- `update()` - Updates notification (primarily readAt field)
- `delete()` - Deletes notification by id
- `findById()` - Finds notification by NotificationId (returns Option)
- `findByUserId()` - Paginated notifications for a user, ordered by createdAt desc
- `findUnreadByUserId()` - Paginated unread notifications (where readAt is null)
- `markAsRead()` - Updates notification with current timestamp as readAt
- `countUnread()` - Counts unread notifications for a user
- `findAll()` - Paginated list of all notifications
- `findMany()` - Filtered paginated list by userId
- `findBy()` - Find single notification by props
- `exists()` - Check if notification exists by id
- `count()` - Count total notifications

Key patterns used:
- `and()`, `eq()`, `isNull()`, `desc()` operators from drizzle-orm
- Transaction support via `getDb(trx)` pattern
- `DEFAULT_PAGINATION`, `createPaginatedResult()` for pagination
- Uses notification mapper for domain ↔ persistence conversion

Type check: PASSED

**Task 49 Completed: Create Friend Controller**

Files verified (already existed):
- `src/adapters/controllers/friend/friend.controller.ts`

Controller handlers implemented:
- `sendRequest()` - Send friend request by email
- `respondRequest()` - Accept or reject friend request
- `getFriends()` - Get list of friends with pagination
- `getPendingRequests()` - Get pending friend requests with pagination
- `getInviteLink()` - Generate invite link for sharing
- `acceptInvite()` - Accept invite token from another user

Helper function:
- `getAuthenticatedUser()` - Gets session via GetSessionUseCase, returns null if not authenticated

Error handling:
- 401 Unauthorized for unauthenticated requests
- 400 Bad Request for validation errors
- 404 Not Found for missing resources
- 409 Conflict for duplicate/existing states
- 500 Internal Server Error for unexpected failures

Type check: PASSED

**Task 50 Completed: Create Notification Controller**

Files verified (already existed):
- `src/adapters/controllers/notification/notification.controller.ts`

Controller handlers implemented:
- `getNotifications()` - Get notifications list with pagination and unreadOnly filter
- `markAsRead()` - Mark notification as read by ID
- `getUnreadCount()` - Get count of unread notifications for badge display

Helper function:
- `getAuthenticatedUser()` - Gets session via GetSessionUseCase, returns null if not authenticated

Error handling:
- 401 Unauthorized for unauthenticated requests
- 400 Bad Request for validation errors
- 403 Forbidden for unauthorized access
- 404 Not Found for missing notifications
- 500 Internal Server Error for unexpected failures

Type check: PASSED

**ADAPTER LAYER COMPLETE** - All 10 adapter tasks completed!

**Task 51 Completed: Extend SSE Controller for Notifications**

Files verified (already existed):
- `src/adapters/controllers/chat/sse.controller.ts`

SSE notification support already implemented:
- `"notification"` event type added to `SSEMessage` interface
- `broadcastNotification()` function to send notifications to specific users
- Supports notification types: `friend_request`, `friend_accepted`, `new_message`
- Sends notificationId, type, title, body, and optional data payload

Type check: PASSED

**Tasks 52-53 Completed: Register DI Modules**

Files verified (already existed):
- `common/di/modules/friend.module.ts` - Friend DI module
- `common/di/modules/notification.module.ts` - Notification DI module
- `common/di/types.ts` - DI symbols and types
- `common/di/container.ts` - Loads both modules

Friend Module bindings:
- `IFriendRequestRepository` → `DrizzleFriendRequestRepository`
- `IInviteTokenRepository` → `DrizzleInviteTokenRepository`
- `INotificationRepository` → `DrizzleNotificationRepository`
- `SendFriendRequestUseCase` with dependencies
- `RespondFriendRequestUseCase` with dependencies
- `GetFriendsUseCase` with dependencies
- `GetPendingRequestsUseCase` with dependencies
- `GetInviteLinkUseCase` with dependencies
- `AcceptInviteLinkUseCase` with dependencies

Notification Module bindings:
- `GetNotificationsUseCase` with dependencies (INotificationRepository)
- `MarkNotificationReadUseCase` with dependencies (INotificationRepository)

Container loads both FriendModule and NotificationModule.

Type check: PASSED

**Tasks 54-55 Completed: API Routes**

Files verified (already existed):

Friend API Routes (`app/api/v1/friends/`):
- `route.ts` - GET (getFriends), POST (sendRequest)
- `requests/route.ts` - GET (getPendingRequests)
- `requests/[id]/respond/route.ts` - POST (respondRequest)
- `invite/route.ts` - GET (getInviteLink)
- `invite/accept/route.ts` - POST (acceptInvite)

Notification API Routes (`app/api/v1/notifications/`):
- `route.ts` - GET (getNotifications)
- `[id]/read/route.ts` - POST (markAsRead)
- `unread-count/route.ts` - GET (getUnreadCount)

**API LAYER COMPLETE** - All 3 API tasks completed!

Type check: PASSED

**Tasks 56-59 Completed: Expo Types and Hooks**

Files verified (already existed):

Expo Types:
- `apps/expo/types/friend.ts` - Friend, FriendRequest, InviteLink, Pagination interfaces
- `apps/expo/types/notification.ts` - Notification, NotificationType interfaces
- `apps/expo/types/index.ts` - Barrel exports

Expo Friend Hooks (`apps/expo/lib/api/hooks/`):
- `use-friends.ts` - useFriends(), useSendFriendRequest()
- `use-friend-requests.ts` - usePendingRequests(), useRespondRequest()
- `use-invite.ts` - useGenerateInvite(), useAcceptInvite()

Expo Notification Hooks:
- `use-notifications.ts` - useNotifications(), useMarkRead(), useUnreadCount()

Expo SSE Hook (`apps/expo/lib/sse/use-sse.ts`):
- Already handles 'notification' event type
- handleNotification() invalidates notificationKeys.all on event
- Full event switch case for all event types

Type check: PASSED

**Task 61 Completed: Add Notifications Tab to Layout**

Modified file:
- `apps/expo/app/(protected)/(tabs)/_layout.tsx`

Changes:
- Added Bell icon import from lucide-react-native
- Added useUnreadCount hook to fetch unread notification count
- Created NotificationBadge component with pink badge for unread count
- Added Notifications tab between Messages and Profile
- Badge shows count (capped at 99+) when unread > 0

Tab order: Accueil → Messages → Notifications → Profil

Type check: PASSED

**Task 60 Completed: Create Notifications Tab Screen**

Files verified (already existed):

Screen structure (`apps/expo/app/(protected)/(tabs)/notifications/`):
- `_layout.tsx` - Stack layout with hidden header
- `index.tsx` - Main notifications screen

Components (`_components/`):
- `notification-item.tsx` - Individual notification with unread dot, icons, timestamp
- `empty-state.tsx` - Empty state with bell icon
- `skeleton.tsx` - Loading shimmer animation

Features implemented:
- FlatList for notification display with pull-to-refresh
- Unread indicator (pink dot) on unread notifications
- Different icons/colors per notification type (friend_request, friend_accepted, new_message)
- Friend request actions inline (Accept/Reject buttons)
- Timestamp formatting with relative times (À l'instant, min, h, Hier, jours)
- Mark as read on tap
- SSE real-time updates via useSSE() hook
- Loading skeleton with shimmer animation
- Empty state for no notifications

Type check: PASSED

**Task 62 Completed: Create Friends List Screen**

Files modified:
- `apps/expo/app/(protected)/friends/index.tsx` - Full implementation

Features implemented:
- FlatList for friend display with pull-to-refresh
- FriendItem component showing avatar (or initial), displayName/name/email, and email
- EmptyState with CTA button to add friends
- FriendListSkeleton for loading state
- Plus (+) button in header to navigate to add friend screen
- Uses useFriends() hook for data fetching
- Avatar URL handling (relative/absolute URLs)

Also created placeholder:
- `apps/expo/app/(protected)/friends/add.tsx` - Placeholder for Task 63

Type check: PASSED

**Task 63 Completed: Create Add Friend Screen**

Files modified:
- `apps/expo/app/(protected)/friends/add.tsx` - Full implementation
- `apps/expo/lib/api/hooks/use-friends.ts` - Updated mutation response type
- `apps/expo/types/friend.ts` - Added SendFriendRequestStatus and SendFriendRequestResponse types

Features implemented:
- Email input field with mail icon
- Send request button with loading state
- Success feedback with different messages based on status:
  - "request_sent" - Friend request sent to existing user
  - "invitation_sent" - Email invitation sent to non-user
  - "already_friends" - Users are already friends
- Error feedback for failed requests
- Keyboard handling with KeyboardAvoidingView
- Basic email validation (contains @ and .)
- Back navigation with ArrowLeft header button
- Different icons for each status type (UserPlus, Mail, Check)

Type fixes:
- Changed SendFriendRequestInput from `receiverId` to `receiverEmail` to match API
- Added SendFriendRequestStatus type union
- Added SendFriendRequestResponse interface with requestId, status, message

Type check: PASSED

**Task 64 Completed: Create QR Code Display Screen**

Files created:
- `apps/expo/app/(protected)/friends/qr-code.tsx` - QR code display screen

Dependencies added:
- `react-native-qrcode-svg` - QR code generation library
- `expo-sharing` - Share functionality

Features implemented:
- QR code display using react-native-qrcode-svg
- Uses useGenerateInvite() hook to fetch invite link
- Loading state with QRCodeSkeleton component
- Error state with retry button
- Share button using expo-sharing
- Back navigation with ArrowLeft header button
- HomeCafe styling (pink accents, proper colors)

Type check: PASSED

**Task 65 Completed: Create QR Code Scanner Screen**

Files created:
- `apps/expo/app/(protected)/friends/scan.tsx` - QR code scanner screen

Dependencies added:
- `expo-camera` - Camera and barcode scanning

Features implemented:
- CameraView with barcode scanning using expo-camera
- Permission request handling with friendly UI
- Token extraction from scanned URL or raw token
- Uses useAcceptInvite() hook to accept invite
- Success/error feedback screens
- "Scan again" option on error
- Camera frame overlay for scanning guidance
- Processing state while accepting invite
- Back navigation with ArrowLeft header button

Scan flow:
1. Request camera permission
2. Show camera with QR frame
3. On scan: extract token from URL
4. Call acceptInvite API
5. Show success (friend added) or error

Type check: PASSED

**Task 66 Completed: Add Friends Entry Point from Profile**

Files modified:
- `apps/expo/app/(protected)/friends/index.tsx` - Added navigation buttons

Features verified/implemented:
- Profile screen already has "Mes amis" button navigating to /friends (existed in Task 18)
- Friends list screen now has header with:
  - Back button (ArrowLeft) to go back
  - QR Code button (QrCode) to navigate to /friends/qr-code
  - Scan button (ScanLine) to navigate to /friends/scan
  - Add friend button (UserPlus) to navigate to /friends/add

Icons used: ArrowLeft, QrCode, ScanLine, UserPlus (replaced Plus)

Fixed: Regenerated Expo routes with `npx expo customize tsconfig.json` to resolve typed route errors

Type check: PASSED

**Task 67 Completed: Handle Deep Link for Invite**

Files created:
- `apps/expo/app/invite/[token].tsx` - Deep link handler for invite URLs

Files modified:
- `apps/expo/app/_layout.tsx` - Added invite route to Stack navigator
- `apps/nextjs/common/di/modules/friend.module.ts` - Added MOBILE_APP_SCHEME for invite URL generation
- `apps/nextjs/src/application/use-cases/friend/get-invite-link.use-case.ts` - Renamed param to inviteBaseUrl

Deep link configuration:
- App scheme already configured: `evahomecafeapp://` in app.json
- Invite links now generated as: `evahomecafeapp://invite/{token}`
- GetInviteLinkUseCase uses MOBILE_APP_SCHEME env var (default: evahomecafeapp://invite)

Invite screen features:
- Handles `evahomecafeapp://invite/[token]` deep links
- Shows loading state while checking auth
- Redirects unauthenticated users to registration with invite query param
- Processing state while accepting invite
- Success state with "Voir mes amis" button
- Error state with message and "Retour à l'accueil" button
- Uses useAcceptInvite() hook for API call

Type check: PASSED

**Task 68 Completed: Write Unit Tests for Friend Use Cases**

Files created:
- `src/application/use-cases/friend/__tests__/send-friend-request.use-case.test.ts`
- `src/application/use-cases/friend/__tests__/respond-friend-request.use-case.test.ts`
- `src/application/use-cases/friend/__tests__/get-invite-link.use-case.test.ts`
- `src/application/use-cases/friend/__tests__/accept-invite-link.use-case.test.ts`

Test coverage:

SendFriendRequestUseCase (8 tests):
- Happy path: send request to existing user, send invitation email to non-user, already_friends status
- Validation: cannot send to yourself
- Error handling: user repository error, friend request repository error, email provider error, save failed

RespondFriendRequestUseCase (6 tests):
- Happy path: accept request, reject request
- Authorization: fail when user is not receiver
- Not found: fail when request not found
- Error handling: repository findById error, repository update error

GetInviteLinkUseCase (5 tests):
- Happy path: generate invite link with correct URL format, correct token
- Error handling: repository create error
- Token validation: unique tokens generated, correct expiration (24h)

AcceptInviteLinkUseCase (9 tests):
- Happy path: accept invite link successfully
- Invalid token: not found, already used, expired
- Business rules: cannot accept own invite, already friends, inviter no longer exists
- Error handling: token repository error, friend request repository error

Key fixes applied:
- Fixed UUID mocking: Pass `new UUID(id)` to `User.create()` instead of modifying `_id.value` after creation
- Added missing `image: Option.none()` to User props (required field)
- Changed `avatarUrl: null` to `avatarUrl: Option.none()` in Profile creation

Test results: 28 tests passed (4 test files)

Type check: PASSED

**Task 69 Completed: Write Unit Tests for Notification Use Cases**

Files created:
- `src/application/use-cases/notification/__tests__/get-notifications.use-case.test.ts`
- `src/application/use-cases/notification/__tests__/mark-notification-read.use-case.test.ts`

Test coverage:

GetNotificationsUseCase (9 tests):
- Happy path: return all notifications for user, return only unread when unreadOnly is true, apply custom pagination, map notification to DTO correctly, return null for readAt when unread, return empty list when no notifications
- Error handling: fail when findByUserId returns error, fail when findUnreadByUserId returns error, fail when countUnread returns error

MarkNotificationReadUseCase (6 tests):
- Happy path: mark notification as read successfully, return success when already read
- Authorization: fail when user does not own the notification
- Not found: fail when notification not found
- Error handling: fail when repository findById returns error, fail when repository update returns error

Key patterns used:
- NotificationType.create() for creating type VOs
- Notification.reconstitute() for mock notification creation
- Option.some()/Option.none() for optional readAt field
- PaginatedResult structure matching repository interface

TypeScript fix: Added non-null assertion (`!`) for array access after toHaveLength assertion to satisfy strict null checks

Test results: 15 tests passed (2 test files)

Type check: PASSED

**Task 70 Completed: Final Validation**

Validation checks performed:

1. **pnpm type-check** - PASSED
   - All packages compile without TypeScript errors
   - 6 packages validated: @packages/ddd-kit, @packages/drizzle, @packages/ui, expo, nextjs

2. **pnpm check** - PASSED
   - Biome lint/format check on 362 files
   - 5 warnings (all in test files for non-null assertions, acceptable)

3. **pnpm test** - PASSED
   - Total: 93 tests passing
   - @packages/ddd-kit: 19 tests (2 files)
   - nextjs: 74 tests (10 files)
   - Test coverage includes: Profile use cases (25 tests), Friend use cases (28 tests), Notification use cases (15 tests)

4. **Console.log audit** - PASSED
   - Only console.log found in `resend.service.ts` for dev environment email display
   - This is intentional development tooling, not production code

5. **Any types audit** - PASSED
   - No `: any` or `as any` found in nextjs/src or expo directories

**PHASE 2 COMPLETE** - All 70 tasks for Profile & Friends & Notifications feature are done!

Summary:
- Phase 1 (Tasks 1-22): Profile Feature - Complete
- Phase 2 (Tasks 23-70): Friends & Notifications - Complete

Remaining: Task 71 (Profile UI) is a separate UI task that requires design implementation

**Task 71 Completed: Profile UI**

Implemented the Profile screen UI matching the design at `.claude/screenshots/profile.png`.

File modified:
- `apps/expo/app/(protected)/(tabs)/profile.tsx` - Complete redesign of profile screen

UI sections implemented:
1. **Header** - Logo (home café) + hamburger menu icon
2. **Profile hero** - Avatar, name, member since date
3. **Contact info** - Birthdate, email, phone, location with icons (Calendar, Mail, Phone, MapPin)
4. **Informations personnelles card** - Two-column layout with Nom, Prénom, Naissance, E-mail, Profession, Téléphone
5. **Adresse card** - Two-column layout with address fields (Numéro et nom de voie, Code postal, Ville, Pays)
6. **Préférences card** - Dropdown fields for Langue and Format heure, Switch toggle for Profil visible
7. **Badges card** - Three badge placeholders (7 jours, 14 jours, 1 mois) with colored circles
8. **Code amis card** - QR code using react-native-qrcode-svg with useGenerateInvite() hook
9. **Footer actions** - Se déconnecter (pink text) and Supprimer le compte (red text) buttons

Components added:
- `InfoRow` - Reusable component for label/value pairs in two-column layouts
- `DropdownField` - Dropdown field placeholder with chevron icon

New imports:
- `Logo` from components/ui/logo
- `useGenerateInvite` from lib/api/hooks/use-invite
- `QRCode` from react-native-qrcode-svg
- `Switch` from react-native
- Additional Lucide icons: Calendar, ChevronDown, Mail, MapPin, Menu, Phone

Type check: PASSED

**ALL TASKS COMPLETE** - All 71 tasks for Profile & Friends & Notifications feature are done!
