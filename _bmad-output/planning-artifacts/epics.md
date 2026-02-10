---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
status: complete
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - .claude/screenshots/Mobile.png
  - .claude/screenshots/Desktop.png
  - .claude/screenshots/Tablet.png
---

# eva-homecafe-app - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for eva-homecafe-app, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: Users can sign up with email and password
- FR2: Users can sign in with email and password
- FR3: Users can sign out
- FR4: Users can request a password reset via email code
- FR5: Users can reset their password with a valid code
- FR6: Users can view and edit their profile (name, first name, date of birth, email, profession, phone)
- FR7: Users can view and edit their address (street, postal code, city, country)
- FR8: Users can set preferences (language, time format, profile visibility toggle)
- FR9: Users can delete their account
- FR10: Users can generate a unique friend code
- FR11: Users can generate a QR code from their friend code
- FR12: Users can add a friend by entering a friend code
- FR13: Users can add a friend by scanning a QR code
- FR14: Users who sign up via a friend code are automatically connected to the code owner
- FR15: Users can view their friends list
- FR16: Users can view a friend's public profile
- FR17: Users can invite friends via a share action
- FR18: Users can create a post with rich text content (bold, italic, underline)
- FR19: Users can attach images to a post
- FR20: Users can set a post as private (journal) or public (visible to friends)
- FR21: Users can view their journal (filtered list of private posts, grouped by date)
- FR22: Users can browse journal entries by date
- FR23: Users can see their journal streak counter (day count)
- FR24: Users can view a single post detail
- FR25: Users can edit their own posts
- FR26: Users can delete their own posts
- FR27: Users can browse a feed of friends' public posts
- FR28: Users can react to a post
- FR29: Users can view reactions on a post
- FR30: Users can record a daily mood from 9 predefined categories (Calme, Enervement, Excitation, Anxiete, Tristesse, Bonheur, Ennui, Nervosite, Productivite)
- FR31: Users can set mood intensity via a slider
- FR32: Users can view mood check-ins per day of the week
- FR33: Users can view mood history as a weekly bar chart
- FR34: Users can view mood trends over a 6-month period
- FR35: Users can view a mood legend explaining each category
- FR36: Users can switch between three views: To-do list, Kanban board, Timeline/Chronology
- FR37: Users can create, edit, and delete to-do lists with checkable items
- FR38: Users can create kanban boards with columns
- FR39: Users can create kanban cards with title, description, progress percentage, and due date
- FR40: Users can move kanban cards between columns via drag & drop
- FR41: Users can reorder kanban cards within a column
- FR42: Users can view a chronology/timeline with calendar and colored events
- FR43: Users can send a direct message to a friend
- FR44: Users can view their message inbox (conversation list)
- FR45: Users can view a conversation thread with a friend
- FR46: Users receive messages in near real-time (under 2 seconds)
- FR47: Users can compose a new message (with friend selection popup)
- FR48: Users can upload photos to their gallery
- FR49: Users can browse their gallery
- FR50: Users can delete photos from their gallery
- FR51: Users can create moodboards
- FR52: Users can pin images and colors to a moodboard
- FR53: Users can browse and manage their moodboards
- FR54: Users can delete moodboard items and moodboards
- FR55: Users can view their sticker collection
- FR56: Users can view their badge/reward collection
- FR57: Users earn stickers and badges automatically based on activity criteria (streaks, milestones)
- FR58: Users receive notification when a new sticker or badge is earned
- FR59: Users can browse all available stickers with earning criteria
- FR60: Users can browse all available badges with earning criteria
- FR61: Dashboard displays mood summary widget (weekly chart + trend)
- FR62: Dashboard displays recent posts widget
- FR63: Dashboard displays task overview widget (to-do list quick view)
- FR64: Dashboard displays gallery preview widget
- FR65: Dashboard displays messaging preview widget (recent messages)
- FR66: Dashboard displays calendar widget (month view)
- FR67: Dashboard displays journal quick-compose widget
- FR68: Dashboard displays moodboard preview widget
- FR69: Dashboard displays empty states with contextual first-action prompts for new users
- FR70: Users receive push notifications for daily journal reminders (mobile)
- FR71: Users receive push notifications for friend activity (new post, reaction)
- FR72: Users receive push notifications for new messages
- FR73: Users receive push notifications for badges earned
- FR74: Users can configure which notification types are enabled
- FR75: Users can access a settings/preferences screen
- FR76: Users can configure notification preferences from settings
- FR77: Users can access a contact page (connected/non-connected states)
- FR78: Visitors can view a public landing page with hero section, feature highlights, and CTA
- FR79: Visitors can view user testimonials on the landing page
- FR80: Visitors can browse a FAQ section on the landing page
- FR81: Visitors can discover HomeCafe via search engines (meta tags, Open Graph data, semantic HTML, Lighthouse SEO score 90+)

### NonFunctional Requirements

- NFR1: Page load under 3 seconds on 4G mobile
- NFR2: Dashboard widgets render within 1 second
- NFR3: Real-time message delivery under 2 seconds
- NFR4: Image upload completes within 5 seconds (files up to 10MB)
- NFR5: Mood check-in response < 500ms
- NFR6: Kanban drag & drop smooth at 60fps
- NFR7: HTTPS/TLS for all data in transit
- NFR8: Passwords securely hashed with industry-standard algorithm
- NFR9: Secure session management with configurable expiry
- NFR10: File uploads via authenticated, time-limited presigned URLs only
- NFR11: Data isolation: users access own data + friends' public posts only
- NFR12: Account deletion permanently removes all user data (GDPR)
- NFR13: 99% uptime (standard hosting SLA)
- NFR14: Real-time SSE connection auto-reconnects on network interruption
- NFR15: Failed uploads: clear error message + retry option
- NFR16: Daily automated database backups
- NFR17: Mobile compatibility: iOS 15+ / Android 10+
- NFR18: Web compatibility: Chrome, Firefox, Safari, Edge (latest 2 versions)
- NFR19: Responsive design: mobile-first, tablet + desktop per Figma
- NFR20: Pixel-perfect Figma match across all breakpoints (mobile, tablet, desktop)
- NFR21: Loading states and error feedback on all interactive elements
- NFR22: Empty states display contextual first-action prompts
- NFR23: Consistent navigation (bottom tab bar mobile, sidebar desktop)
- NFR24: Animations complete within 300ms with easing curves

### Additional Requirements

**From Architecture:**

