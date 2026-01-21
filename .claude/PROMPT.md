@.claude/plan.md @.claude/activity.md @CLAUDE.md

# HomeCafe Feature Implementation - Profile, Friends & Notifications

You are implementing features for the HomeCafe mobile app. This is a React Native (Expo) + Next.js monorepo following Clean Architecture and DDD patterns.

---

## CRITICAL CONSTRAINTS - READ FIRST

### Database Tables You MUST NOT Touch
The following tables are managed by **BetterAuth** and must NEVER be modified:
- `user` - Auth user (id, name, email, emailVerified, image, createdAt, updatedAt)
- `account` - OAuth accounts
- `session` - User sessions
- `verification` - Email verification tokens

**Reason:** BetterAuth manages these tables. Any modification will break authentication.

### What You MUST Do Instead
Create **new, separate tables** for feature data:
- `profiles` - User profile data (linked to user.id via userId FK)
- `friendRequests` - Friend request records
- `inviteTokens` - QR code/link invite tokens
- `notifications` - In-app notifications

---

## How to Work

1. Read `activity.md` to see current progress and what was recently done
2. Read `CLAUDE.md` to understand architecture patterns and code conventions
3. Open `plan.md` and find the next task where `"passes": false` (lowest id first)
4. Implement ALL steps listed for that ONE task
5. After implementing:
   - Run `pnpm type-check` to verify TypeScript compiles
   - If the task involves database schema, run `pnpm db:push`
   - For use case tasks, ensure proper Result/Option usage per CLAUDE.md
6. Update that task's `passes` from `false` to `true` in plan.md
7. Append a dated entry to `activity.md` with:
   - Task id and description completed
   - Files created or modified
   - Any issues encountered and how you resolved them
8. Make ONE git commit with message format:
   - `feat(profile): [task description]` for Profile tasks (1-22)
   - `feat(friends): [task description]` for Friends tasks (23-70)
   - `feat(notifications): [task description]` for Notification tasks

**Do NOT:**
- git init
- Change remotes
- Push to remote
- Work on multiple tasks at once

**When ALL 70 tasks have `passes: true`, output:** `<promise>COMPLETE</promise>`

---

## PHASE 1: Profile Feature (Tasks 1-22)

### Business Purpose
Users need a personal profile with display name, bio, and avatar. This profile is **separate from the auth user** because:
- Auth user contains minimal auth data only
- Profile can have app-specific fields without polluting auth
- Profile can be extended later (badges, preferences) without touching auth

### Profile Entity Requirements

**Fields:**
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | string | FK to user.id, UNIQUE (1 profile per user) |
| displayName | string | 1-50 chars, required |
| bio | string | 0-500 chars, optional (nullable) |
| avatarUrl | string | Valid URL, optional (nullable) |
| createdAt | timestamp | Auto-set on create |
| updatedAt | timestamp | Auto-set on create and update |

**NOT included (by design):**
- Address - not needed for MVP
- Badges - will be separate feature later
- Settings/preferences - will be separate feature later

### Profile Use Cases

1. **CreateProfile** - Called when user first views their profile (auto-create if missing)
   - Input: userId, displayName, bio?, avatarUrl?
   - Validation: userId must exist in auth user table
   - Constraint: One profile per user (check exists first)

2. **GetProfile** - Get profile by userId
   - Input: userId
   - Output: Option<ProfileDto> (None if not created yet)

3. **UpdateProfile** - Update profile fields
   - Input: userId, displayName?, bio?, avatarUrl?
   - Validation: User can only update their own profile
   - Partial update: Only update provided fields

### Profile UI (Expo)

**Profile Tab Screen (`(tabs)/profile.tsx`):**
- Avatar image (or placeholder if none)
- Display name (large text)
- Bio (if set)
- "Edit Profile" button → navigates to edit screen
- "Friends" button → navigates to friends list
- "Sign Out" button (moved from home screen)

**Edit Profile Screen (`/profile/edit.tsx`):**
- Avatar picker (camera/gallery)
- Display name text input
- Bio multiline input
- Save button (disabled while saving)
- Cancel button

**Tab Layout Changes:**
- Add "Profile" tab with User icon
- Keep existing: Home, Messages
- (Notifications tab added in Phase 2)

---

