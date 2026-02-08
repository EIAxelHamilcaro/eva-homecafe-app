---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-05-domain-skipped
  - step-06-innovation-skipped
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
status: complete
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-eva-homecafe-app-2026-02-08.md
  - .claude/screenshots/Mobile.png
  - .claude/screenshots/Desktop.png
  - .claude/screenshots/Tablet.png
  - CLAUDE.md (Figma links)
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 0
  screenshots: 3
classification:
  projectType: mobile_app + web_app
  domain: general (lifestyle/personal productivity)
  complexity: low
  projectContext: brownfield
workflowType: 'prd'
---

# Product Requirements Document - HomeCafé

**Author:** Axel
**Date:** 2026-02-08
**Project:** eva-homecafe-app
**Status:** Concept validation

## Executive Summary

HomeCafé is a cozy, all-in-one life-tracking app for Gen Z (15-35). Users sign up and immediately access journaling, mood tracking, task management (kanban), a photo gallery, moodboards, social feed, messaging, and collectible stickers — zero configuration, zero onboarding wizard. The café is open from day one.

**Problem:** Existing tools are too complex (Notion), too fragmented (one app per function), too cold (no personality), or lack a social layer.

**Solution:** A warm, café-inspired digital space combining journal + mood + tasks + social + gallery in one cohesive, zero-friction experience. Mini gamification with collectible stickers keeps engagement playful.

**Differentiator:** Zero friction + cozy aesthetic + all-in-one simplicity + selective social (friends-only via code) + gamification without pressure.

**Platforms:** Expo (React Native) for iOS & Android, Next.js for web (desktop & tablet).

**Stack:** Next.js 16, TypeScript, Drizzle, PostgreSQL, BetterAuth, shadcn/ui, Tailwind 4, Cloudflare R2, SSE. Clean Architecture + DDD with ddd-kit primitives.

**Context:** Brownfield project — auth, dashboard, and social screen already implemented. Golden stack boilerplate with DDD primitives in place.

## Success Criteria

### User Success

- Zero-friction onboarding: sign up → all features immediately available
- Daily ritual established within first week: journal, mood check-in, task planning, social feed
- First badge earned within 7 days
- Day 1 retention: 60%+ | Day 7: 40%+ | Day 30: 25%+
- 3+ journal entries/week, 1+ social post/week, regular kanban usage

### Business Success

- 100+ registered users at 3 months (friends, early adopters, word of mouth)
- DAU/MAU ratio >20%
- Average session duration 5+ minutes
- 2+ friend connections per user
- Zero paywall — fully free for concept validation

### Technical Success

- Code matches Axel's golden stack patterns — readable and modifiable by the author
- No over-engineering: no Redis, no queues, no external services beyond PostgreSQL + BetterAuth + R2
- Codebase stays small, readable, maintainable by one person
- UI pixel-perfect match with Figma designs across mobile, tablet, and desktop

### Measurable Outcomes

| Metric | Target | Measurement |
|---|---|---|
| Feature completeness | 100% of brief | All features functional end-to-end |
| UI fidelity | 100% Figma match | Visual audit against screenshots |
| Code style | Matches boilerplate | Code review by Axel |
| Platform parity | Mobile + Web | Both platforms cover all features |
| Onboarding friction | Zero | Sign up → everything available |

## Product Scope

### MVP (Phase 1) — Everything

Experience MVP: complete product from day one. No missing features, no "coming soon."

- Auth: sign up/in/out, forgot password, profile, settings, account deletion
- Friend system: friend codes, QR codes, friend list, invite share
- Posts: create with rich text + images, private/public toggle
- Journal: filtered view of private posts, browse by date, streak counter
- Social feed: friends' public posts, reactions
- Mood tracker: 9 predefined moods, intensity slider, weekly/6-month charts
- Organization: to-do lists, kanban boards, timeline/chronology (3 views)
- Messaging: DM between friends, inbox, compose, SSE real-time
- Gallery: photo upload/browse on R2
- Moodboard: visual boards, pin images/colors
- Stickers & badges: collections, earning criteria, streak rewards
- Dashboard: 8 widgets (mood, posts, tasks, gallery, messages, calendar, journal compose, moodboard)
- Push notifications: Expo EAS (reminders, activity, badges)
- Contact page, landing page (SEO), FAQ
- 100% Figma fidelity across mobile, tablet, desktop

**Resource:** Solo developer with golden stack boilerplate. Auth complete, database ready.

### Out of Scope for MVP