- Brownfield project: no starter template needed, patterns established by 5 existing modules (auth, chat, friend, notification, profile)
- Shared upload endpoint `/api/v1/upload` with `context` parameter (post, gallery, moodboard, avatar) generating presigned R2 URLs
- SSE exclusively for chat messaging (latency-critical <2s); social feed and notifications use standard request/response with pull-to-refresh
- Dashboard widgets implemented as independent async Server Components wrapped in `<Suspense fallback={<WidgetSkeleton />}>`
- API client strategy: platform-native, no shared package (Server Actions + direct fetch for web; TanStack React Query + SecureStore for mobile)
- Event-driven gamification engine: domain event listeners evaluate achievement criteria reactively; handlers subscribe to PostCreated, MoodRecorded, FriendRequestAccepted, streak calculations
- Push notifications triggered by domain event handlers via `IPushNotificationProvider` port (Expo EAS for mobile)
- Post aggregate with `isPrivate: boolean` flag; Journal = query filter on private posts (no separate aggregate)
- Organization: unified Board aggregate with Column and Card entities; three dynamic views (todo, kanban, chronology/calendar)
- Deployment: Vercel (Next.js) + Expo EAS (mobile builds); PostgreSQL provider TBD (Neon/Supabase/Railway)
- PostgreSQL only: no Redis, no message queues, no external services beyond BetterAuth + R2
- Implementation sequence: upload > posts > mood > organization > gallery + moodboard > social feed > gamification > stickers/badges > dashboard > push notifications > settings/contact/landing

**From UX (Figma Screenshots):**

- Responsive design: identical features across Mobile, Desktop, Tablet — only layout adapts
- 27 mobile screens with desktop and tablet equivalents
- Reusable component: Card code amis (friend code + QR code card)
- Navigation pattern: bottom tab bar (mobile), sidebar (desktop/tablet)
- Cozy cafe-inspired aesthetic consistent across all breakpoints
- Store compliance: content rating (4+/Everyone), privacy policy URL, app review guidelines adherence

### FR Coverage Map

- FR1: Already Implemented (Auth) - Sign up with email and password
- FR2: Already Implemented (Auth) - Sign in with email and password
- FR3: Already Implemented (Auth) - Sign out
- FR4: Already Implemented (Auth) - Password reset request via email code
- FR5: Already Implemented (Auth) - Reset password with valid code
- FR6: Already Implemented (Profile) - View and edit profile
- FR7: Already Implemented (Profile) - View and edit address
- FR8: Already Implemented (Profile) - Set preferences
- FR9: Already Implemented (Auth) - Delete account
- FR10: Already Implemented (Friends) - Generate unique friend code
- FR11: Already Implemented (Friends) - Generate QR code from friend code
- FR12: Already Implemented (Friends) - Add friend by code
- FR13: Already Implemented (Friends) - Add friend by scanning QR
- FR14: Already Implemented (Friends) - Auto-connect on sign-up via friend code
- FR15: Already Implemented (Friends) - View friends list
- FR16: Already Implemented (Friends) - View friend's public profile
- FR17: Already Implemented (Friends) - Invite friends via share
- FR18: Epic 1 - Create post with rich text
- FR19: Epic 1 - Attach images to post
- FR20: Epic 1 - Set post as private/public
- FR21: Epic 1 - View journal (filtered private posts by date)
- FR22: Epic 1 - Browse journal entries by date
- FR23: Epic 1 - Journal streak counter
- FR24: Epic 1 - View single post detail
- FR25: Epic 1 - Edit own posts
- FR26: Epic 1 - Delete own posts
- FR27: Epic 2 - Browse friends' public posts feed
- FR28: Epic 2 - React to a post
- FR29: Epic 2 - View reactions on a post
- FR30: Epic 3 - Record daily mood (9 categories)
- FR31: Epic 3 - Set mood intensity via slider
- FR32: Epic 3 - View mood check-ins per day of week
- FR33: Epic 3 - View mood history weekly bar chart
- FR34: Epic 3 - View mood trends 6-month period
- FR35: Epic 3 - View mood legend
- FR36: Epic 4 - Switch between 3 views (todo, kanban, timeline)
- FR37: Epic 4 - Create, edit, delete to-do lists
- FR38: Epic 4 - Create kanban boards with columns
- FR39: Epic 4 - Create kanban cards (title, description, progress, due date)
- FR40: Epic 4 - Move kanban cards via drag & drop
- FR41: Epic 4 - Reorder kanban cards within column
- FR42: Epic 4 - View chronology/timeline with calendar
- FR43: Already Implemented (Messaging) - Send DM to friend
- FR44: Already Implemented (Messaging) - View message inbox
- FR45: Already Implemented (Messaging) - View conversation thread
- FR46: Already Implemented (Messaging) - Real-time message delivery
- FR47: Already Implemented (Messaging) - Compose new message with friend selector
- FR48: Epic 5 - Upload photos to gallery
- FR49: Epic 5 - Browse gallery
- FR50: Epic 5 - Delete photos from gallery
- FR51: Epic 6 - Create moodboards
- FR52: Epic 6 - Pin images and colors to moodboard
- FR53: Epic 6 - Browse and manage moodboards
- FR54: Epic 6 - Delete moodboard items and moodboards
- FR55: Epic 7 - View sticker collection
- FR56: Epic 7 - View badge/reward collection
- FR57: Epic 7 - Earn stickers/badges automatically from activity
- FR58: Epic 7 - Notification on new sticker/badge earned
- FR59: Epic 7 - Browse all available stickers with criteria
- FR60: Epic 7 - Browse all available badges with criteria
- FR61: Epic 8 - Dashboard mood summary widget
- FR62: Epic 8 - Dashboard recent posts widget
- FR63: Epic 8 - Dashboard task overview widget
- FR64: Epic 8 - Dashboard gallery preview widget
- FR65: Epic 8 - Dashboard messaging preview widget
- FR66: Epic 8 - Dashboard calendar widget
- FR67: Epic 8 - Dashboard journal quick-compose widget
- FR68: Epic 8 - Dashboard moodboard preview widget
- FR69: Epic 8 - Dashboard empty states with first-action prompts
- FR70: Already Implemented (Notifications) - Push for journal reminders
- FR71: Already Implemented (Notifications) - Push for friend activity
- FR72: Already Implemented (Notifications) - Push for new messages
- FR73: Already Implemented (Notifications) - Push for badges earned
- FR74: Already Implemented (Notifications) - Configure notification types
- FR75: Epic 9 - Settings/preferences screen
- FR76: Epic 9 - Notification preferences from settings
- FR77: Epic 9 - Contact page (connected/non-connected)
- FR78: Epic 9 - Landing page with hero, features, CTA
- FR79: Epic 9 - Landing page testimonials
- FR80: Epic 9 - Landing page FAQ section
- FR81: Epic 9 - SEO (meta tags, Open Graph, semantic HTML, Lighthouse 90+)

## Epic List

### Epic 1: Content Creation & Personal Journal
Users can create posts (private or public) with rich text and images, manage their journal as a filtered view of private posts, track their writing streak, and edit/delete their content. Includes the shared file upload infrastructure that unblocks Gallery and Moodboard epics.
**FRs covered:** FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26
**Dependencies:** None (standalone, enables Epics 2, 5, 6)

