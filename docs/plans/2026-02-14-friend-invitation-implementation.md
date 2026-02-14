# Friend Invitation System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the complete friend invitation UI on Next.js: QR code on profile, email invitations via Resend, notifications page, friends card on dashboard/social, friends modal.

**Architecture:** Backend is complete (6 use cases, Resend, invite tokens). We add: 1 new use case (SendInviteEmail), React Query hooks, and all frontend components. No new DB tables.

**Tech Stack:** Next.js 16, React Query, shadcn/ui, qrcode (npm), Resend (existing), Tailwind 4

---

### Task 1: Install qrcode library

**Step 1: Install**

Run: `pnpm add qrcode @types/qrcode --filter=nextjs`

**Step 2: Verify**

Run: `pnpm type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add -A && git commit -m "chore: add qrcode library for friend invite QR generation"
```

---

### Task 2: SendInviteEmailUseCase (backend)

**Files:**
- Create: `apps/nextjs/src/application/dto/friend/send-invite-email.dto.ts`
- Create: `apps/nextjs/src/application/use-cases/friend/send-invite-email.use-case.ts`
- Create: `apps/nextjs/src/application/use-cases/friend/__tests__/send-invite-email.use-case.test.ts`
- Modify: `apps/nextjs/common/di/types.ts` (add DI symbol)
- Modify: `apps/nextjs/common/di/modules/friend.module.ts` (bind use case)
- Modify: `apps/nextjs/src/adapters/controllers/friend/friend.controller.ts` (add handler)
- Create: `apps/nextjs/app/api/v1/friends/invite/email/route.ts`

**Step 1: Create DTO**

File: `apps/nextjs/src/application/dto/friend/send-invite-email.dto.ts`

```typescript
import { z } from "zod";

export const sendInviteEmailInputDtoSchema = z.object({
  recipientEmail: z.string().email(),
});

export const sendInviteEmailOutputDtoSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type ISendInviteEmailInputDto = z.infer<typeof sendInviteEmailInputDtoSchema>;
export type ISendInviteEmailOutputDto = z.infer<typeof sendInviteEmailOutputDtoSchema>;
```

**Step 2: Write failing test**

File: `apps/nextjs/src/application/use-cases/friend/__tests__/send-invite-email.use-case.test.ts`

Test: SendInviteEmailUseCase should generate invite link and send email. Mock `IInviteTokenRepository`, `IEmailProvider`. Verify:
- Creates token via repo
- Sends email with invite URL in HTML
- Returns success

Also test: should fail when email send fails, should fail when token creation fails.

Pattern: Follow existing `send-friend-request.use-case.test.ts` mock patterns.

**Step 3: Run test to verify it fails**