- Payment / monetization / paywall
- AI-powered mood insights or journaling prompts
- Group chats
- Data export
- Admin dashboard
- Discovery of strangers (social is friends-only via code)

### Phase 2 — Growth

- Freemium model (premium stickers, custom themes)
- Advanced mood analytics
- Data export and backup

### Phase 3 — Expansion

- AI-powered mood insights and journaling prompts
- Communities and shared moodboards
- Home screen widgets (iOS/Android)

### Risk Mitigation

- **Technical:** Low risk — golden stack proven, SSE started, R2 is standard S3-compatible. Main risk: volume of screens.
- **Market:** Free app, friends as early adopters, measure daily return rate.
- **Resource:** Independent feature modules — can ship incrementally.

## User Journeys

### Journey 1: Léa — Le rituel du matin

Léa, 22, design student in Lyon. She wakes up, grabs her coffee, opens HomeCafé — her ritual. Dashboard shows mood tracker (3 green days, 1 orange), today's kanban tasks, friends' latest posts.

Mood check-in: good day, one tap. Writes a quick private post (journal). Scrolls the feed, reacts to Marie's cat photo with a sticker. Opens "Semester 2" kanban, drags "UX project" to Done, adds "Prepare Thursday oral." Checks stickers: unlocked "7-day streak" badge. Smiles.

**Capabilities:** Dashboard widgets · 1-tap mood · Private/public posts · Social feed · Reactions · Kanban drag & drop · Badge streaks

### Journey 2: Théo — L'introspectif du soir

Théo, 27, junior developer in Bordeaux. Opens HomeCafé on laptop (Next.js web). Goes to journal — filtered private posts. Writes about his day. Uploads sunset photo to gallery, pins it to "Inspirations 2026" moodboard. Checks mood tracker: trending up this week.

Opens feed, DMs Lucas about his post. Gets notification: someone reacted to yesterday's post. Earned "Mood Tracker 30 days" sticker.

**Capabilities:** Desktop web parity · Journal = private posts · Gallery upload · Moodboard · Mood history charts · DM messaging · Notifications

### Journey 3: Marie — La nouvelle arrivante

Marie, 20, Léa's friend. Receives friend code via SMS. Signs up: email, password, done. Everything available immediately — Léa already in friends list. Dashboard widgets empty but inviting.

First mood check-in. First post — hesitates, sets public. Léa reacts immediately. Creates "Weekly Groceries" kanban. Discovers stickers page. Hooked. Next day: generates her own friend code, sends to 3 friends.

**Capabilities:** Friend code sign-up · Auto-friend · Zero onboarding · Empty states · Virality via friend codes

### Journey 4: Lucas — Le lurker social

Lucas, 25, Théo's friend. Scrolls feed 2-3x/day, reacts, sends DMs, rarely posts. Mood tracker by habit (1 tap/day). Empty kanban.

Notification: "Mood Tracker 14 Days sticker!" Checks collection — already 5 stickers from mood check-ins alone. Starts posting more.

**Capabilities:** Passive usage value · 1-tap retention hook · Gamification drives engagement · Push notifications re-engage

### Journey → Capability Traceability

| Capability | Journeys | Priority |
|---|---|---|
| Dashboard hub with widgets | Léa, Marie | Core |
| Post creation (private/public) | Léa, Théo, Marie | Core |
| Journal = private posts view | Théo, Léa | Core |
| Social feed | Léa, Lucas, Marie | Core |
| Reactions on posts | Léa, Lucas | Core |
| Mood tracker (1-tap + history) | Léa, Théo, Lucas | Core |
| Organization (todo/kanban/timeline) | Léa, Théo, Marie | Core |
| Friend code / QR code | Marie, Lucas | Core |
| DM messaging (SSE) | Théo, Lucas | Core |
| Gallery | Théo | Core |
| Moodboard | Théo | Core |
| Stickers & badges | Léa, Lucas | Core |
| Push notifications | Lucas, Léa | Core |
| Empty states | Marie | Core |
| Web desktop experience | Théo | Core |
| Public profile | All | Core |

## Technical Architecture

### Cross-Platform Strategy

- Mobile: Expo (React Native) — iOS & Android from single codebase
- Web: Next.js App Router — SSR/CSR hybrid
- Backend: Next.js API routes + PostgreSQL + BetterAuth + Clean Architecture/DDD
- Both clients consume the same API

### Real-Time Communication

- SSE (Server-Sent Events) for messaging and feed updates
- Polling fallback where SSE is not practical
- No WebSocket complexity

### File Storage

- Cloudflare R2 (S3-compatible) for all uploads (post images, gallery, moodboard, avatars)
- Presigned URLs for authenticated direct upload