## PHASE 2: Friends & Notifications (Tasks 23-70)

### Business Purpose
Users can add friends to share content and communicate. Friends can be added via:
1. Email invitation (existing user gets in-app notification, non-user gets email)
2. QR code scanning (instant friend connection)

Notifications provide real-time updates for friend requests, messages, and other events.

### Friend Request Flow

```
User A wants to add User B
        │
        ▼
   Enter email OR scan QR
        │
        ├─── Email flow ───────────────────────────────────────┐
        │                                                       │
        ▼                                                       ▼
   User B exists?                                    Generate invite link
        │                                            Store inviteToken (24h expiry)
   ┌────┴────┐                                       Generate QR code with URL
   │         │                                              │
  YES       NO                                              ▼
   │         │                                       User B scans QR
   │         ▼                                              │
   │   Send email via Resend                                ▼
   │   (invitation to sign up)                       acceptInvite API
   │                                                        │
   ▼                                                        ▼
Create FriendRequest                                Create FriendRequest
status: pending                                     status: accepted (instant)
   │                                                        │
   ▼                                                        ▼
Create Notification                                 Create Notifications
for User B                                          for both users
"Friend request from A"                             "You are now friends"
   │
   ▼
User B accepts/rejects
   │
   ├─── Accept ───┐
   │              ▼
   │       status: accepted
   │       Create Notification for A
   │       "B accepted your request"
   │
   └─── Reject ───┐
                  ▼
           status: rejected
           (no notification)
```

### FriendRequest Entity

**Fields:**
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| senderId | string | FK to user.id |
| receiverId | string | FK to user.id |
| status | enum | 'pending' \| 'accepted' \| 'rejected' |
| createdAt | timestamp | Auto-set |
| respondedAt | timestamp | Set when accepted/rejected |

**Constraints:**
- Unique on (senderId, receiverId) - can't send duplicate requests
- senderId ≠ receiverId - can't friend yourself

**Methods:**
- `accept()` → sets status='accepted', respondedAt=now()
- `reject()` → sets status='rejected', respondedAt=now()

### InviteToken Entity

**Fields:**
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | string | FK to user.id (who created the invite) |
| token | string | Unique, random (nanoid) |
| expiresAt | timestamp | 24 hours from creation |
| usedAt | timestamp | Set when token is used (nullable) |
| createdAt | timestamp | Auto-set |

**URL Format:** `evahomecafeapp://invite/{token}`

### Notification Entity

**Fields:**
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | string | FK to user.id (recipient) |
| type | enum | 'friend_request' \| 'friend_accepted' \| 'new_message' |
| title | string | Display title |
| body | string | Display body |
| data | jsonb | Type-specific payload |
| readAt | timestamp | Set when marked as read (nullable) |
| createdAt | timestamp | Auto-set |

**Notification Types & Data:**

```typescript
// friend_request
{ type: 'friend_request', requestId: string, senderName: string, senderAvatar?: string }

// friend_accepted
{ type: 'friend_accepted', friendId: string, friendName: string }

// new_message (future)
{ type: 'new_message', conversationId: string, messagePreview: string }
```

### Real-Time Notifications via SSE

The app already has SSE infrastructure for chat. Extend it:

1. **Server:** When notification is created, broadcast to SSE for that user
2. **Client:** SSE hook receives 'notification' event, invalidates React Query cache
3. **Result:** Notification badge updates instantly without polling

### Notifications UI (Expo)

**Notifications Tab Screen (`(tabs)/notifications.tsx`):**
- FlatList of notifications, newest first
- Unread notifications have visual indicator (dot/highlight)
- Tap to mark as read
- For friend_request type: Show Accept/Reject buttons inline
- For friend_accepted: Tap navigates to friend's profile
- Pull to refresh

**Tab Badge:**
- Bell icon with red badge showing unread count
- Badge disappears when count is 0

### Friends UI (Expo)

**Friends List Screen (`/friends/index.tsx`):**
- FlatList of accepted friends
- Each row: Avatar, display name
- Tap friend → view their profile (future: chat)
- "Add Friend" button in header
- "Show QR Code" and "Scan QR" buttons