### Epic 2: Social Feed & Reactions
Users can browse a feed of their friends' public posts and react to them, creating a lightweight social experience within the friend circle.
**FRs covered:** FR27, FR28, FR29
**Dependencies:** Epic 1 (posts must exist)

### Epic 3: Mood Tracking
Users can record their daily mood from 9 predefined categories with intensity, view check-ins per day, weekly bar charts, 6-month trends, and a mood legend.
**FRs covered:** FR30, FR31, FR32, FR33, FR34, FR35
**Dependencies:** None (fully standalone)

### Epic 4: Organization (Todo, Kanban, Timeline)
Users can manage tasks and projects through three interchangeable views: to-do lists with checkable items, kanban boards with drag & drop, and a chronology/timeline with calendar events.
**FRs covered:** FR36, FR37, FR38, FR39, FR40, FR41, FR42
**Dependencies:** None (fully standalone)

### Epic 5: Photo Gallery
Users can upload photos to their personal gallery, browse their collection, and delete photos.
**FRs covered:** FR48, FR49, FR50
**Dependencies:** Upload infrastructure (Epic 1)

### Epic 6: Moodboard
Users can create visual moodboards, pin images and colors to them, browse and manage their boards.
**FRs covered:** FR51, FR52, FR53, FR54
**Dependencies:** Upload infrastructure (Epic 1)

### Epic 7: Gamification — Stickers & Rewards
Users earn stickers and badges automatically based on activity criteria (streaks, milestones), receive notifications on earning, and can browse their collections and all available rewards.
**FRs covered:** FR55, FR56, FR57, FR58, FR59, FR60
**Dependencies:** Domain events from previous epics (event-driven, works with whatever modules exist)

### Epic 8: Dashboard Hub
Users see an all-in-one dashboard with 8 independent widgets (mood, posts, tasks, gallery, messages, calendar, journal compose, moodboard) plus contextual empty states for new users.
**FRs covered:** FR61, FR62, FR63, FR64, FR65, FR66, FR67, FR68, FR69
**Dependencies:** All previous modules for widget data (widgets show empty states gracefully)

### Epic 9: Settings, Contact & Landing Page
Users can manage their settings and notification preferences, access a contact page (with connected/non-connected states), and visitors can discover HomeCafe through a public landing page with SEO optimization.
**FRs covered:** FR75, FR76, FR77, FR78, FR79, FR80, FR81
**Dependencies:** None (standalone)

### Epic 10: Mobile Content — Posts, Journal & Social
Mobile implementation of content creation, journal, and social feed features. Backend API shared with web (Epics 1-2). Expo app has placeholder screens and existing journal/social components to build upon. Uses TanStack React Query for API calls and SecureStore for auth tokens.
**FRs covered:** FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR29 (mobile)
**Dependencies:** Epics 1-2 (backend exists), Expo auth + API client (already functional)

### Epic 11: Mobile Tracking — Mood, Tasks & Calendar
Mobile implementation of mood tracking and organization features. Backend API shared with web (Epics 3-4). Expo app has complete UI with mock data for mood charts, todo lists, kanban boards, and calendar — needs API connection to replace mock data.
**FRs covered:** FR30, FR31, FR32, FR33, FR34, FR35, FR36, FR37, FR38, FR39, FR40, FR41, FR42 (mobile)
**Dependencies:** Epics 3-4 (backend exists), Expo UI components (mock data implementations exist)

### Epic 12: Mobile Visual — Gallery & Moodboards
Mobile implementation of photo gallery and moodboard features. Backend API shared with web (Epics 5-6). Gallery is placeholder, moodboard has partial UI with mock data. expo-image-picker and expo-camera already installed.
**FRs covered:** FR48, FR49, FR50, FR51, FR52, FR53, FR54 (mobile)
**Dependencies:** Epics 5-6 (backend exists), shared upload endpoint

### Epic 13: Mobile Gamification & Dashboard
Mobile implementation of sticker/badge collections and dashboard widget API connection. Backend API shared with web (Epics 7-8). Dashboard has 8 widget components using mock data. Sticker/badge screens are placeholders with existing UI components.
**FRs covered:** FR55, FR56, FR57, FR58, FR59, FR60, FR61, FR62, FR63, FR64, FR65, FR66, FR67, FR68, FR69 (mobile)
**Dependencies:** Epics 7-8 (backend exists), Expo dashboard widgets (mock data)

### Epic 14: Mobile Polish — Settings, Push & QR
Mobile-specific features: connect settings UI to API, Expo EAS push notifications, friend QR code scanning, deep links, and auth flow completion (forgot/reset password). Settings screen UI exists with TODO handlers. expo-notifications and expo-camera installed.
**FRs covered:** FR8, FR9, FR70, FR71, FR72, FR73, FR74, FR75, FR76 (mobile)
**Dependencies:** Epic 9 (settings backend), Expo EAS configuration

### Epic 15: Technical Debt & Production Readiness
Cross-platform technical debt accumulated over 9 web epics: database migration push (9 epics), DeleteAccountUseCase implementation, OG image creation, and i18n wiring. Prepares codebase for production deployment on Vercel (web) and Expo EAS (mobile).
**FRs covered:** FR9 (delete account), NFR12 (GDPR deletion)
**Dependencies:** All previous epics (debt items span full codebase)

---

## Epic 1: Content Creation & Personal Journal

Users can create posts (private or public) with rich text and images, manage their journal as a filtered view of private posts, track their writing streak, and edit/delete their content. Includes the shared file upload infrastructure that unblocks Gallery and Moodboard epics.

### Story 1.1: Shared File Upload Infrastructure

As a **user**,
I want to upload images securely to the platform,
So that I can attach photos to my posts, gallery, and moodboards.

**Acceptance Criteria:**

**Given** an authenticated user
**When** they send a POST request to `/api/v1/upload` with a `context` parameter (post, gallery, moodboard, avatar) and file metadata (name, type, size)
**Then** the system returns a presigned R2 URL for direct upload
**And** the URL is time-limited and authenticated

**Given** an unauthenticated user
**When** they request an upload URL
**Then** the system returns a 401 Unauthorized error

**Given** a file exceeding 10MB
**When** the user requests an upload URL
**Then** the system returns a 400 error with a clear message about the size limit

**Given** a non-image file type
**When** the user requests an upload URL
**Then** the system returns a 400 error indicating only image formats are accepted

**Given** an invalid context value
**When** the user requests an upload URL
**Then** the system returns a 400 validation error

### Story 1.2: Create a Post

As a **user**,
I want to create a post with rich text and images, choosing whether it's private (journal) or public (visible to friends),
So that I can express myself and build my personal journal or share with friends.

**Acceptance Criteria:**

**Given** an authenticated user on the create post page
**When** they write content with rich text formatting (bold, italic, underline), optionally attach images, select visibility (private/public), and submit
**Then** the post is created and persisted with all content, images, and visibility setting
**And** a PostCreatedEvent domain event is dispatched after persistence