### Platform Requirements

**Mobile (Expo):**
- iOS App Store + Google Play
- Camera (photo capture/upload), QR code scanner
- Push notifications: Expo Notifications (EAS)
- Online-only (no offline mode at MVP)
- Minimum iOS 15 / Android 10
- Store compliance: content rating (4+/Everyone), privacy policy URL, app review guidelines adherence

**Web (Next.js):**
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Responsive: desktop + tablet layouts per Figma
- SEO on public landing page only
- WCAG 2.1 Level A accessibility

### Push Notification Strategy

- Expo Notifications (EAS)
- Types: journal reminder, friend activity, new message, badge earned
- User-configurable toggles per notification type

### Implementation Constraints

- No Redis, no message queues — PostgreSQL handles everything
- SSE via Next.js API routes
- R2 via S3-compatible SDK
- Client-side image optimization before upload
- Friend code: unique alphanumeric string in DB
- QR code: generated client-side from friend code

## Functional Requirements

### Authentication & Account

- FR1: Users can sign up with email and password
- FR2: Users can sign in with email and password
- FR3: Users can sign out
- FR4: Users can request a password reset via email code
- FR5: Users can reset their password with a valid code
- FR6: Users can view and edit their profile (name, first name, date of birth, email, profession, phone)
- FR7: Users can view and edit their address (street, postal code, city, country)
- FR8: Users can set preferences (language, time format, profile visibility toggle)
- FR9: Users can delete their account

### Friend System

- FR10: Users can generate a unique friend code
- FR11: Users can generate a QR code from their friend code
- FR12: Users can add a friend by entering a friend code
- FR13: Users can add a friend by scanning a QR code
- FR14: Users who sign up via a friend code are automatically connected to the code owner
- FR15: Users can view their friends list
- FR16: Users can view a friend's public profile
- FR17: Users can invite friends via a share action

### Posts & Journal

- FR18: Users can create a post with rich text content (bold, italic, underline)
- FR19: Users can attach images to a post
- FR20: Users can set a post as private (journal) or public (visible to friends)
- FR21: Users can view their journal (filtered list of private posts, grouped by date)
- FR22: Users can browse journal entries by date
- FR23: Users can see their journal streak counter (day count)
- FR24: Users can view a single post detail
- FR25: Users can edit their own posts
- FR26: Users can delete their own posts

### Social Feed

- FR27: Users can browse a feed of friends' public posts
- FR28: Users can react to a post
- FR29: Users can view reactions on a post

### Mood Tracker

- FR30: Users can record a daily mood from 9 predefined categories (Calme, Énervement, Excitation, Anxiété, Tristesse, Bonheur, Ennui, Nervosité, Productivité)
- FR31: Users can set mood intensity via a slider
- FR32: Users can view mood check-ins per day of the week
- FR33: Users can view mood history as a weekly bar chart
- FR34: Users can view mood trends over a 6-month period
- FR35: Users can view a mood legend explaining each category

### Organization

- FR36: Users can switch between three views: To-do list, Kanban board, Timeline/Chronology
- FR37: Users can create, edit, and delete to-do lists with checkable items
- FR38: Users can create kanban boards with columns
- FR39: Users can create kanban cards with title, description, progress percentage, and due date
- FR40: Users can move kanban cards between columns via drag & drop
- FR41: Users can reorder kanban cards within a column
- FR42: Users can view a chronology/timeline with calendar and colored events

### Messaging

- FR43: Users can send a direct message to a friend
- FR44: Users can view their message inbox (conversation list)
- FR45: Users can view a conversation thread with a friend
- FR46: Users receive messages in near real-time (under 2 seconds)
- FR47: Users can compose a new message (with friend selection popup)

### Gallery

- FR48: Users can upload photos to their gallery
- FR49: Users can browse their gallery
- FR50: Users can delete photos from their gallery

### Moodboard

- FR51: Users can create moodboards
- FR52: Users can pin images and colors to a moodboard
- FR53: Users can browse and manage their moodboards
- FR54: Users can delete moodboard items and moodboards

### Stickers & Rewards

- FR55: Users can view their sticker collection
- FR56: Users can view their badge/reward collection
- FR57: Users earn stickers and badges automatically based on activity criteria (streaks, milestones)
- FR58: Users receive notification when a new sticker or badge is earned
- FR59: Users can browse all available stickers with earning criteria
- FR60: Users can browse all available badges with earning criteria

### Dashboard