**Add Friend Screen (`/friends/add.tsx`):**
- Email input field
- "Send Invite" button
- Success states:
  - "Request sent!" (user exists)
  - "Invitation email sent!" (user doesn't exist)
- Error states: Invalid email, already friends, request pending

**QR Code Display Screen (`/friends/qr-code.tsx`):**
- Large QR code in center
- "Share Link" button (native share sheet)
- Invite URL displayed below QR

**QR Code Scanner Screen (`/friends/scan.tsx`):**
- Camera viewfinder
- Permission request if not granted
- On successful scan: Parse URL, extract token, call acceptInvite API
- Success: "You are now friends with [Name]!"
- Error: "Invalid or expired invite"

### Deep Link Handling

When user opens `evahomecafeapp://invite/{token}`:
1. App receives deep link
2. If not logged in: Store token, redirect to login, process after auth
3. If logged in: Call acceptInvite API immediately
4. Show result (success or error)

---

## Architecture Reference

### Layer Structure
```
Domain (no external deps)
  └── Aggregates, Value Objects, Domain Events

Application (depends on Domain)
  └── Use Cases, Ports (interfaces), DTOs

Adapters (depends on Application)
  └── Repositories, Mappers, Controllers

Infrastructure (depends on Adapters)
  └── DI Container, API Routes, Config
```

### File Locations (Next.js - apps/nextjs/)

**Domain:**
- `src/domain/profile/` - Profile aggregate
- `src/domain/friend/` - FriendRequest aggregate
- `src/domain/notification/` - Notification aggregate

**Application:**
- `src/application/ports/` - Repository interfaces
- `src/application/dto/` - Input/output DTOs
- `src/application/use-cases/` - Business logic

**Adapters:**
- `src/adapters/mappers/` - Domain ↔ DB mapping
- `src/adapters/repositories/` - Drizzle implementations
- `src/adapters/controllers/` - HTTP handlers

**Infrastructure:**
- `common/di/modules/` - DI module registration
- `common/di/container.ts` - DI container
- `app/api/` - Next.js API routes

**Database:**
- `packages/drizzle/src/schema/` - Table definitions

### File Locations (Expo - apps/expo/)

- `types/` - TypeScript interfaces
- `hooks/` - React Query hooks
- `app/(protected)/(tabs)/` - Tab screens
- `app/(protected)/profile/` - Profile stack screens
- `app/(protected)/friends/` - Friends stack screens

### Key Patterns

**Result<T>** for fallible operations:
```typescript
const result = await repo.create(entity);
if (result.isFailure) return Result.fail(result.getError());
```

**Option<T>** for nullable values:
```typescript
const maybeUser = await repo.findById(id);
return match(maybeUser, {
  Some: (user) => Result.ok(toDto(user)),
  None: () => Result.fail("Not found"),
});
```

**Domain Events** - Add in aggregate, dispatch AFTER save:
```typescript
// In aggregate
this.addEvent(new ProfileCreatedEvent(this));

// In use case, after repo.create()
await this.eventDispatcher.dispatchAll(entity.domainEvents);
entity.clearEvents();
```

---

## Existing Infrastructure to Use

### Email Service
- Port: `src/application/ports/email.provider.port.ts` (IEmailProvider)
- Implementation: `src/adapters/services/email/resend.service.ts`
- Use for: Sending invitation emails to non-users

### SSE for Real-Time
- Existing: `src/adapters/controllers/chat/sse.controller.ts`
- Extend: Add 'notification' event type
- Client: `apps/expo/hooks/use-sse.ts`

### Auth Guard
- `src/adapters/guards/requireAuth.ts`
- Use in all protected API routes

---

## Dependencies to Install (Expo)

For QR code functionality:
- `react-native-qrcode-svg` - Generate QR codes
- `expo-barcode-scanner` or `expo-camera` - Scan QR codes

Install when reaching QR tasks (64-65).

---

## Commit Message Examples

```
feat(profile): create Profile aggregate and value objects
feat(profile): add profile repository port and DTOs
feat(profile): implement profile use cases
feat(profile): create profile drizzle schema
feat(profile): add profile API routes
feat(profile): create profile tab screen

feat(friends): create FriendRequest aggregate
feat(friends): implement send friend request use case
feat(friends): add QR code display screen

feat(notifications): create notification aggregate
feat(notifications): extend SSE for real-time notifications
feat(notifications): add notifications tab with badge
```