**Given** an authenticated user
**When** they create a post without any content (empty text, no images)
**Then** the system returns a validation error

**Given** an authenticated user
**When** they create a post with images
**Then** each image URL is stored with the post
**And** images are displayed in the post

**Given** an authenticated user
**When** they set visibility to private
**Then** the post is only visible to the author (journal entry)

**Given** an authenticated user
**When** they set visibility to public
**Then** the post is visible to the author's friends in the social feed

**Given** an authenticated user
**When** they create a post successfully
**Then** the Post aggregate is created with: content, images (optional), isPrivate flag, userId, createdAt
**And** the post DB schema (post table) is created if not exists

### Story 1.3: View Posts & Post Detail

As a **user**,
I want to view my posts and see the full detail of a single post,
So that I can review what I've written.

**Acceptance Criteria:**

**Given** an authenticated user with existing posts
**When** they navigate to the posts list
**Then** they see a paginated list of their own posts (public and private) ordered by most recent
**And** each post shows a preview of content, image thumbnail (if any), visibility indicator, and date

**Given** an authenticated user
**When** they select a specific post
**Then** they see the full post detail: complete rich text content, all images, visibility status, creation date

**Given** an authenticated user with no posts
**When** they navigate to the posts list
**Then** they see an empty state with a contextual prompt to create their first post

**Given** an authenticated user
**When** they try to view another user's private post by ID
**Then** the system returns a 403 Forbidden or 404 Not Found error

**Given** a posts list with many entries
**When** the user scrolls or navigates pages
**Then** pagination works correctly with proper page/limit parameters

### Story 1.4: Journal View & Streak Counter

As a **user**,
I want to view my journal (private posts grouped by date) and see my writing streak,
So that I can reflect on my personal entries and stay motivated by my consistency.

**Acceptance Criteria:**

**Given** an authenticated user with private posts
**When** they navigate to the journal page
**Then** they see only their private posts, grouped by date (most recent first)
**And** public posts are excluded from this view

**Given** an authenticated user on the journal page
**When** they browse entries
**Then** they can navigate by date to find specific entries

**Given** an authenticated user who has written private posts on 5 consecutive days
**When** they view the journal page
**Then** the streak counter displays "5" (consecutive days with at least one private post)

**Given** an authenticated user who missed a day of journaling
**When** they view the journal page
**Then** the streak counter resets to the current consecutive count since the last gap

**Given** an authenticated user with no private posts
**When** they navigate to the journal page
**Then** they see an empty state encouraging them to write their first journal entry

### Story 1.5: Edit & Delete Posts

As a **user**,
I want to edit and delete my own posts,
So that I can correct mistakes or remove content I no longer want.

**Acceptance Criteria:**

**Given** an authenticated user viewing their own post
**When** they choose to edit and modify the content, images, or visibility setting, then save
**Then** the post is updated with the new content
**And** a PostUpdatedEvent domain event is dispatched after persistence
**And** the updatedAt timestamp is set

**Given** an authenticated user
**When** they attempt to edit another user's post
**Then** the system returns a 403 Forbidden error

**Given** an authenticated user viewing their own post
**When** they choose to delete the post and confirm
**Then** the post is permanently removed
**And** a PostDeletedEvent domain event is dispatched after persistence

**Given** an authenticated user
**When** they attempt to delete another user's post
**Then** the system returns a 403 Forbidden error

**Given** an authenticated user editing a post
**When** they change visibility from public to private
**Then** the post is removed from the social feed and appears only in their journal

**Given** an authenticated user editing a post
**When** they submit empty content (no text, no images)
**Then** the system returns a validation error

---

## Epic 2: Social Feed & Reactions

Users can browse a feed of their friends' public posts and react to them, creating a lightweight social experience within the friend circle.

### Story 2.1: Browse Friends' Public Feed

As a **user**,
I want to browse a feed of my friends' public posts,
So that I can stay connected with what my friends are sharing.

**Acceptance Criteria:**

**Given** an authenticated user with friends who have public posts
**When** they navigate to the social feed page
**Then** they see a paginated feed of friends' public posts ordered by most recent
**And** each post shows author name, avatar, content preview, images, date, and reaction count

**Given** an authenticated user with no friends
**When** they navigate to the social feed
**Then** they see an empty state encouraging them to add friends via friend code

**Given** an authenticated user whose friends have no public posts
**When** they navigate to the social feed
**Then** they see an empty state indicating no posts yet from friends

**Given** a feed with many posts
**When** the user scrolls
**Then** pagination loads additional posts seamlessly

**Given** an authenticated user
**When** viewing the feed
**Then** their own public posts are NOT displayed in the social feed (feed shows friends only)

### Story 2.2: React to Posts & View Reactions

As a **user**,
I want to react to friends' posts and see reactions on posts,
So that I can engage with my friends' content in a lightweight way.

**Acceptance Criteria:**

**Given** an authenticated user viewing a friend's public post
**When** they tap/click the react button
**Then** a reaction is added to the post and the reaction count updates immediately

**Given** an authenticated user who already reacted to a post
**When** they tap/click the react button again
**Then** the reaction is removed (toggle behavior)

