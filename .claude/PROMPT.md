@.claude/plan.md @.claude/activity.md @CLAUDE.md

# HomeCafe Feature Implementation

You are implementing features for the HomeCafe mobile app (React Native Expo + Next.js monorepo with Clean Architecture and DDD).

---

## CRITICAL CONSTRAINTS

**Do NOT touch these BetterAuth tables:** `user`, `account`, `session`, `verification`

**Create separate tables instead:** `profile`, `friendRequests`, `inviteTokens`, `notifications`

---

## How to Work

1. Read `activity.md` to see current progress
2. Open `plan.md` and find the next task where `"passes": false` (lowest id first)
3. Work on exactly ONE task: implement ALL steps listed
4. After implementing, run `pnpm type-check` to verify TypeScript compiles
5. If the task involves database schema, also run `pnpm db:push`
6. Update that task's `passes` from `false` to `true` in plan.md
7. Append a dated entry to `activity.md` describing:
   - Task id and description
   - Files created or modified
   - Any issues and resolutions
8. Make ONE git commit with format: `feat(profile|friends|notifications): [task description]`

---

## Do NOT

- git init
- Change remotes
- Push to remote
- Work on multiple tasks at once

---

## PHASE 1: Profile Feature (Tasks 1-22)

**Purpose:** Users need a personal profile separate from BetterAuth user.

**Profile Entity:**
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | string | FK to user.id, UNIQUE |
| displayName | string | 1-50 chars, required |
| bio | string | 0-500 chars, nullable |
| avatarUrl | string | Valid URL, nullable |
| createdAt | timestamp | Auto-set |
| updatedAt | timestamp | Auto-set |

**Use Cases:**
- `CreateProfile` - Create profile for user (one per user)
- `GetProfile` - Get profile by userId → `Option<ProfileDto>`
- `UpdateProfile` - Partial update (displayName, bio, avatarUrl)

**Expo UI:**
- Profile tab screen: avatar, displayName, bio, edit button, friends button, sign out
- Edit profile screen: avatar picker, displayName input, bio textarea, save/cancel

---

## PHASE 2: Friends & Notifications (Tasks 23-70)

### FriendRequest Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| senderId | string | FK to user.id |
| receiverId | string | FK to user.id |
| status | enum | 'pending' \| 'accepted' \| 'rejected' |
| createdAt | timestamp | Auto-set |
| respondedAt | timestamp | Set on accept/reject |

**Constraints:** Unique(senderId, receiverId), senderId ≠ receiverId

**Methods:** `accept()`, `reject()`

### InviteToken Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | string | FK to user.id (creator) |
| token | string | Unique, nanoid |
| expiresAt | timestamp | 24h from creation |
| usedAt | timestamp | Nullable |
| createdAt | timestamp | Auto-set |

**URL Format:** `evahomecafeapp://invite/{token}`

### Notification Entity
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | string | FK to user.id (recipient) |
| type | enum | 'friend_request' \| 'friend_accepted' \| 'new_message' |
| title | string | Display title |
| body | string | Display body |
| data | jsonb | Type-specific payload |
| readAt | timestamp | Nullable |
| createdAt | timestamp | Auto-set |

### Friend Flow
1. **Email flow:** User exists → FriendRequest(pending) + Notification | User not exists → Send email via Resend
2. **QR flow:** Scan → acceptInvite API → FriendRequest(accepted) + Notifications for both

### Use Cases
- `SendFriendRequest` - By email, creates request or sends invitation email
- `RespondFriendRequest` - Accept/reject, creates notification on accept
- `GetFriends` - List accepted friends
- `GetPendingRequests` - List pending requests for user
- `GetInviteLink` - Generate invite token + URL
- `AcceptInviteLink` - Validate token, create instant friendship
- `GetNotifications` - Paginated list
- `MarkNotificationRead` - Mark as read

### Expo UI
- Notifications tab: FlatList, unread indicator, inline accept/reject for friend_request
- Friends list screen: FlatList, add friend button, QR buttons
- Add friend screen: email input, send button
- QR code display: QR code + share button
- QR scanner: camera, parse URL, call acceptInvite

### Existing Infrastructure
- Email: `IEmailProvider` → `ResendService`
- SSE: Extend `sse.controller.ts` for 'notification' event
- Auth: `requireAuth` guard

---

## Architecture Quick Reference

**Layers:** Domain → Application → Adapters → Infrastructure

**Key Patterns:**
- `Result<T>` for fallible operations
- `Option<T>` for nullable values
- Only `get id()` getter, use `entity.get('propName')` for other properties
- Domain events: add in aggregate, dispatch AFTER save

**File Locations (apps/nextjs/):**
- Domain: `src/domain/{feature}/`
- Application: `src/application/use-cases/{feature}/`, `src/application/dto/{feature}/`
- Adapters: `src/adapters/repositories/`, `src/adapters/controllers/`, `src/adapters/mappers/`
- Infrastructure: `common/di/modules/`, `app/api/v1/`

**File Locations (apps/expo/):**
- Types: `types/`
- Hooks: `hooks/`
- Screens: `app/(protected)/(tabs)/`, `app/(protected)/{feature}/`

---

## Completion

When ALL 70 tasks have `passes: true`, output: `<promise>COMPLETE</promise>`
