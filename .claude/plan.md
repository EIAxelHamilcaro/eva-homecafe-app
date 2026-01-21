# HomeCafe Feature Plan - Profile & Friends & Notifications

## Overview

**Phase 1: Profile Feature (Tasks 1-22)**
Complete CRUD for user profile with separate domain entity. The Profile entity is completely separate from BetterAuth's User table to avoid polluting the auth system.

**Phase 2: Friends & Notifications (Tasks 23-70)**
Friend invitations (email + QR code), notifications system with real-time updates via SSE.

**Scope**: `apps/expo/` (React Native) and `apps/nextjs/` (server-side only)

**Reference:** `CLAUDE.md` for architecture patterns

---

## CRITICAL CONSTRAINTS

1. **DO NOT** modify `user`, `account`, `session`, `verification` tables - they are reserved for BetterAuth
2. **Profile** is a SEPARATE entity linked to User by `userId` field
3. **NO address field** in Profile (not needed)
4. **NO badges** in Profile (will be implemented later)
5. Follow Clean Architecture: Domain → Application → Adapters → Infrastructure

---

## Task List

```json
[
  {
    "id": 1,
    "category": "domain",
    "description": "Create Profile Aggregate",
    "steps": [
      "Create src/domain/profile/profile-id.ts (UUID-based ID)",
      "Create src/domain/profile/profile.aggregate.ts with props: userId (string, ref to auth user), displayName, bio, avatarUrl, createdAt, updatedAt",
      "Implement static create() and reconstitute() methods",
      "Add updateDisplayName(), updateBio(), updateAvatar() methods",
      "Use z.string().min(1) for userId (BetterAuth compatibility)"
    ],
    "passes": true
  },
  {
    "id": 2,
    "category": "domain",
    "description": "Create Profile Value Objects",
    "steps": [
      "Create src/domain/profile/value-objects/display-name.vo.ts (min 1, max 50 chars)",
      "Create src/domain/profile/value-objects/bio.vo.ts (optional, max 500 chars)"
    ],
    "passes": true
  },
  {
    "id": 3,
    "category": "domain",
    "description": "Create Profile Domain Events",
    "steps": [
      "Create src/domain/profile/events/profile-created.event.ts",
      "Create src/domain/profile/events/profile-updated.event.ts"
    ],
    "passes": true
  },
  {
    "id": 4,
    "category": "application",
    "description": "Create Profile Repository Port",
    "steps": [
      "Create src/application/ports/profile-repository.port.ts",
      "Define methods: create, update, findById, findByUserId, exists"
    ],
    "passes": true
  },
  {
    "id": 5,
    "category": "application",
    "description": "Create Profile DTOs",
    "steps": [
      "Create src/application/dto/profile/profile.dto.ts (shared profile shape: id, userId, displayName, bio, avatarUrl)",
      "Create src/application/dto/profile/create-profile.dto.ts (input: userId, displayName, bio?, avatarUrl?)",
      "Create src/application/dto/profile/update-profile.dto.ts (input: profileId, displayName?, bio?, avatarUrl?)",
      "Create src/application/dto/profile/get-profile.dto.ts (input: userId, output: profile)"
    ],
    "passes": true
  },
  {
    "id": 6,
    "category": "application",
    "description": "Create CreateProfile Use Case",
    "steps": [
      "Create src/application/use-cases/profile/create-profile.use-case.ts",
      "Validate userId exists (optional: check auth user exists)",
      "Check profile doesn't already exist for userId",
      "Create Profile aggregate and persist",
      "Dispatch ProfileCreatedEvent"
    ],
    "passes": true
  },
  {
    "id": 7,
    "category": "application",
    "description": "Create GetProfile Use Case",
    "steps": [
      "Create src/application/use-cases/profile/get-profile.use-case.ts",
      "Find profile by userId",
      "Return Option<ProfileDto>"
    ],
    "passes": true
  },
  {
    "id": 8,
    "category": "application",
    "description": "Create UpdateProfile Use Case",
    "steps": [
      "Create src/application/use-cases/profile/update-profile.use-case.ts",
      "Find profile by userId, verify ownership",
      "Update only provided fields (displayName, bio, avatarUrl)",
      "Dispatch ProfileUpdatedEvent"
    ],
    "passes": true
  },
  {
    "id": 9,
    "category": "infrastructure",
    "description": "Create Drizzle Schema for Profile",
    "steps": [
      "Create packages/drizzle/src/schema/profile.ts",
      "Define profiles table: id (text pk), userId (text unique, FK to user.id), displayName (text), bio (text nullable), avatarUrl (text nullable), createdAt, updatedAt",
      "Add unique index on userId",
      "Export from packages/drizzle/src/schema/index.ts"
    ],
    "passes": true
  },
  {
    "id": 10,
    "category": "infrastructure",
    "description": "Run Database Migration for Profile",
    "steps": [
      "Run pnpm db:push to apply schema changes",
      "Verify profiles table created correctly"
    ],
    "passes": true
  },
  {
    "id": 11,
    "category": "adapter",
    "description": "Create Profile Mapper",
    "steps": [
      "Create src/adapters/mappers/profile.mapper.ts",
      "Implement toDomain() and toPersistence() methods"
    ],
    "passes": true
  },
  {
    "id": 12,
    "category": "adapter",
    "description": "Create Profile Repository",
    "steps": [
      "Create src/adapters/repositories/profile.repository.ts",
      "Implement all port methods using Drizzle",
      "Handle Option for findByUserId"
    ],
    "passes": true
  },
  {
    "id": 13,
    "category": "adapter",
    "description": "Create Profile Controller",
    "steps": [
      "Create src/adapters/controllers/profile/profile.controller.ts",
      "Implement getProfile, createProfile, updateProfile handlers",
      "Use requireAuth guard for all endpoints"
    ],
    "passes": true
  },
  {
    "id": 14,
    "category": "infrastructure",
    "description": "Register Profile DI Module",
    "steps": [
      "Create common/di/modules/profile.module.ts",
      "Bind IProfileRepository and all profile use cases",
      "Register in common/di/container.ts"
    ],
    "passes": true
  },
  {
    "id": 15,
    "category": "api",
    "description": "Create Profile API Routes",
    "steps": [
      "Create app/api/profile/route.ts (GET current user profile, POST create, PATCH update)",
      "Create app/api/profile/[userId]/route.ts (GET profile by userId - for viewing other profiles)"
    ],
    "passes": true
  },
  {
    "id": 16,
    "category": "expo",
    "description": "Create Expo Profile Types",
    "steps": [
      "Create apps/expo/types/profile.ts with Profile interface",
      "Export from apps/expo/types/index.ts"
    ],
    "passes": true
  },
  {
    "id": 17,
    "category": "expo",
    "description": "Create Expo Profile Hooks",
    "steps": [
      "Create apps/expo/hooks/use-profile.ts (useProfile, useCreateProfile, useUpdateProfile)",
      "Handle auto-create profile if not exists on first fetch"
    ],
    "passes": true
  },
  {
    "id": 18,
    "category": "expo",
    "description": "Create Profile Tab Screen",
    "steps": [
      "READ .claude/screenshots/Mobile - Mon profile.png for UI",
      "Create apps/expo/app/(protected)/(tabs)/profile.tsx",
      "Display profile info: avatar, displayName, bio",
      "Add edit button to navigate to edit screen",
      "Show sign out button"
    ],
    "passes": false
  },
  {
    "id": 19,
    "category": "expo",
    "description": "Create Edit Profile Screen",
    "steps": [
      "READ .claude/screenshots/Mobile - Mon profile.png for UI",
      "Create apps/expo/app/(protected)/profile/edit.tsx",
      "Form with: avatar picker, displayName input, bio textarea",
      "Save button triggers updateProfile mutation",
      "Handle loading and error states"
    ],
    "passes": false
  },
  {
    "id": 20,
    "category": "expo",
    "description": "Add Profile Tab to Layout",
    "steps": [
      "READ .claude/screenshots/Mobile - Mon profile.png for UI",
      "Modify apps/expo/app/(protected)/(tabs)/_layout.tsx",
      "Add Profile tab with User icon",
      "Move sign out from home to profile screen"
    ],
    "passes": false
  },
  {
    "id": 21,
    "category": "testing",
    "description": "Write Unit Tests for Profile Use Cases",
    "steps": [
      "Create src/application/use-cases/profile/__tests__/create-profile.use-case.test.ts",
      "Create src/application/use-cases/profile/__tests__/get-profile.use-case.test.ts",
      "Create src/application/use-cases/profile/__tests__/update-profile.use-case.test.ts",
      "Test happy paths and error cases"
    ],
    "passes": false
  },
  {
    "id": 22,
    "category": "validation",
    "description": "Profile Feature Validation",
    "steps": [
      "Run pnpm type-check",
      "Run pnpm check",
      "Run pnpm test",
      "Verify Profile CRUD works end-to-end"
    ],
    "passes": false
  },
  {
    "id": 23,
    "category": "domain",
    "description": "Create FriendRequest Aggregate",
    "steps": [
      "Create src/domain/friend/friend-request-id.ts (UUID-based ID)",
      "Create src/domain/friend/friend-request.aggregate.ts with props: senderId, receiverId, status, createdAt, respondedAt",
      "Implement static create() and reconstitute() methods",
      "Add accept() and reject() methods that update status and respondedAt",
      "Use z.string().min(1) for user IDs (BetterAuth compatibility)"
    ],
    "passes": false
  },
  {
    "id": 24,
    "category": "domain",
    "description": "Create FriendRequest Value Objects",
    "steps": [
      "Create src/domain/friend/value-objects/friend-request-status.vo.ts with enum: pending, accepted, rejected"
    ],
    "passes": false
  },
  {
    "id": 25,
    "category": "domain",
    "description": "Create FriendRequest Domain Events",
    "steps": [
      "Create src/domain/friend/events/friend-request-sent.event.ts",
      "Create src/domain/friend/events/friend-request-accepted.event.ts",
      "Create src/domain/friend/events/friend-request-rejected.event.ts"
    ],
    "passes": false
  },
  {
    "id": 26,
    "category": "domain",
    "description": "Create Notification Aggregate",
    "steps": [
      "Create src/domain/notification/notification-id.ts",
      "Create src/domain/notification/notification.aggregate.ts with props: userId, type, title, body, data, readAt, createdAt",
      "Create src/domain/notification/value-objects/notification-type.vo.ts with enum: friend_request, friend_accepted, new_message",
      "Implement static create() and reconstitute() methods",
      "Add markAsRead() method"
    ],
    "passes": false
  },
  {
    "id": 27,
    "category": "domain",
    "description": "Create Notification Domain Events",
    "steps": [
      "Create src/domain/notification/events/notification-created.event.ts",
      "Create src/domain/notification/events/notification-read.event.ts"
    ],
    "passes": false
  },
  {
    "id": 28,
    "category": "application",
    "description": "Create Friend Repository Port",
    "steps": [
      "Create src/application/ports/friend-request-repository.port.ts",
      "Define methods: create, update, findById, findByUsers, findPendingForUser, findFriendsForUser, exists"
    ],
    "passes": false
  },
  {
    "id": 29,
    "category": "application",
    "description": "Create Invite Token Repository Port",
    "steps": [
      "Create src/application/ports/invite-token-repository.port.ts",
      "Define methods: create, findByToken, markAsUsed, deleteExpired"
    ],
    "passes": false
  },
  {
    "id": 30,
    "category": "application",
    "description": "Create Notification Repository Port",
    "steps": [
      "Create src/application/ports/notification-repository.port.ts",
      "Define methods: create, update, findById, findByUserId, findUnreadByUserId, markAsRead, countUnread"
    ],
    "passes": false
  },
  {
    "id": 31,
    "category": "application",
    "description": "Create Friend DTOs",
    "steps": [
      "Create src/application/dto/friend/send-friend-request.dto.ts (input: receiverEmail, output: requestId, status)",
      "Create src/application/dto/friend/respond-friend-request.dto.ts (input: requestId, accept, output: success)",
      "Create src/application/dto/friend/get-friends.dto.ts (output: friends array with id, email, name)",
      "Create src/application/dto/friend/get-pending-requests.dto.ts (output: requests array)",
      "Create src/application/dto/friend/get-invite-link.dto.ts (output: inviteUrl, token)",
      "Create src/application/dto/friend/accept-invite.dto.ts (input: token, output: success, friendName)"
    ],
    "passes": false
  },
  {
    "id": 32,
    "category": "application",
    "description": "Create Notification DTOs",
    "steps": [
      "Create src/application/dto/notification/get-notifications.dto.ts",
      "Create src/application/dto/notification/mark-notification-read.dto.ts",
      "Create src/application/dto/notification/notification.dto.ts (shared notification shape)"
    ],
    "passes": false
  },
  {
    "id": 33,
    "category": "application",
    "description": "Create SendFriendRequest Use Case",
    "steps": [
      "Create src/application/use-cases/friend/send-friend-request.use-case.ts",
      "Inject IEmailProvider (ResendService) in constructor",
      "Validate receiver email exists in user repository",
      "If user exists: create FriendRequest + Notification",
      "If user not exists: send invitation email via IEmailProvider.send() with signup link",
      "Return Result with 'request_sent' or 'invitation_sent' status",
      "Dispatch domain events"
    ],
    "passes": false
  },
  {
    "id": 34,
    "category": "application",
    "description": "Create RespondFriendRequest Use Case",
    "steps": [
      "Create src/application/use-cases/friend/respond-friend-request.use-case.ts",
      "Find request by ID, verify receiver is current user",
      "Call accept() or reject() on aggregate",
      "If accepted: create notification for sender",
      "Dispatch domain events"
    ],
    "passes": false
  },
  {
    "id": 35,
    "category": "application",
    "description": "Create GetFriends Use Case",
    "steps": [
      "Create src/application/use-cases/friend/get-friends.use-case.ts",
      "Query accepted friend requests where user is sender or receiver",
      "Map to friend DTOs with user details"
    ],
    "passes": false
  },
  {
    "id": 36,
    "category": "application",
    "description": "Create GetPendingRequests Use Case",
    "steps": [
      "Create src/application/use-cases/friend/get-pending-requests.use-case.ts",
      "Query pending requests where user is receiver",
      "Map to DTOs with sender details"
    ],
    "passes": false
  },
  {
    "id": 37,
    "category": "application",
    "description": "Create GetInviteLink Use Case",
    "steps": [
      "Create src/application/use-cases/friend/get-invite-link.use-case.ts",
      "Generate unique invite token (nanoid or UUID)",
      "Store token in inviteTokens table with expiry (24h)",
      "Return invite URL: evahomecafeapp://invite/{token}"
    ],
    "passes": false
  },
  {
    "id": 38,
    "category": "application",
    "description": "Create AcceptInviteLink Use Case",
    "steps": [
      "Create src/application/use-cases/friend/accept-invite-link.use-case.ts",
      "Validate invite token exists and not expired",
      "Get inviter user from token",
      "Check if already friends",
      "Create FriendRequest with status=accepted",
      "Create notifications for both users",
      "Mark token as used"
    ],
    "passes": false
  },
  {
    "id": 39,
    "category": "application",
    "description": "Create GetNotifications Use Case",
    "steps": [
      "Create src/application/use-cases/notification/get-notifications.use-case.ts",
      "Support pagination",
      "Return notifications sorted by createdAt desc"
    ],
    "passes": false
  },
  {
    "id": 40,
    "category": "application",
    "description": "Create MarkNotificationRead Use Case",
    "steps": [
      "Create src/application/use-cases/notification/mark-notification-read.use-case.ts",
      "Find notification, verify ownership",
      "Call markAsRead() and persist"
    ],
    "passes": false
  },
  {
    "id": 41,
    "category": "infrastructure",
    "description": "Create Drizzle Schema for Friends",
    "steps": [
      "Create packages/drizzle/src/schema/friend.ts",
      "Define friendRequests table: id, senderId, receiverId, status, createdAt, respondedAt",
      "Define inviteTokens table: id, userId, token, expiresAt, usedAt, createdAt",
      "Add foreign keys to user table",
      "Add unique constraint on (senderId, receiverId) for friendRequests",
      "Add unique index on token for inviteTokens",
      "Export from packages/drizzle/src/schema/index.ts"
    ],
    "passes": false
  },
  {
    "id": 42,
    "category": "infrastructure",
    "description": "Create Drizzle Schema for Notifications",
    "steps": [
      "Create packages/drizzle/src/schema/notification.ts",
      "Define notifications table: id, userId, type, title, body, data (jsonb), readAt, createdAt",
      "Add foreign key to user table",
      "Add index on (userId, createdAt)",
      "Export from packages/drizzle/src/schema/index.ts"
    ],
    "passes": false
  },
  {
    "id": 43,
    "category": "infrastructure",
    "description": "Run Database Migration for Friends & Notifications",
    "steps": [
      "Run pnpm db:push to apply schema changes",
      "Verify tables created correctly"
    ],
    "passes": false
  },
  {
    "id": 44,
    "category": "adapter",
    "description": "Create FriendRequest Mapper",
    "steps": [
      "Create src/adapters/mappers/friend-request.mapper.ts",
      "Implement toDomain() and toPersistence() methods"
    ],
    "passes": false
  },
  {
    "id": 45,
    "category": "adapter",
    "description": "Create Notification Mapper",
    "steps": [
      "Create src/adapters/mappers/notification.mapper.ts",
      "Implement toDomain() and toPersistence() methods",
      "Handle JSON data field properly"
    ],
    "passes": false
  },
  {
    "id": 46,
    "category": "adapter",
    "description": "Create FriendRequest Repository",
    "steps": [
      "Create src/adapters/repositories/friend-request.repository.ts",
      "Implement all port methods using Drizzle",
      "Include user joins for friend details"
    ],
    "passes": false
  },
  {
    "id": 47,
    "category": "adapter",
    "description": "Create InviteToken Repository",
    "steps": [
      "Create src/adapters/repositories/invite-token.repository.ts",
      "Implement create, findByToken, markAsUsed methods"
    ],
    "passes": false
  },
  {
    "id": 48,
    "category": "adapter",
    "description": "Create Notification Repository",
    "steps": [
      "Create src/adapters/repositories/notification.repository.ts",
      "Implement all port methods using Drizzle"
    ],
    "passes": false
  },
  {
    "id": 49,
    "category": "adapter",
    "description": "Create Friend Controller",
    "steps": [
      "Create src/adapters/controllers/friend/friend.controller.ts",
      "Implement sendRequest, respondRequest, getFriends, getPendingRequests, getInviteLink, acceptInvite handlers"
    ],
    "passes": false
  },
  {
    "id": 50,
    "category": "adapter",
    "description": "Create Notification Controller",
    "steps": [
      "Create src/adapters/controllers/notification/notification.controller.ts",
      "Implement getNotifications, markAsRead, getUnreadCount handlers"
    ],
    "passes": false
  },
  {
    "id": 51,
    "category": "adapter",
    "description": "Extend SSE Controller for Notifications",
    "steps": [
      "Modify src/adapters/controllers/chat/sse.controller.ts",
      "Add 'notification' event type",
      "Broadcast to user when notification created"
    ],
    "passes": false
  },
  {
    "id": 52,
    "category": "infrastructure",
    "description": "Register Friend DI Module",
    "steps": [
      "Create common/di/modules/friend.module.ts",
      "Bind IFriendRequestRepository, IInviteTokenRepository and all friend use cases",
      "Bind IEmailProvider for SendFriendRequest",
      "Register in common/di/container.ts"
    ],
    "passes": false
  },
  {
    "id": 53,
    "category": "infrastructure",
    "description": "Register Notification DI Module",
    "steps": [
      "Create common/di/modules/notification.module.ts",
      "Bind INotificationRepository and all notification use cases",
      "Register in common/di/container.ts"
    ],
    "passes": false
  },
  {
    "id": 54,
    "category": "api",
    "description": "Create Friend API Routes",
    "steps": [
      "Create app/api/friends/route.ts (GET friends, POST send request)",
      "Create app/api/friends/requests/route.ts (GET pending)",
      "Create app/api/friends/requests/[id]/respond/route.ts (POST accept/reject)",
      "Create app/api/friends/invite/route.ts (GET generate invite link)",
      "Create app/api/friends/invite/accept/route.ts (POST accept invite token)"
    ],
    "passes": false
  },
  {
    "id": 55,
    "category": "api",
    "description": "Create Notification API Routes",
    "steps": [
      "Create app/api/notifications/route.ts (GET list)",
      "Create app/api/notifications/[id]/read/route.ts (POST mark read)",
      "Create app/api/notifications/unread-count/route.ts (GET count)"
    ],
    "passes": false
  },
  {
    "id": 56,
    "category": "expo",
    "description": "Create Expo Friend Types",
    "steps": [
      "Create apps/expo/types/friend.ts with Friend, FriendRequest, InviteLink interfaces",
      "Create apps/expo/types/notification.ts with Notification interface",
      "Export from apps/expo/types/index.ts"
    ],
    "passes": false
  },
  {
    "id": 57,
    "category": "expo",
    "description": "Create Expo Friend Hooks",
    "steps": [
      "Create apps/expo/hooks/use-friends.ts (useFriends, useSendFriendRequest)",
      "Create apps/expo/hooks/use-friend-requests.ts (usePendingRequests, useRespondRequest)",
      "Create apps/expo/hooks/use-invite.ts (useGenerateInvite, useAcceptInvite)"
    ],
    "passes": false
  },
  {
    "id": 58,
    "category": "expo",
    "description": "Create Expo Notification Hooks",
    "steps": [
      "Create apps/expo/hooks/use-notifications.ts (useNotifications, useMarkRead, useUnreadCount)"
    ],
    "passes": false
  },
  {
    "id": 59,
    "category": "expo",
    "description": "Extend Expo SSE Hook",
    "steps": [
      "Modify apps/expo/hooks/use-sse.ts to handle 'notification' events",
      "Invalidate notifications query on new notification",
      "Update unread count"
    ],
    "passes": false
  },
  {
    "id": 60,
    "category": "expo",
    "description": "Create Notifications Tab Screen",
    "steps": [
      "Create apps/expo/app/(protected)/(tabs)/notifications.tsx",
      "List notifications with FlatList",
      "Show unread indicator (dot/badge)",
      "Handle notification tap (mark as read, navigate if needed)",
      "Show friend request actions inline (accept/reject buttons)"
    ],
    "passes": false
  },
  {
    "id": 61,
    "category": "expo",
    "description": "Add Notifications Tab to Layout",
    "steps": [
      "Modify apps/expo/app/(protected)/(tabs)/_layout.tsx",
      "Add Notifications tab with bell icon",
      "Show badge with unread count"
    ],
    "passes": false
  },
  {
    "id": 62,
    "category": "expo",
    "description": "Create Friends List Screen",
    "steps": [
      "Create apps/expo/app/(protected)/friends/index.tsx",
      "List friends with FlatList",
      "Show friend avatar, name, email",
      "Add button to navigate to add friend"
    ],
    "passes": false
  },
  {
    "id": 63,
    "category": "expo",
    "description": "Create Add Friend Screen",
    "steps": [
      "Create apps/expo/app/(protected)/friends/add.tsx",
      "Email input field",
      "Send request button",
      "Show success/error feedback",
      "Handle 'invitation_sent' vs 'request_sent' status"
    ],
    "passes": false
  },
  {
    "id": 64,
    "category": "expo",
    "description": "Create QR Code Display Screen",
    "steps": [
      "Create apps/expo/app/(protected)/friends/qr-code.tsx",
      "Install expo-barcode or react-native-qrcode-svg",
      "Call getInviteLink API on mount",
      "Display QR code encoding the invite URL",
      "Add share button to share invite link"
    ],
    "passes": false
  },
  {
    "id": 65,
    "category": "expo",
    "description": "Create QR Code Scanner Screen",
    "steps": [
      "Create apps/expo/app/(protected)/friends/scan.tsx",
      "Use expo-camera or expo-barcode-scanner",
      "Request camera permissions",
      "On scan: extract token from URL, call acceptInvite API",
      "Show success/error feedback"
    ],
    "passes": false
  },
  {
    "id": 66,
    "category": "expo",
    "description": "Add Friends Entry Point from Profile",
    "steps": [
      "Add 'Friends' button on profile screen",
      "Navigate to friends list",
      "Add QR code and scan buttons on friends list screen"
    ],
    "passes": false
  },
  {
    "id": 67,
    "category": "expo",
    "description": "Handle Deep Link for Invite",
    "steps": [
      "Update apps/expo/app.config.ts if needed for deep link scheme",
      "Handle invite deep link in app navigation",
      "Auto-call acceptInvite when app opens with invite link"
    ],
    "passes": false
  },
  {
    "id": 68,
    "category": "testing",
    "description": "Write Unit Tests for Friend Use Cases",
    "steps": [
      "Create src/application/use-cases/friend/__tests__/send-friend-request.use-case.test.ts",
      "Create src/application/use-cases/friend/__tests__/respond-friend-request.use-case.test.ts",
      "Create src/application/use-cases/friend/__tests__/get-invite-link.use-case.test.ts",
      "Create src/application/use-cases/friend/__tests__/accept-invite-link.use-case.test.ts",
      "Test happy paths and error cases"
    ],
    "passes": false
  },
  {
    "id": 69,
    "category": "testing",
    "description": "Write Unit Tests for Notification Use Cases",
    "steps": [
      "Create src/application/use-cases/notification/__tests__/get-notifications.use-case.test.ts",
      "Create src/application/use-cases/notification/__tests__/mark-notification-read.use-case.test.ts"
    ],
    "passes": false
  },
  {
    "id": 70,
    "category": "validation",
    "description": "Final Validation",
    "steps": [
      "Run pnpm type-check",
      "Run pnpm check",
      "Run pnpm test",
      "Verify no console.log or any types",
      "Manual testing of full flow"
    ],
    "passes": false
  }
]
```

---

## Agent Instructions

1. Read `activity.md` first to understand current state
2. Read `CLAUDE.md` for architecture patterns and conventions
3. Find next task with `"passes": false` (in order by id)
4. Complete all steps for that task
5. Run `pnpm type-check` after code changes
6. Update task to `"passes": true`
7. Log completion in `activity.md`
8. Make one git commit for that task only
9. Repeat until all tasks pass

**Important:**
- Only modify the `passes` field. Do not remove or rewrite tasks.
- Do NOT modify `user`, `account`, `session`, `verification` tables.

---

## Completion Criteria

All 70 tasks marked with `"passes": true` and:
- `pnpm type-check` passes
- `pnpm check` passes
- `pnpm test` passes