**Given** any user viewing a post (own or friend's)
**When** they view the post
**Then** they can see the total reaction count and who reacted

**Given** an authenticated user
**When** they react to a post
**Then** a PostReactedEvent domain event is dispatched (for gamification)

**Given** an unauthenticated user
**When** they attempt to react
**Then** the system returns a 401 error

---

## Epic 3: Mood Tracking

Users can record their daily mood from 9 predefined categories with intensity, view check-ins per day, weekly bar charts, 6-month trends, and a mood legend.

### Story 3.1: Record Daily Mood

As a **user**,
I want to record my daily mood by selecting a category and intensity,
So that I can track how I feel over time.

**Acceptance Criteria:**

**Given** an authenticated user
**When** they open the mood tracker
**Then** they see 9 predefined mood categories (Calme, Enervement, Excitation, Anxiete, Tristesse, Bonheur, Ennui, Nervosite, Productivite)
**And** they can select one category and adjust intensity via a slider

**Given** an authenticated user who selects a mood and intensity
**When** they submit the mood check-in
**Then** the mood entry is persisted with category, intensity, userId, and timestamp
**And** a MoodRecordedEvent domain event is dispatched
**And** response time is under 500ms (NFR5)

**Given** an authenticated user who already recorded a mood today
**When** they open the mood tracker
**Then** they see their current mood for today and can update it

**Given** an authenticated user
**When** they submit a mood check-in without selecting a category
**Then** the system returns a validation error

**Given** the MoodEntry aggregate
**When** created
**Then** it includes: MoodCategory VO (one of 9 values), MoodIntensity VO (slider range), userId, createdAt
**And** the mood DB schema (mood_entry table) is created

### Story 3.2: View Mood History & Charts

As a **user**,
I want to view my mood history as charts and trends,
So that I can understand my emotional patterns over time.

**Acceptance Criteria:**

**Given** an authenticated user with mood entries
**When** they view mood check-ins per day of the week
**Then** they see which moods were recorded on each day of the current week

**Given** an authenticated user with mood entries spanning multiple weeks
**When** they view the weekly bar chart
**Then** they see a bar chart summarizing mood distribution for the current week

**Given** an authenticated user with mood entries spanning months
**When** they view the 6-month trend view
**Then** they see mood trends over the last 6 months with visual indicators of dominant moods

**Given** an authenticated user
**When** they view the mood legend
**Then** they see all 9 mood categories with explanations and associated colors/icons

**Given** an authenticated user with no mood entries
**When** they view the mood tracker page
**Then** they see an empty state encouraging their first mood check-in

**Given** the mood stats API endpoint
**When** queried with a time range (weekly or 6-month)
**Then** it returns aggregated mood data formatted for chart rendering

---

## Epic 4: Organization (Todo, Kanban, Timeline)

Users can manage tasks and projects through three interchangeable views: to-do lists with checkable items, kanban boards with drag & drop, and a chronology/timeline with calendar events.

### Story 4.1: Create & Manage Todo Lists

As a **user**,
I want to create to-do lists with checkable items,
So that I can track simple tasks and daily goals.

**Acceptance Criteria:**

**Given** an authenticated user on the organization page
**When** they select the "To-do" view tab
**Then** they see their to-do lists with checkable items

**Given** an authenticated user
**When** they create a new to-do list with a title and items
**Then** the board is created with a single column (todo type) and card items
**And** the Board aggregate, Column entity, Card entity, and DB schema (board, column, card tables) are created

**Given** an authenticated user with an existing to-do list
**When** they check/uncheck an item
**Then** the item status toggles and persists immediately

**Given** an authenticated user
**When** they edit a to-do list title or item text
**Then** the changes are saved

**Given** an authenticated user
**When** they delete a to-do list
**Then** the list and all its items are permanently removed

**Given** an authenticated user with no to-do lists
**When** they view the to-do tab
**Then** they see an empty state prompting them to create their first list

### Story 4.2: Kanban Boards with Drag & Drop

As a **user**,
I want to create kanban boards with columns and drag cards between them,
So that I can visually organize projects and workflows.

**Acceptance Criteria:**

**Given** an authenticated user on the organization page
**When** they select the "Kanban" view tab
**Then** they see their kanban boards

**Given** an authenticated user
**When** they create a new kanban board with a title and columns
**Then** the board is created with multiple columns

**Given** an authenticated user
**When** they create a card with title, description, progress percentage, and due date
**Then** the card is added to the specified column

**Given** an authenticated user viewing a kanban board
**When** they drag a card from one column to another
**Then** the card moves to the target column and the change persists
**And** the drag & drop interaction runs at 60fps (NFR6)

**Given** an authenticated user viewing a kanban board
**When** they drag a card within the same column to reorder
**Then** the card order updates and persists

**Given** an authenticated user
**When** they update a card's progress percentage
**Then** the progress indicator reflects the new value

**Given** an authenticated user
**When** a card is completed (moved to done column or progress 100%)
**Then** a CardCompletedEvent domain event is dispatched (for gamification)

### Story 4.3: Chronology / Timeline View

As a **user**,
I want to view my tasks and events on a calendar timeline,
So that I can see deadlines and plan my schedule visually.

**Acceptance Criteria:**

**Given** an authenticated user on the organization page
**When** they select the "Chronology" view tab
**Then** they see a calendar/timeline view showing all cards with due dates

**Given** cards with due dates across multiple boards
**When** the user views the chronology
**Then** events appear on the correct dates with color coding per board

**Given** an authenticated user
**When** they tap/click an event on the timeline
**Then** they see the card detail (title, description, progress, source board)

**Given** an authenticated user with no cards with due dates
**When** they view the chronology
**Then** they see an empty calendar with a prompt to add due dates to their tasks

**Given** the three view tabs (todo, kanban, chronology)
**When** the user switches between them
**Then** all views reflect the same underlying data (unified Board model)

---

## Epic 5: Photo Gallery

Users can upload photos to their personal gallery, browse their collection, and delete photos.

### Story 5.1: Upload Photos to Gallery

As a **user**,
I want to upload photos to my personal gallery,
So that I can keep a visual collection of my favorite moments.

**Acceptance Criteria:**

**Given** an authenticated user on the gallery page
**When** they upload one or more photos
**Then** the photos are uploaded via the shared upload endpoint (context: gallery) and added to their gallery
**And** the Photo aggregate and DB schema (gallery/photo table) are created

**Given** an authenticated user uploading a photo
**When** the upload completes
**Then** a PhotoUploadedEvent domain event is dispatched (for gamification)
**And** the upload completes within 5 seconds for files up to 10MB (NFR4)

**Given** an authenticated user uploading a file that is not an image
**When** they submit
**Then** the system returns a validation error

**Given** an authenticated user
**When** the upload fails due to network error
**Then** a clear error message is displayed with a retry option (NFR15)

### Story 5.2: Browse & Delete Gallery Photos

As a **user**,
I want to browse my photo collection and remove photos I no longer want,
So that I can manage my visual memories.

**Acceptance Criteria:**

**Given** an authenticated user with photos in their gallery
**When** they navigate to the gallery page
**Then** they see a photo grid with thumbnails, paginated

**Given** an authenticated user viewing their gallery
**When** they select a photo
**Then** they see the full-size image

**Given** an authenticated user
**When** they choose to delete a photo and confirm
**Then** the photo is removed from the gallery and from R2 storage

**Given** an authenticated user with no photos
**When** they navigate to the gallery
**Then** they see an empty state encouraging them to upload their first photo

**Given** an authenticated user
**When** they attempt to access another user's gallery
**Then** the system returns a 403 Forbidden error

---

## Epic 6: Moodboard

Users can create visual moodboards, pin images and colors to them, browse and manage their boards.

### Story 6.1: Create & Browse Moodboards

As a **user**,
I want to create and browse my visual moodboards,
So that I can collect and organize visual inspiration.

**Acceptance Criteria:**

**Given** an authenticated user
**When** they create a new moodboard with a title
**Then** the moodboard is created and persisted
**And** the Moodboard aggregate, Pin entity, and DB schema (moodboard, pin tables) are created
**And** a MoodboardCreatedEvent domain event is dispatched

**Given** an authenticated user with existing moodboards
**When** they navigate to the moodboard page
**Then** they see a list/grid of their moodboards with preview thumbnails

**Given** an authenticated user
**When** they select a moodboard
**Then** they see all pinned items (images and colors) in the board layout

**Given** an authenticated user with no moodboards
**When** they navigate to the moodboard page
**Then** they see an empty state encouraging them to create their first board

### Story 6.2: Pin Items & Manage Moodboard Content

As a **user**,
I want to pin images and colors to my moodboards and remove items,
So that I can curate my visual inspiration freely.

**Acceptance Criteria:**

**Given** an authenticated user viewing a moodboard
**When** they pin an image (uploaded via shared upload endpoint, context: moodboard)
**Then** the image pin is added to the moodboard and displayed

**Given** an authenticated user viewing a moodboard
**When** they pin a color (via color picker)
**Then** the color pin is added to the moodboard and displayed

**Given** an authenticated user viewing a moodboard
**When** they delete a pin (image or color)
**Then** the pin is removed from the board

**Given** an authenticated user
**When** they delete an entire moodboard
**Then** the moodboard and all its pins are permanently removed

**Given** an authenticated user
**When** they attempt to modify another user's moodboard
**Then** the system returns a 403 Forbidden error

---

## Epic 7: Gamification — Stickers & Rewards

Users earn stickers and badges automatically based on activity criteria (streaks, milestones), receive notifications on earning, and can browse their collections and all available rewards.

### Story 7.1: Achievement Engine & Reward Evaluation

As a **user**,
I want to automatically earn stickers and badges when I reach activity milestones,
So that I feel rewarded for my engagement and consistency.

**Acceptance Criteria:**

**Given** domain events are dispatched from modules (PostCreated, MoodRecorded, CardCompleted, PhotoUploaded, etc.)
**When** the gamification event handler receives an event
**Then** it evaluates all relevant achievement criteria for the user

**Given** a user who meets an achievement criteria (e.g., 7-day journal streak, 10 mood check-ins, first post)
**When** the criteria is evaluated
**Then** a new Sticker or Badge is awarded to the user
**And** a StickerEarnedEvent or BadgeEarnedEvent domain event is dispatched
**And** the Sticker/Badge aggregates and DB schema (reward tables) are created

**Given** a user who earns a new sticker or badge
**When** the reward event is dispatched
**Then** a notification is created informing the user (FR58)

**Given** a user who already has a specific sticker/badge
**When** the same criteria is met again
**Then** no duplicate reward is created (idempotent)

**Given** the achievement criteria definitions
**When** the system initializes
**Then** criteria include at minimum: journal streaks, mood consistency, post count milestones, friend connection milestones, gallery milestones

### Story 7.2: Browse Sticker & Badge Collections

As a **user**,
I want to view my earned stickers and badges, and browse all available ones,
So that I can see my progress and know what to aim for next.

**Acceptance Criteria:**

**Given** an authenticated user
**When** they navigate to the stickers page
**Then** they see their earned stickers highlighted and unearned ones grayed out
**And** each sticker shows its earning criteria

**Given** an authenticated user
**When** they navigate to the badges/rewards page
**Then** they see their earned badges highlighted and unearned ones grayed out
**And** each badge shows its earning criteria

**Given** an authenticated user
**When** they select "View All" stickers
**Then** they see the full sticker collection grid with earning criteria for each

**Given** an authenticated user
**When** they select "View All" badges
**Then** they see the full badge collection grid with earning criteria for each

**Given** a new user with no rewards
**When** they view the collections
**Then** they see all available rewards with clear criteria, motivating first actions

---

## Epic 8: Dashboard Hub

Users see an all-in-one dashboard with 8 independent widgets (mood, posts, tasks, gallery, messages, calendar, journal compose, moodboard) plus contextual empty states for new users.

### Story 8.1: Dashboard Layout & Empty States

As a **user**,
I want to see a dashboard that organizes all my key information in one view,
So that I have a single entry point to everything that matters.

**Acceptance Criteria:**

**Given** an authenticated user
**When** they navigate to the dashboard (connected landing page)
**Then** they see a layout with 8 widget slots, each wrapped in `<Suspense>` with skeleton fallbacks
**And** widgets load independently (fastest appear first)
**And** each widget renders within 1 second (NFR2)

**Given** a new user with no data in any module
**When** they view the dashboard
**Then** each widget displays a contextual empty state with a first-action prompt (FR69)
**And** prompts guide the user to: record mood, write first post, create a to-do, upload a photo, send a message, create a moodboard

**Given** the dashboard page
**When** rendered as a Server Component
**Then** it composes 8 independent async Server Components with Suspense boundaries

### Story 8.2: Mood & Journal Widgets

As a **user**,
I want mood summary and journal quick-compose widgets on my dashboard,
So that I can check in and write without navigating away.

**Acceptance Criteria:**

**Given** an authenticated user with mood entries
**When** the mood summary widget loads
**Then** it displays the weekly mood chart and current trend indicator (FR61)

**Given** an authenticated user with no mood entries
**When** the mood widget loads
**Then** it shows an empty state prompting a first mood check-in

**Given** an authenticated user on the dashboard
**When** they use the journal quick-compose widget
**Then** they can write a quick private post (journal entry) directly from the dashboard (FR67)
**And** on submit, the post is created as private

### Story 8.3: Posts & Messaging Widgets

As a **user**,
I want recent posts and messaging preview widgets on my dashboard,
So that I can stay updated on content and conversations at a glance.

**Acceptance Criteria:**

**Given** an authenticated user with posts
**When** the recent posts widget loads
**Then** it displays the 3-5 most recent posts (own) with preview (FR62)

**Given** an authenticated user with conversations
**When** the messaging preview widget loads
**Then** it displays the most recent messages/conversations with unread indicators (FR65)

**Given** an authenticated user with no posts or messages
**When** these widgets load
**Then** they show contextual empty states

### Story 8.4: Tasks & Calendar Widgets

As a **user**,
I want task overview and calendar widgets on my dashboard,
So that I can see what needs to be done today and upcoming deadlines.

**Acceptance Criteria:**

**Given** an authenticated user with to-do items
**When** the task overview widget loads
**Then** it displays a quick view of pending to-do items with checkboxes (FR63)

**Given** an authenticated user with cards that have due dates
**When** the calendar widget loads
**Then** it displays a month view with colored event markers (FR66)

**Given** an authenticated user with no tasks or events
**When** these widgets load
**Then** they show contextual empty states

### Story 8.5: Gallery & Moodboard Widgets

As a **user**,
I want gallery and moodboard preview widgets on my dashboard,
So that I can see my visual content at a glance.

**Acceptance Criteria:**

**Given** an authenticated user with gallery photos
**When** the gallery preview widget loads
**Then** it displays a small grid of recent photos (FR64)

**Given** an authenticated user with moodboards
**When** the moodboard preview widget loads
**Then** it displays a preview of the most recent moodboard (FR68)

**Given** an authenticated user with no photos or moodboards
**When** these widgets load
**Then** they show contextual empty states encouraging first uploads

---

## Epic 9: Settings, Contact & Landing Page

Users can manage their settings and notification preferences, access a contact page (with connected/non-connected states), and visitors can discover HomeCafe through a public landing page with SEO optimization.

### Story 9.1: Settings & Preferences Page

As a **user**,
I want to access a settings page to manage my preferences and notifications,
So that I can customize my experience.

**Acceptance Criteria:**

**Given** an authenticated user
**When** they navigate to the settings page
**Then** they see their current preferences (language, time format, profile visibility)

**Given** an authenticated user on the settings page
**When** they modify notification preferences (journal reminders, friend activity, messages, badges)
**Then** the toggles persist and control which push notifications they receive (FR74, FR76)

**Given** an authenticated user
**When** they save updated preferences
**Then** the changes are applied immediately

### Story 9.2: Contact Page

As a **user** (authenticated or not),
I want to access a contact page to reach support,
So that I can get help or send feedback.

**Acceptance Criteria:**

**Given** an authenticated user
**When** they navigate to the contact page
**Then** they see a contact form pre-filled with their name and email (connected state)

**Given** a non-authenticated visitor
**When** they navigate to the contact page
**Then** they see a contact form with empty name and email fields (non-connected state)

**Given** any user
**When** they submit the contact form with valid data
**Then** the message is sent and a confirmation is displayed

**Given** any user
**When** they submit the contact form with missing required fields
**Then** a validation error is displayed

### Story 9.3: Public Landing Page & SEO

As a **visitor**,
I want to discover HomeCafe through a compelling landing page,
So that I understand the product and am motivated to sign up.

**Acceptance Criteria:**

**Given** a visitor (non-authenticated)
**When** they navigate to the root URL
**Then** they see the public landing page with hero section, feature highlights, and CTA to sign up (FR78)

**Given** a visitor on the landing page
**When** they scroll down
**Then** they see user testimonials (FR79)

**Given** a visitor on the landing page
**When** they browse the FAQ section
**Then** they see commonly asked questions with answers (FR80)

**Given** a search engine crawler
**When** it indexes the landing page
**Then** proper meta tags, Open Graph data, and semantic HTML are present
**And** Lighthouse SEO score is 90+ (FR81)

**Given** the landing page
**When** rendered
**Then** it uses SSR for optimal SEO performance

---

## Epic 10: Mobile Content — Posts, Journal & Social

Mobile implementation of content creation, journal, and social feed. Backend API shared with web. Expo app has placeholder screens and existing journal/social components. Uses TanStack React Query + SecureStore auth.

### Story 10.1: Journal & Posts (Mobile)

As a **mobile user**,
I want to create, view, edit, and delete posts from my phone,
So that I can maintain my journal and share content on the go.

**Acceptance Criteria:**

**Given** an authenticated mobile user
**When** they navigate to the journal screen
**Then** they see their private posts grouped by date, fetched via TanStack Query from `/api/v1/posts`

**Given** an authenticated mobile user
**When** they create a post with rich text and optional images (via expo-image-picker)
**Then** the post is persisted via the shared API and appears in their journal or social feed

**Given** an authenticated mobile user viewing a post
**When** they tap edit or delete
**Then** the post is updated or removed via the API and the local query cache is invalidated

**Given** an authenticated mobile user
**When** they view their journal
**Then** they see their streak counter and can browse entries by date

**Given** the existing Expo components
**When** implementing this story
**Then** reuse existing `components/journal/` components and `lib/api/hooks/` patterns

### Story 10.2: Social Feed & Reactions (Mobile)

As a **mobile user**,
I want to browse my friends' public posts and react to them,
So that I can stay connected with friends from my phone.

**Acceptance Criteria:**

**Given** an authenticated mobile user with friends
**When** they navigate to the social feed screen
**Then** they see a paginated feed of friends' public posts fetched from `/api/v1/feed`

**Given** an authenticated mobile user viewing a friend's post
**When** they tap the react button
**Then** the reaction toggles and the count updates optimistically via TanStack Query mutation

**Given** an authenticated mobile user with no friends
**When** they navigate to the social feed
**Then** they see an empty state encouraging friend code sharing

**Given** the existing Expo components
**When** implementing this story
**Then** reuse existing `components/social/` components (PublicPostCard, etc.)

---

## Epic 11: Mobile Tracking — Mood, Tasks & Calendar

Mobile implementation of mood tracking and organization. Expo app has complete UI with mock data for mood charts, todo lists, kanban boards, and calendar. This epic replaces mock data with real API calls.

### Story 11.1: Mood Tracking (Mobile)

As a **mobile user**,
I want to record my daily mood and view mood charts from my phone,
So that I can track my emotional patterns on the go.

**Acceptance Criteria:**

**Given** an authenticated mobile user
**When** they open the mood tracker
**Then** they see 9 mood categories with intensity slider, fetched from and submitted to `/api/v1/moods`

**Given** an authenticated mobile user with mood entries
**When** they view mood history
**Then** they see weekly bar chart and 6-month trends using victory-native charts connected to real API data

**Given** the existing Expo mood UI
**When** implementing this story
**Then** replace mock data in `components/moodboard/` with TanStack Query hooks calling the mood API

### Story 11.2: Organisation — Todo, Kanban, Timeline (Mobile)

As a **mobile user**,
I want to manage my tasks through todo lists, kanban boards, and calendar from my phone,
So that I can organize my projects anywhere.

**Acceptance Criteria:**

**Given** an authenticated mobile user
**When** they navigate to the organisation screen
**Then** they see three view tabs (todo, kanban, chronology) with data from `/api/v1/boards`

**Given** an authenticated mobile user on the kanban view
**When** they drag a card between columns
**Then** the card moves with 60fps animation (react-native-draggable-flatlist) and persists via API

**Given** an authenticated mobile user on the calendar view
**When** they view the chronology
**Then** they see cards with due dates on react-native-calendars, connected to real API data

**Given** the existing Expo organisation UI
**When** implementing this story
**Then** replace mock data in `components/organisation/` with TanStack Query hooks calling the boards API

---

## Epic 12: Mobile Visual — Gallery & Moodboards

Mobile implementation of photo gallery and moodboard features. Gallery screen is placeholder, moodboard has partial UI. expo-image-picker and expo-camera already installed.

### Story 12.1: Photo Gallery (Mobile)

As a **mobile user**,
I want to upload, browse, and delete photos from my phone gallery,
So that I can build my visual collection using my phone camera or photo library.

**Acceptance Criteria:**

**Given** an authenticated mobile user
**When** they navigate to the gallery screen
**Then** they see a photo grid fetched from `/api/v1/gallery`

**Given** an authenticated mobile user
**When** they tap upload and select photos via expo-image-picker
**Then** photos are uploaded via the shared upload endpoint (context: gallery) using the ApiClient.uploadFile method

**Given** an authenticated mobile user
**When** they long-press or swipe a photo to delete
**Then** the photo is removed from the gallery via API

**Given** no photos in gallery
**When** the user views the gallery
**Then** they see an empty state encouraging first upload

### Story 12.2: Moodboard Management (Mobile)

As a **mobile user**,
I want to create and manage moodboards from my phone,
So that I can curate visual inspiration anywhere.

**Acceptance Criteria:**

**Given** an authenticated mobile user
**When** they navigate to the moodboard screen
**Then** they see their moodboards fetched from `/api/v1/moodboards`

**Given** an authenticated mobile user viewing a moodboard
**When** they pin an image (via expo-image-picker) or a color
**Then** the pin is persisted via API

**Given** the existing Expo moodboard UI
**When** implementing this story
**Then** replace mock data with TanStack Query hooks calling the moodboard API

---

## Epic 13: Mobile Gamification & Dashboard

Mobile implementation of sticker/badge collections and dashboard widget real API connection. Dashboard has 8 widget components using mock data. Sticker/badge screens are placeholders.

### Story 13.1: Stickers & Badge Collections (Mobile)

As a **mobile user**,
I want to view my sticker and badge collections and see earning criteria,
So that I can track my achievements and stay motivated.

**Acceptance Criteria:**

**Given** an authenticated mobile user
**When** they navigate to the stickers screen
**Then** they see earned stickers highlighted and unearned grayed out, fetched from `/api/v1/rewards`

**Given** an authenticated mobile user
**When** they navigate to the badges/rewards screen
**Then** they see earned badges highlighted with earning criteria from API

**Given** the existing Expo components
**When** implementing this story
**Then** reuse existing `components/badges/` and `components/stickers/` components

### Story 13.2: Dashboard Widgets — Real API Connection (Mobile)

As a **mobile user**,
I want my dashboard widgets to show real data instead of mock data,
So that I have an accurate overview of all my content.

**Acceptance Criteria:**

**Given** an authenticated mobile user
**When** they view the home dashboard
**Then** all 8 widgets display real data fetched from their respective API endpoints

**Given** the existing dashboard widget components
**When** implementing this story
**Then** replace mock data imports in `(tabs)/_components/` with TanStack Query hooks

**Given** a new user with no data
**When** they view the dashboard
**Then** widgets show contextual empty states with first-action prompts

---

## Epic 14: Mobile Polish — Settings, Push & QR

Mobile-specific features: settings API connection, Expo EAS push notifications, QR code scanning, and auth flow completion.

### Story 14.1: Settings & Preferences (Mobile)

As a **mobile user**,
I want to manage my preferences from the settings screen,
So that I can customize notifications, privacy, and appearance.

**Acceptance Criteria:**

**Given** an authenticated mobile user
**When** they navigate to settings
**Then** their current preferences are loaded from `/api/v1/settings`

**Given** an authenticated mobile user
**When** they toggle notification or privacy settings
**Then** changes are persisted via PATCH `/api/v1/settings`

**Given** the existing settings screen UI
**When** implementing this story
**Then** connect the TODO handlers in `settings/index.tsx` to real API calls

### Story 14.2: Push Notifications — Expo EAS

As a **mobile user**,
I want to receive push notifications for journal reminders, friend activity, messages, and badges,
So that I stay engaged without opening the app.

**Acceptance Criteria:**

**Given** a mobile user with push notifications enabled
**When** a domain event triggers a notification (message received, badge earned, friend request)
**Then** an Expo push notification is delivered to their device

**Given** a mobile user
**When** they first open the app
**Then** they are prompted for notification permissions via expo-notifications

**Given** the Expo EAS configuration
**When** implementing this story
**Then** register push tokens via API, create IPushNotificationProvider implementation for Expo EAS

### Story 14.3: Friend QR Scanning & Deep Links

As a **mobile user**,
I want to scan a friend's QR code to add them instantly,
So that connecting with friends is frictionless.

**Acceptance Criteria:**

**Given** a mobile user
**When** they open the QR scanner (expo-camera)
**Then** scanning a valid friend QR code sends a friend request via API

**Given** a user who receives a friend invite link
**When** they tap the link on their phone
**Then** they are deep-linked to the app with the friend code pre-filled

**Given** a mobile user on the add friend screen
**When** they enter a friend code manually
**Then** a friend request is sent via `/api/v1/friends`

### Story 14.4: Auth Polish — Forgot & Reset Password

As a **mobile user**,
I want to reset my password from my phone,
So that I can recover my account without a computer.

**Acceptance Criteria:**

**Given** a mobile user on the login screen
**When** they tap "Forgot password" and enter their email
**Then** a reset code is sent via the existing `/api/v1/auth/forgot-password` endpoint

**Given** a mobile user with a reset code
**When** they enter the code and a new password
**Then** the password is reset via the existing API and they are redirected to login

---

## Epic 15: Technical Debt & Production Readiness

Cross-platform technical debt accumulated over 9 web epics. Prepares codebase for production deployment.

### Story 15.1: Database Push & Production Deployment

As a **developer**,
I want to push all accumulated database migrations and deploy to production,
So that the app is accessible to real users.

**Acceptance Criteria:**

**Given** 9 epics of database migrations generated but never pushed
**When** the developer runs db:push against the production database
**Then** all schema changes are applied and the production database matches the local schema

**Given** the Next.js web app and Expo mobile app
**When** deployed to Vercel and Expo EAS respectively
**Then** both apps are accessible and functional with the production database

### Story 15.2: DeleteAccountUseCase & Account Cascade

As a **user**,
I want to permanently delete my account and all associated data,
So that my data is fully removed per GDPR requirements (FR9, NFR12).

**Acceptance Criteria:**

**Given** an authenticated user
**When** they confirm account deletion
**Then** all user data is cascade-deleted: posts, moods, boards, gallery photos, moodboards, friends, notifications, preferences, rewards

**Given** the deletion cascade
**When** executed
**Then** R2 storage objects (photos, uploads) are also cleaned up

**Given** the settings page (web + mobile)
**When** the delete account button is clicked
**Then** it calls the real DeleteAccountUseCase instead of signing out

### Story 15.3: OG Images & Visual Assets

As a **visitor**,
I want to see proper preview images when HomeCafe links are shared on social media,
So that the app looks professional and trustworthy.

**Acceptance Criteria:**

**Given** the landing page URL shared on social media
**When** the platform fetches OG metadata
**Then** `/og-landing.png` exists and renders a 1200x630 branded preview image

**Given** the app
**When** deployed
**Then** favicon, app icons (iOS/Android), and splash screen assets are present

### Story 15.4: i18n Wiring

As a **user** who selected a language preference,
I want the app UI to display in my chosen language,
So that the interface matches my preference.

**Acceptance Criteria:**

**Given** a user with language preference set to "en" or "fr"
**When** they use the web app
**Then** UI text is displayed in their chosen language via next-intl

**Given** a user with language preference on mobile
**When** they use the Expo app
**Then** UI text respects the language preference via React Native Intl
