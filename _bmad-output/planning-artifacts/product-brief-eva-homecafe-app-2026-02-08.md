---
stepsCompleted: [1, 2, 3, 4, 5, 6]
status: complete
inputDocuments:
  - .claude/screenshots/Mobile.png
  - .claude/screenshots/Desktop.png
  - .claude/screenshots/Tablet.png
  - CLAUDE.md (Figma links)
date: 2026-02-08
author: Axel
---

# Product Brief: eva-homecafe-app

## Executive Summary

HomeCafé is a personal life-tracking and journaling app designed for Gen Z (15-35). It provides a cozy, café-inspired digital space where users can journal, track their mood, organize tasks, share selectively with friends, and collect stickers — all with zero barrier to entry. Sign up and everything is already there. Simple, functional, beautiful.

---

## Core Vision

### Problem Statement

Existing life-tracking and journaling tools suffer from overwhelming complexity. Apps like Notion require steep learning curves. Dedicated journaling apps feel cold and limited. Task managers are purely functional. No single app offers a simple, integrated, and emotionally engaging space for everyday life tracking.

### Problem Impact

Gen Z users abandon complex tools quickly. They want to journal, track moods, and organize their lives but give up when the setup takes longer than the actual use. The result: scattered notes across apps, abandoned habit trackers, and no consistent personal space.

### Why Existing Solutions Fall Short

- **Too complex**: High barrier to entry, too many features to configure
- **Too fragmented**: Journaling in one app, tasks in another, mood tracking in a third
- **Too cold**: No personality, no warmth, no reason to come back daily
- **No social layer**: Life tracking is isolated when it could be lightly social

### Proposed Solution

HomeCafé is a cozy digital café where everything is ready from day one. Users sign up and immediately access: journaling, mood tracking, task boards (kanban), a photo gallery, moodboards, and a social feed with privacy controls (public/private posts). A mini gamification layer with collectible stickers keeps daily engagement playful.

### Key Differentiators

- **Zero friction**: No setup, no configuration — everything works instantly at sign-up
- **Cozy café aesthetic**: A warm, inviting universe that makes users want to come back
- **All-in-one simplicity**: Journal + mood + tasks + social + gallery in one cohesive space
- **Selective social**: Share with friends or keep private — user controls visibility per post
- **Mini gamification**: Collectible stickers and rewards that encourage daily use without pressure

---

## Target Users

### Primary Users

**Persona: Léa, 22 — Student**
- Studies design, busy schedule between classes, projects, and social life
- Wants a single place to journal her thoughts, track her mood, and plan her week
- Currently uses Notes app + random to-do lists that get lost
- Opens HomeCafé every morning: plans her day, writes a quick journal entry, checks friends' posts
- Gets motivated by earning stickers when she journals 7 days in a row
- Shares moodboard posts with close friends, keeps her journal private

**Persona: Théo, 27 — Young Professional**
- Junior developer, lives alone, wants to stay organized without overcomplicating things
- Uses the kanban board for personal projects and weekly tasks
- Journals in the evening to decompress after work
- Enjoys the gallery feature to save inspiring photos from his day
- Shares occasional posts with his friend group, reacts to their updates

### Secondary Users

Same user base — friends are full users too. Everyone is both a creator and a consumer. No admin, no spectator-only role. The social layer is peer-to-peer between active users.

### User Journey

1. **Discovery**: Word of mouth, social media, App Store browsing
2. **Onboarding**: Sign up → everything is immediately available. No setup wizard, no configuration. The café is open.
3. **Core Usage**: Daily routine — journal, mood check-in, task planning, browse friends' posts
4. **Success Moment**: First badge earned after consistent use. Feeling of "this is my space."
5. **Long-term**: HomeCafé becomes the daily ritual — the cozy digital café they open every morning with their coffee

---

## Success Metrics

The digital equivalent of a paper journal — if users open it daily and it feels effortless, we've won.

