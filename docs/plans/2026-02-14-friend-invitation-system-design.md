# Friend Invitation System - Design Document

**Date:** 2026-02-14
**Scope:** Next.js only (no Expo changes)

## Context

The backend is already complete with 6 use cases, Resend email integration, invite tokens (24h expiry), and notification infrastructure. What's missing is the frontend UI to surface these features.

## What We're Building

### 1. QR Code on Profile Page

**Replace** the "QR code bientôt disponible" placeholder with a real QR code.

- **Library:** `qrcode` (server-side SVG generation)
- **Flow:** Page load → call `GetInviteLinkUseCase` → generate QR from deep link `evahomecafeapp://invite/{token}`
- **UI:** QR code image + "Copier le lien" button + "Inviter par email" button
- **Location:** `profile/_components/profile-content.tsx` — replace existing placeholder

### 2. Send Invite Email Use Case (NEW)

**Purpose:** Send a personalized invitation email with the user's invite link.

- **Use case:** `SendInviteEmailUseCase` — takes `{ userId, recipientEmail, senderName }`
- **Template:** Branded HTML email with sender name, invite link, and app CTA
- **Port:** Uses existing `IEmailProvider` (Resend)
- **Controller:** New `sendInviteEmail` handler in friend controller
- **Route:** POST `/api/v1/friends/invite/email`

### 3. Notifications Page

**New page:** `/notifications`

- **Layout:** Full-width list of notifications, paginated
- **Notification types with distinct UI:**
  - `FRIEND_REQUEST` — shows sender name + avatar + "Accepter" / "Refuser" buttons
  - `FRIEND_ACCEPTED` — shows friend name + avatar + confirmation message
  - `NEW_MESSAGE` — shows message preview, links to conversation
  - `REWARD_EARNED` — shows badge/sticker earned
- **Mark as read:** Click on notification marks it as read
- **Unread badge:** Bell icon in nav with unread count (uses `useUnreadCountQuery`)
- **Files:**
  - `app/(protected)/notifications/page.tsx` — server component
  - `app/(protected)/notifications/_components/notifications-list.tsx` — client component
  - `app/(protected)/notifications/_components/notification-item.tsx` — per-type rendering

### 4. Friends Card (Dashboard + Social)

**Reusable component:** `FriendsCard`

- **Shows:** Number of friends, 3-4 avatar thumbnails, "Voir tout" link
- **Buttons:** "Inviter un ami" (opens invite modal)
- **Click "Voir tout":** Opens `FriendsModal`
- **Placement:** Dashboard left column + Social page sidebar

### 5. Friends Modal

**Dialog component:** `FriendsModal`

- **3 tabs:**
  - **Mes amis** — paginated list with avatar, name, and "Supprimer" button (future)
  - **Demandes** — pending requests with "Accepter" / "Refuser" buttons
  - **Inviter** — form with email input + send button, plus link to QR code on profile
- **Data:** Uses React Query hooks to fetch friends/pending requests
- **Actions:** Accept/reject requests, send email invitation

### 6. React Query Hooks

**New hooks file:** `app/(protected)/_hooks/use-friends.ts`

```typescript
useFriendsQuery(page)              // GET /api/v1/friends
usePendingRequestsQuery(page)      // GET /api/v1/friends/requests
useRespondRequestMutation()        // POST /api/v1/friends/requests/{id}/respond
useSendFriendRequestMutation()     // POST /api/v1/friends
useInviteLinkQuery()               // GET /api/v1/friends/invite
useSendInviteEmailMutation()       // POST /api/v1/friends/invite/email
useAcceptInviteMutation()          // POST /api/v1/friends/invite/accept
```

### 7. Nav Bell Icon

- Add notification bell to the main navigation/header
- Shows unread count badge
- Links to `/notifications`

## Files to Create

```
apps/nextjs/
├── app/(protected)/notifications/
│   ├── page.tsx
│   └── _components/
│       ├── notifications-list.tsx
│       └── notification-item.tsx
├── app/(protected)/_hooks/
│   └── use-friends.ts
├── app/(protected)/_components/
│   ├── friends-card.tsx
│   └── friends-modal.tsx
└── src/
    ├── application/
    │   ├── use-cases/friend/send-invite-email.use-case.ts
    │   └── dto/friend/send-invite-email.dto.ts
    └── adapters/
        └── queries/friends-list.query.ts (for card avatar preview)
```

## Files to Modify

```
apps/nextjs/
├── app/(protected)/profile/_components/profile-content.tsx  (QR code)
├── app/(protected)/dashboard/page.tsx                       (add FriendsCard)
├── app/(protected)/social/page.tsx                          (add FriendsCard)
├── src/adapters/controllers/friend/friend.controller.ts     (add sendInviteEmail)
├── app/api/v1/friends/invite/email/route.ts                 (new route)
├── common/di/modules/friend.module.ts                       (bind new use case)
├── common/di/types.ts                                       (add DI symbol)
└── app/(protected)/layout.tsx or nav component              (bell icon)
```

## What We're NOT Doing

- No new DB tables
- No Expo changes
- No refactoring of existing use cases
- No friend removal feature (future)
- No real-time notifications (polling every 30s is fine)
