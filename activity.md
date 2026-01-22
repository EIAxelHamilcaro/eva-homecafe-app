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

#### Task 56: Create Expo Friend Types
- **Status**: Completed
- **Files Created**:
  - `apps/expo/types/friend.ts` - Friend, FriendRequest, InviteLink, Pagination interfaces
  - `apps/expo/types/notification.ts` - Notification, NotificationType interfaces
- **Files Modified**:
  - `apps/expo/types/index.ts` - Exports all friend and notification types
- **Details**:
  - Types match backend DTOs for type-safe API calls
  - Includes input/response types for all friend and notification operations

#### Task 57: Create Expo Friend Hooks
- **Status**: Completed
- **Files Created**:
  - `apps/expo/lib/api/hooks/use-friends.ts` - useFriends, useSendFriendRequest hooks
  - `apps/expo/lib/api/hooks/use-friend-requests.ts` - usePendingRequests, useRespondRequest hooks
  - `apps/expo/lib/api/hooks/use-invite.ts` - useGenerateInvite, useAcceptInvite hooks
- **Details**:
  - Uses TanStack Query (useQuery, useMutation)
  - Query key factories for cache management
  - Automatic cache invalidation on mutations

#### Task 58: Create Expo Notification Hooks
- **Status**: Completed
- **Files Created**:
  - `apps/expo/lib/api/hooks/use-notifications.ts` - useNotifications, useUnreadCount, useMarkRead hooks
- **Details**:
  - Uses TanStack Query for caching and state management
  - Supports pagination and unreadOnly filtering
  - Query keys defined in centralized query-keys.ts

#### Task 59: Extend Expo SSE Hook
- **Status**: Completed
- **Files Modified**:
  - `apps/expo/constants/chat.ts` - Added 'notification' to SSEEventType and SSENotificationEvent interface
  - `apps/expo/lib/sse/use-sse.ts` - Added handleNotification callback and notification case handler
- **Details**:
  - Added SSENotificationEvent interface with notificationId, userId, notificationType, title, body
  - Added to SSEEvent union type
  - handleNotification invalidates notificationKeys.all when notification event received for current user
  - Imports notificationKeys from centralized query-keys.ts

### Validation
- `pnpm type-check`: Passed

---

## Session: 2026-01-22 (Expo UI Implementation)

### Tasks Completed

#### [001] Create button.tsx component - done (pre-existing)
- **Status**: Pre-existing (marked as complete)
- **File**: `apps/expo/components/ui/button.tsx`
- **Details**: Variants (default, destructive, outline, secondary, ghost, link), sizes (default, sm, lg, icon variants), loading state

#### [002] Create card.tsx component - done (pre-existing)
- **Status**: Pre-existing (marked as complete)
- **File**: `apps/expo/components/ui/card.tsx`
- **Details**: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter subcomponents

#### [003] Create input.tsx component - done (pre-existing)
- **Status**: Pre-existing (marked as complete)
- **File**: `apps/expo/components/ui/input.tsx`
- **Details**: Label prop, error state, PasswordInput with toggle visibility

#### [004] Create checkbox.tsx component - done (pre-existing)
- **Status**: Pre-existing (marked as complete)
- **File**: `apps/expo/components/ui/checkbox.tsx`
- **Details**: Checked/unchecked states, label support, disabled state styling