**User Success Metrics:**
- Daily active usage: Users open HomeCafé at least 5 days/week
- Journal consistency: Users write at least 3 journal entries per week
- Task completion: Users create and complete tasks regularly via kanban
- Social engagement: Users share at least 1 post per week with friends
- Badge collection: Users earn their first badge within the first week

**Retention Indicators:**
- Day 1 retention: 60%+ (sign up → first journal entry same day)
- Day 7 retention: 40%+ (return within first week)
- Day 30 retention: 25%+ (still active after one month)

### Business Objectives

**MVP Phase (0-3 months):**
- Launch functional app on App Store / Play Store
- Acquire initial user base (even minimal — friends, early adopters)
- Validate core loop: sign up → journal/plan → come back tomorrow
- Zero paywall — fully free to maximize adoption

**Growth Phase (3-12 months):**
- Organic growth through word of mouth and social sharing
- Identify freemium features for future monetization
- Maintain high retention as user base grows

### Key Performance Indicators

| KPI | Target (3 months) | Measurement |
|---|---|---|
| Registered users | 100+ | Sign-up count |
| DAU/MAU ratio | >20% | Daily vs monthly active |
| Avg. journal entries/user/week | 3+ | In-app tracking |
| Day 7 retention | 40%+ | Cohort analysis |
| Avg. session duration | 5+ min | Analytics |
| Friend connections/user | 2+ | Social graph |

---

## MVP Scope

### Core Features

**Authentication & Account**
- Sign up / Sign in (email + password)
- Forgot password flow (email code → reset)
- User profile & account settings
- Public profile (viewable by friends)
- Friend code system (add friends via unique code)

**Dashboard**
- Landing page (connected/non-connected states)
- Dashboard with widgets: mood summary, recent posts, task overview
- Quick access to all features

**Journal**
- Write journal entries (rich text)
- Private by default
- Browse past entries by date

**Mood Tracker**
- Daily mood check-in with visual indicators
- Mood history with charts (bar/line graphs)
- Mood trends over time

**Posts & Social Feed**
- Create posts (text + images)
- Privacy controls: public (friends) or private per post
- Social feed with friends' public posts
- View individual post detail
- Reactions/interactions on posts

**Messaging**
- Direct messaging between friends
- New message composition
- Message list/inbox

**Gallery**
- Photo gallery with image upload
- Browse and organize photos

**Moodboard**
- Visual moodboard creation
- Pin images, colors, inspiration

**Organization (Kanban)**
- Kanban board for task management
- Create/edit/delete boards and cards
- Drag & drop task organization

**Stickers & Rewards**
- Collectible sticker system
- Badge/reward criteria (streak journaling, mood tracking consistency, etc.)
- Sticker gallery / collection view

**Push Notifications (Mobile)**
- Daily journaling reminders
- Friend activity notifications (new post, message received)
- Badge/reward earned notifications

**Contact**
- Contact page (connected/non-connected states)

### Platforms

- **Mobile**: Expo (React Native) — iOS & Android
- **Web**: Next.js — Desktop & Tablet responsive

### Out of Scope for MVP

- Payment / monetization / paywall
- AI-powered mood insights or journaling prompts
- Group chats
- Data export
- Admin dashboard
- Discovery of strangers (social is friends-only via code)

### MVP Success Criteria

- All features functional end-to-end on both platforms
- Users can sign up, journal, track mood, create posts, message friends, organize tasks, and collect stickers
- Push notifications working on mobile for key events
- Public profiles viewable by friends
- Zero-friction onboarding: sign up → immediate access to all features
- UI matches Figma designs across mobile, tablet, and desktop breakpoints

### Future Vision

- Freemium model with premium stickers, advanced analytics, custom themes
- AI-powered mood insights and journaling prompts
- Expanded social features (communities, shared moodboards)
- Data export and backup
- Widget support (iOS/Android home screen widgets)