Run: `cd apps/nextjs && pnpm vitest run src/application/use-cases/friend/__tests__/send-invite-email.use-case.test.ts`
Expected: FAIL (use case doesn't exist yet)

**Step 4: Implement use case**

File: `apps/nextjs/src/application/use-cases/friend/send-invite-email.use-case.ts`

```typescript
import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type { ISendInviteEmailInputDto, ISendInviteEmailOutputDto } from "@/application/dto/friend/send-invite-email.dto";
import type { IEmailProvider } from "@/application/ports/email.provider.port";
import type { IInviteTokenRepository } from "@/application/ports/invite-token-repository.port";

const INVITE_EXPIRY_HOURS = 24;

export class SendInviteEmailUseCase
  implements UseCase<ISendInviteEmailInputDto & { userId: string; senderName: string }, ISendInviteEmailOutputDto>
{
  constructor(
    private readonly inviteTokenRepo: IInviteTokenRepository,
    private readonly emailProvider: IEmailProvider,
    private readonly inviteBaseUrl: string,
  ) {}

  async execute(
    input: ISendInviteEmailInputDto & { userId: string; senderName: string },
  ): Promise<Result<ISendInviteEmailOutputDto>> {
    const token = new UUID<string>().value.toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + INVITE_EXPIRY_HOURS);

    const createResult = await this.inviteTokenRepo.create(input.userId, token, expiresAt);
    if (createResult.isFailure) {
      return Result.fail(createResult.getError());
    }

    const inviteUrl = `${this.inviteBaseUrl}/${token}`;

    const emailResult = await this.emailProvider.send({
      to: input.recipientEmail,
      subject: `${input.senderName} t'invite sur HomeCafé`,
      html: `<!-- branded HTML template with inviteUrl -->`,
    });

    if (emailResult.isFailure) {
      return Result.fail(emailResult.getError());
    }

    return Result.ok({
      success: true,
      message: `Invitation envoyée à ${input.recipientEmail}`,
    });
  }
}
```

Note: The HTML template should be a proper branded email. Keep it simple but styled.

**Step 5: Run test to verify it passes**

Run: `cd apps/nextjs && pnpm vitest run src/application/use-cases/friend/__tests__/send-invite-email.use-case.test.ts`
Expected: PASS

**Step 6: Wire DI**

In `apps/nextjs/common/di/types.ts`:
- Add `SendInviteEmailUseCase: Symbol.for("SendInviteEmailUseCase")` to DI_SYMBOLS
- Add `SendInviteEmailUseCase: SendInviteEmailUseCase` to DI_RETURN_TYPES
- Add import for the type

In `apps/nextjs/common/di/modules/friend.module.ts`:
- Import `SendInviteEmailUseCase`
- Bind with `toHigherOrderFunction` (needs `inviteBaseUrl` like `GetInviteLinkUseCase`):

```typescript
friendModule
  .bind(DI_SYMBOLS.SendInviteEmailUseCase)
  .toHigherOrderFunction(
    (inviteTokenRepo: IInviteTokenRepository, emailProvider: IEmailProvider) =>
      new SendInviteEmailUseCase(inviteTokenRepo, emailProvider, MOBILE_APP_SCHEME),
    [DI_SYMBOLS.IInviteTokenRepository, DI_SYMBOLS.IEmailProvider],
  );
```

**Step 7: Add controller handler**

In `apps/nextjs/src/adapters/controllers/friend/friend.controller.ts`:
- Add `sendInviteEmail` function following `sendRequest` pattern
- Parses body with `sendInviteEmailInputDtoSchema`
- Calls `getInjection("SendInviteEmailUseCase")`
- Passes `userId` and `senderName` from session

**Step 8: Add API route**

File: `apps/nextjs/app/api/v1/friends/invite/email/route.ts`

```typescript
import { sendInviteEmail } from "@/adapters/controllers/friend/friend.controller";
export const POST = sendInviteEmail;
```

**Step 9: Run all tests + type-check**

Run: `pnpm test && pnpm type-check`
Expected: All pass

**Step 10: Commit**

```bash
git add -A && git commit -m "feat: add SendInviteEmailUseCase with Resend integration"
```

---

### Task 3: React Query hooks for friends

**Files:**
- Create: `apps/nextjs/app/(protected)/_hooks/use-friends.ts`

**Step 1: Create hooks file**

All hooks use `apiFetch` from `@/common/api`. Follow pattern from `use-notifications.ts`.

```typescript
// Query keys
export const friendKeys = {
  all: ["friends"] as const,
  list: (page: number) => ["friends", "list", page] as const,
  pending: (page: number) => ["friends", "pending", page] as const,
  inviteLink: ["friends", "invite-link"] as const,
};

// Hooks:
// useFriendsQuery(page) → GET /api/v1/friends?page={page}
// usePendingRequestsQuery(page) → GET /api/v1/friends/requests?page={page}
// useRespondRequestMutation() → POST /api/v1/friends/requests/{id}/respond
//   onSuccess: invalidate friendKeys.all + notificationKeys.all
// useSendFriendRequestMutation() → POST /api/v1/friends
//   onSuccess: invalidate friendKeys.all
// useInviteLinkQuery() → GET /api/v1/friends/invite (enabled: false, use refetch)
// useSendInviteEmailMutation() → POST /api/v1/friends/invite/email
// useAcceptInviteMutation() → POST /api/v1/friends/invite/accept
//   onSuccess: invalidate friendKeys.all
```

**Step 2: Type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add React Query hooks for friends management"
```