#### [005] Create toggle.tsx component - done
- **Status**: Completed
- **File Created**: `apps/expo/components/ui/toggle.tsx`
- **Details**:
  - Animated toggle/switch using React Native's built-in Animated API
  - Smooth color transition from gray (#E5E7EB) to primary pink (#F691C3)
  - Supports checked, onCheckedChange, disabled, label props
  - Shadow on thumb for depth
  - Compatible with existing component patterns (cn utility, NativeWind)

#### [006] Create modal.tsx component - done
- **Status**: Completed
- **File Created**: `apps/expo/components/ui/modal.tsx`
- **Details**:
  - Modal component with React Native Modal and Animated backdrop
  - Semi-transparent overlay (bg-black/50)
  - ModalCloseButton with pink border circle and X icon (lucide-react-native)
  - Open/close animations using Animated API (fade in 200ms, fade out 150ms)
  - ModalHeader, ModalContent, ModalFooter subcomponents
  - Props: open, onClose, animationType, showCloseButton, className, contentClassName
  - Follows shadcn-style composition pattern with cn utility

#### [007] Create tabs.tsx component - done
- **Status**: Completed
- **File Created**: `apps/expo/components/ui/tabs.tsx`
- **Details**:
  - Tabs, TabsList, TabsTrigger, TabsTriggerText, TabsContent components
  - Context-based state management (TabsContext) for active tab
  - TabsList supports scrollable prop for horizontal scrolling tabs
  - TabsTrigger with activeClassName prop for custom active styling
  - String children auto-wrapped in Text component
  - Follows shadcn-style composition pattern with cn utility
  - Designed to match Organisation screen tabs UI from screenshots

#### [008] Create badge.tsx and avatar.tsx - done
- **Status**: Completed
- **Files Created**:
  - `apps/expo/components/ui/badge.tsx`
  - `apps/expo/components/ui/avatar.tsx`
- **Details**:
  - **Badge**: Label/tag component with variants (default, secondary, destructive, outline, success, warning, info), sizes (sm, default, lg), auto text wrapping
  - **Avatar**: Circular image component with fallback support
    - Sizes: sm, default, lg, xl, 2xl
    - Auto-generates initials from alt text if no image
    - AvatarImage and AvatarFallback subcomponents for composition
    - Error handling for failed image loads
  - Both components use class-variance-authority for variant styling
  - Follows existing shadcn-style patterns with cn utility

#### [009] Create separator.tsx and slider.tsx - done (pre-existing)
- **Status**: Pre-existing (marked as complete)
- **Files**:
  - `apps/expo/components/ui/separator.tsx`
  - `apps/expo/components/ui/slider.tsx`
- **Details**:
  - **Separator**: Horizontal/vertical divider with orientation prop
  - **Slider**: PanResponder-based slider with min/max/step, animated track and thumb

#### [010] Create dropdown.tsx and radio-group.tsx - done
- **Status**: Completed
- **Files Created**:
  - `apps/expo/components/ui/dropdown.tsx`
  - `apps/expo/components/ui/radio-group.tsx`
- **Details**:
  - **Dropdown**: Modal-based dropdown select component
    - Props: value, options, onValueChange, placeholder, disabled
    - ChevronDown icon from lucide-react-native
    - ScrollView for long option lists
    - Selected option highlighting with primary color
  - **RadioGroup**: Context-based radio button group
    - RadioGroup (provider) and RadioGroupItem components
    - Props: value, onValueChange, disabled, orientation (horizontal/vertical)
    - RadioGroupItem: value, label, disabled, className props
    - Visual: 20px circle with inner dot when selected
  - Both follow shadcn-style composition patterns with cn utility

#### [011] Create barrel export index.ts - done (pre-existing)
- **Status**: Pre-existing (marked as complete)
- **File**: `apps/expo/components/ui/index.ts`
- **Details**: Exports all UI components from single entry point

#### [012] Add mood colors to tailwind.config.js - done (pre-existing)
- **Status**: Pre-existing (marked as complete)
- **File**: `apps/expo/tailwind.config.js`
- **Details**: Mood colors (calme, enervement, excitation, anxiete, tristesse, bonheur, ennui, nervosite, productivite) already configured

#### [013] Create Settings - Notifications card
- **Status**: Completed
- **File Created**: `apps/expo/app/(protected)/settings/index.tsx`
- **Details**:
  - Created Settings screen with header and back navigation
  - Notifications card with:
    - Email notifications toggle
    - Push notifications toggle
    - Nouveaux messages checkbox
    - Invitations checkbox
    - "Enregistrer les préférences" button
  - Uses Toggle, Checkbox, Button, Card components from UI library
  - SafeAreaView with top edge handling
  - French labels matching design specifications

#### [014] Create Settings - Sécurité card - done
- **Status**: Completed
- **File Modified**: `apps/expo/app/(protected)/settings/index.tsx`
- **Details**:
  - Added Sécurité card to settings screen
  - Double authentification toggle with state management
  - Appareils connectés list showing connected devices:
    - MacBook Pro d'Eva (Monitor icon)
    - iPhone d'Axel (Smartphone icon)
  - Added Monitor and Smartphone icons from lucide-react-native
  - Created ConnectedDevice interface for type safety
  - Styling matches design screenshot

#### [015] Create Settings - Confidentialité card - done
- **Status**: Completed
- **File Modified**: `apps/expo/app/(protected)/settings/index.tsx`
- **Details**:
  - Added Confidentialité card to settings screen
  - Profil visible toggle with state management
  - "Qui peut voir mes récompenses" dropdown with options:
    - Tout le monde
    - Amis (default)
    - Personne
  - "Télécharger mes données" button with outline variant and primary border/text
  - Imported Dropdown component from UI library
  - Styling matches design screenshot (Mobile - Réglages.png)

#### [016] Create Settings - Custom mode card - done
- **Status**: Completed
- **File Modified**: `apps/expo/app/(protected)/settings/index.tsx`
- **Details**:
  - Added RadioGroup import from components/ui/radio-group
  - Added state variables: themeMode, textSizeSmall, textSizeMedium, animationsEnabled
  - Custom mode card with:
    - Clair/Sombre radio buttons using RadioGroup with horizontal orientation
    - "Taille du texte" section with Petit and Moyen checkboxes
    - Animations toggle
    - "Enregistrer les préférences" button
  - Styling matches design screenshot (Mobile - Réglages.png)