- FR61: Dashboard displays mood summary widget (weekly chart + trend)
- FR62: Dashboard displays recent posts widget
- FR63: Dashboard displays task overview widget (to-do list quick view)
- FR64: Dashboard displays gallery preview widget
- FR65: Dashboard displays messaging preview widget (recent messages)
- FR66: Dashboard displays calendar widget (month view)
- FR67: Dashboard displays journal quick-compose widget
- FR68: Dashboard displays moodboard preview widget
- FR69: Dashboard displays empty states with contextual first-action prompts for new users

### Notifications

- FR70: Users receive push notifications for daily journal reminders (mobile)
- FR71: Users receive push notifications for friend activity (new post, reaction)
- FR72: Users receive push notifications for new messages
- FR73: Users receive push notifications for badges earned
- FR74: Users can configure which notification types are enabled

### Settings

- FR75: Users can access a settings/preferences screen
- FR76: Users can configure notification preferences from settings

### Contact

- FR77: Users can access a contact page (connected/non-connected states)

### Landing Page (Web)

- FR78: Visitors can view a public landing page with hero section, feature highlights, and CTA
- FR79: Visitors can view user testimonials on the landing page
- FR80: Visitors can browse a FAQ section on the landing page
- FR81: Visitors can discover HomeCafé via search engines (meta tags, Open Graph data, semantic HTML, Lighthouse SEO score 90+)

## UI Screen Inventory (Figma Source of Truth)

**Mobile (27 screens):**

| # | Screen | Key Components |
|---|---|---|
| 1 | Landing page non connecté | Hero, features, testimonials, FAQ, footer |
| 2 | Landing page connecté | Dashboard with 8 widgets |
| 3 | Inscription | Email/password sign-up form |
| 4 | Connexion | Email/password sign-in form |
| 5 | Mot de passe oublié | Email input for reset |
| 6 | Mot de passe oublié (code) | Verification code input |
| 7 | Mot de passe oublié (nouveau) | New password form |
| 8 | Mot de passe oublié (confirmé) | Success confirmation |
| 9 | Journal | Posts by date, streak counter, gallery preview, badges |
| 10 | Moodboard | Mood legend, daily check-in, slider, weekly/6-month charts |
| 11 | Organisation | To-do list, kanban, chronology (3 tab views) |
| 12 | Mon compte | Profile, address, preferences, badges, friend code/QR, delete |
| 13 | Récompenses > tout | Full badge collection grid |
| 14 | Stickers > tout | Full sticker collection grid |
| 15 | Réglages | Settings/preferences |
| 16 | Contact (connecté) | Contact form (authenticated) |
| 17 | Contact (non connecté) | Contact form (public) |
| 18 | Organisation - Nouveau kanban | Kanban board creation |
| 19 | Social | Friends feed with posts |
| 20 | Galerie | Photo grid |
| 21 | Messagerie | Conversation inbox |
| 22 | Messagerie - Nouveau message | Compose message |
| 23 | Messagerie - Nouveau message (popup) | Friend selector overlay |
| 24 | Mood tracker - full | Complete mood tracking view |
| 25 | Ajouter un post | Rich text compose (B/I/U) with image attach |
| 26 | Posts | Post list view |
| 27 | Post seul | Single post detail |

**Reusable component:** Card code amis (friend code + QR code card)

**Desktop & Tablet:** Same screens with responsive layouts per Figma designs.

## Non-Functional Requirements

### Performance

- Page load under 3 seconds on 4G mobile
- Dashboard widgets render within 1 second
- Real-time message delivery under 2 seconds
- Image upload completes within 5 seconds (files up to 10MB)
- Mood check-in response < 500ms
- Kanban drag & drop smooth at 60fps

### Security

- HTTPS/TLS for all data in transit
- Passwords securely hashed with industry-standard algorithm
- Secure session management with configurable expiry
- File uploads via authenticated, time-limited URLs only
- Data isolation: users access own data + friends' public posts only
- Account deletion permanently removes all user data
- GDPR-aware: user can request data deletion

### Reliability

- 99% uptime (standard hosting SLA)
- Real-time connection auto-reconnects on network interruption
- Failed uploads: clear error + retry option
- Daily automated database backups

### Compatibility

- Mobile: iOS 15+ / Android 10+
- Web: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Responsive: mobile-first, tablet + desktop per Figma
- Mobile framework compatible with target OS versions

### UX Quality

- Pixel-perfect Figma match across all breakpoints
- Loading states and error feedback on all interactive elements
- Empty states display contextual first-action prompts
- Consistent navigation (bottom tab bar mobile, sidebar desktop)
- Animations complete within 300ms with easing curves
