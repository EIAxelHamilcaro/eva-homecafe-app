# Activity Log

## Session: 2026-01-21

### Tasks Completed

#### Task 49: Create Friend Controller
- **Status**: Completed
- **Files Created**:
  - `apps/nextjs/src/adapters/controllers/friend/friend.controller.ts`
- **Details**:
  - Implemented 6 handlers: sendRequest, respondRequest, getFriends, getPendingRequests, getInviteLink, acceptInvite
  - Used `getAuthenticatedUser()` helper pattern from profile controller
  - Proper Zod validation and error handling

#### Task 52: Register Friend DI Module
- **Status**: Completed (dependency of Task 49)
- **Files Created**:
  - `apps/nextjs/common/di/modules/friend.module.ts`
- **Files Modified**:
  - `apps/nextjs/common/di/types.ts` - Added DI symbols and return types for friend repositories and use cases
  - `apps/nextjs/common/di/container.ts` - Registered Friend module
- **Details**:
  - Bound IFriendRequestRepository, IInviteTokenRepository, INotificationRepository
  - Bound all 6 friend use cases
  - Used `toHigherOrderFunction()` pattern for use cases requiring APP_URL constant

#### Tasks 23-48: Domain, Application, and Adapter layers for Friends & Notifications
- **Status**: Already Completed (files existed from previous session)
- **Files Verified**:
  - Domain: FriendRequest aggregate, Notification aggregate, events, value objects
  - Application: DTOs, ports (repositories), use cases
  - Adapters: Mappers, repositories
  - Infrastructure: Drizzle schemas (friend.ts, notification.ts)
- **Details**: All files were already implemented. Marked tasks 23-48 as passing.

#### Task 53: Register Notification DI Module
- **Status**: Completed
- **Files Created**:
  - `apps/nextjs/common/di/modules/notification.module.ts`
- **Files Modified**:
  - `apps/nextjs/common/di/types.ts` - Added DI symbols and return types for GetNotificationsUseCase and MarkNotificationReadUseCase
  - `apps/nextjs/common/di/container.ts` - Registered Notification module
- **Details**:
  - Bound GetNotificationsUseCase and MarkNotificationReadUseCase
  - Both use cases depend only on INotificationRepository (already registered in friend.module.ts)

#### Task 50: Create Notification Controller
- **Status**: Completed
- **Files Created**:
  - `apps/nextjs/src/adapters/controllers/notification/notification.controller.ts`
- **Details**:
  - Implemented 3 handlers: getNotifications, markAsRead, getUnreadCount
  - Used `getAuthenticatedUser()` helper pattern for authentication
  - Proper Zod validation and error handling
  - getUnreadCount reuses GetNotificationsUseCase with minimal pagination

#### Task 51: Extend SSE Controller for Notifications
- **Status**: Completed
- **Files Modified**:
  - `apps/nextjs/src/adapters/controllers/chat/sse.controller.ts`
- **Details**:
  - Added 'notification' to SSEMessage type union
  - Added broadcastNotification() function for real-time notification delivery
  - Function sends to single user (vs broadcastXxx which sends to multiple participants)

#### Task 54: Create Friend API Routes
- **Status**: Completed
- **Files Created**:
  - `apps/nextjs/app/api/v1/friends/route.ts` (GET friends, POST send request)
  - `apps/nextjs/app/api/v1/friends/requests/route.ts` (GET pending)
  - `apps/nextjs/app/api/v1/friends/requests/[id]/respond/route.ts` (POST accept/reject)
  - `apps/nextjs/app/api/v1/friends/invite/route.ts` (GET generate invite link)
  - `apps/nextjs/app/api/v1/friends/invite/accept/route.ts` (POST accept invite token)
- **Details**:
  - Simple routes re-exporting controller functions
  - Follows existing `/api/v1/` pattern

#### Task 55: Create Notification API Routes
- **Status**: Completed
- **Files Created**:
  - `apps/nextjs/app/api/v1/notifications/route.ts` (GET list)
  - `apps/nextjs/app/api/v1/notifications/[id]/read/route.ts` (POST mark read)
  - `apps/nextjs/app/api/v1/notifications/unread-count/route.ts` (GET count)
- **Details**:
  - Simple routes re-exporting notification controller functions
  - Follows existing `/api/v1/` pattern

### Validation
- `pnpm type-check`: Passed