---

### Task 4: Notifications page

**Files:**
- Create: `apps/nextjs/app/(protected)/notifications/page.tsx`
- Create: `apps/nextjs/app/(protected)/notifications/_components/notifications-list.tsx`
- Create: `apps/nextjs/app/(protected)/notifications/_components/notification-item.tsx`

**Step 1: Create notification item component**

File: `apps/nextjs/app/(protected)/notifications/_components/notification-item.tsx`

Client component. Renders differently based on notification type:
- `friend_request`: Show sender avatar/name, "Accepter" (green) + "Refuser" (outline) buttons. On accept: call `useRespondRequestMutation({ requestId: data.requestId, accept: true })`. Extract `requestId` from `notification.data`.
- `friend_accepted`: Show friend avatar/name, confirmation text
- `new_message`: Show message preview text
- All: click marks as read via `useMarkNotificationReadMutation`
- Unread: left border accent (e.g. `border-l-4 border-homecafe-pink`)

Import types from `@/application/dto/notification/notification.dto` (`INotificationDto`).

**Step 2: Create notifications list**

File: `apps/nextjs/app/(protected)/notifications/_components/notifications-list.tsx`

Client component. Uses `useNotificationsQuery()`. Renders:
- Header: "Notifications" + unread count badge
- List of `NotificationItem` components
- Empty state: "Aucune notification" with bell icon
- Loading state: skeleton cards

**Step 3: Create page**

File: `apps/nextjs/app/(protected)/notifications/page.tsx`

Server component:
```typescript
import { requireAuth } from "@/adapters/guards/auth.guard";
import { NotificationsList } from "./_components/notifications-list";

export default async function NotificationsPage() {
  await requireAuth();
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <NotificationsList />
    </div>
  );
}
```

**Step 4: Type-check + verify**

Run: `pnpm type-check`
Expected: PASS

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add notifications page with friend request actions"
```

---

### Task 5: Notification bell in navbar

**Files:**
- Modify: `apps/nextjs/app/(protected)/_components/navbar.tsx`

**Step 1: Add bell icon**

Add `Bell` import from lucide-react. Add a client-side bell component next to the profile avatar in the desktop nav and in the mobile sheet.

The bell needs to use `useUnreadCountQuery()` hook. Since the Navbar is already a client component, add directly.

Desktop: Between nav items and profile avatar link:
```tsx
<Link href="/notifications" className="relative rounded-full p-2 transition-colors hover:bg-muted">
  <Bell size={20} />
  {unreadCount > 0 && (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-homecafe-pink px-1 text-[10px] font-bold text-white">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  )}
</Link>
```

Mobile sheet: Add "Notifications" item with badge in the nav items list.

**Step 2: Type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add notification bell with unread count to navbar"
```

---

### Task 6: Friends modal

**Files:**
- Create: `apps/nextjs/app/(protected)/_components/friends-modal.tsx`

**Step 1: Create FriendsModal component**

Client component using shadcn `Dialog` + `Tabs`.

Props: `open: boolean`, `onOpenChange: (open: boolean) => void`

3 tabs using `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent`:

**Tab "Amis":**
- Uses `useFriendsQuery(page)`
- List: avatar + displayName/name + email
- Pagination at bottom if needed
- Empty state: "Aucun ami pour le moment"

**Tab "Demandes" (with badge count):**
- Uses `usePendingRequestsQuery(page)`
- List: sender avatar + name + "Accepter" / "Refuser" buttons
- Uses `useRespondRequestMutation()`
- Empty state: "Aucune demande en attente"

**Tab "Inviter":**
- Form: email input + "Envoyer l'invitation" button
- Uses `useSendInviteEmailMutation()` for email invite
- Alternative: `useSendFriendRequestMutation()` if user exists
- Decision: use `useSendFriendRequestMutation` first (handles both existing/non-existing users). Add a second "Envoyer mon lien par email" button that uses `useSendInviteEmailMutation`.
- Link to profile page for QR code: "Voir mon QR code sur mon profil"

**Step 2: Type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add friends modal with tabs for friends, requests, invite"
```

---

### Task 7: Friends card (reusable widget)

**Files:**
- Create: `apps/nextjs/app/(protected)/_components/friends-card.tsx`
- Create: `apps/nextjs/src/adapters/queries/friends-preview.query.ts`

**Step 1: Create server query for friend preview**

File: `apps/nextjs/src/adapters/queries/friends-preview.query.ts`

Direct DB query (CQRS read side). Returns: `{ count: number, friends: { id, name, displayName, avatarUrl }[] }` with limit 4.

```typescript
// Query accepted friend requests for userId
// Join with user + profile tables
// Return first 4 friends + total count
```

**Step 2: Create FriendsCard component**

File: `apps/nextjs/app/(protected)/_components/friends-card.tsx`

Two parts:
- **Server wrapper** (`FriendsCardServer`): Fetches data via query, passes to client
- **Client component** (`FriendsCardClient`): Renders card + opens FriendsModal

UI:
- Card with header "Amis" + count
- Row of 4 avatar circles (with fallback initials)
- "Voir tout" button → opens FriendsModal
- "Inviter" button → opens FriendsModal on "Inviter" tab

**Step 3: Type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add friends card widget with preview avatars"
```

---

### Task 8: Add FriendsCard to dashboard and social

**Files:**
- Modify: `apps/nextjs/app/(protected)/dashboard/page.tsx`
- Modify: `apps/nextjs/app/(protected)/social/page.tsx`

**Step 1: Add to dashboard**

In the left column (green), add `FriendsCardServer` with Suspense after MoodWidget:

```tsx
<Suspense fallback={<WidgetSkeleton />}>
  <FriendsCardServer userId={userId} />
</Suspense>
```

**Step 2: Add to social page**

Add as a third element, either above the gallery or in a new arrangement. Since social is 2-column grid, add friends card above `SocialGallery`:

```tsx
<div>
  <Suspense fallback={<WidgetSkeleton />}>
    <FriendsCardServer userId={userId} />
  </Suspense>
  <div className="mt-4">
    <SocialGallery userId={userId} />
  </div>
</div>
```

**Step 3: Type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add friends card to dashboard and social pages"
```

---

### Task 9: QR code on profile page

**Files:**
- Modify: `apps/nextjs/app/(protected)/profile/_components/profile-content.tsx`

**Step 1: Replace QR code placeholder**

Replace the "QR code bientôt disponible" section (lines 802-817) with a real QR code component.

Use `useInviteLinkQuery()` hook. When data available, generate QR code client-side with `qrcode` library (`QRCode.toDataURL(inviteUrl)`).

UI:
- QR code image (176x176, matching the existing h-44 w-44 placeholder)
- "Copier le lien" button with copy-to-clipboard feedback
- "Inviter par email" button that opens a small inline form or the FriendsModal

States:
- Loading: skeleton square
- Error: "Erreur lors de la génération du QR code"
- Success: QR image + buttons

Note: `qrcode` library `toDataURL` works in browser. Use `useEffect` + state to generate.

**Step 2: Type-check**

Run: `pnpm type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: replace QR code placeholder with real invite QR on profile"
```

---

### Task 10: Final verification

**Step 1: Run all checks**

Run: `pnpm check:all`
Expected: All pass (lint, types, tests, duplication)

**Step 2: Fix any Biome issues**

Run: `pnpm fix`

**Step 3: Final commit if needed**

```bash
git add -A && git commit -m "fix: cleanup lint issues"
```

**Step 4: Push**

```bash
git push
```
