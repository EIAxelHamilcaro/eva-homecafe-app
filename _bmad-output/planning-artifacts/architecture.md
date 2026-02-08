---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2026-02-08'
lastStep: 8
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-eva-homecafe-app-2026-02-08.md
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/prd-validation-report.md
  - CLAUDE.md
workflowType: 'architecture'
project_name: 'eva-homecafe-app'
user_name: 'Axel'
date: '2026-02-08'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
81 FRs across 16 capability areas. 5 areas fully implemented (auth, chat, friend, notification, profile), 11 areas to build (posts, journal, social feed, mood tracker, organization, gallery, moodboard, stickers/badges, dashboard widgets, settings, landing/contact pages).

The implemented modules establish the golden patterns: Aggregate → Use Case → Controller → API Route with DI, Result/Option monads, and BDD tests. New modules follow the same structure.

**Non-Functional Requirements:**
- Performance: Page load <3s (4G), widget render <1s, mood check-in <500ms, real-time messaging <2s, drag & drop 60fps, upload <5s (10MB)
- Security: HTTPS, hashed passwords, session management, presigned URLs for uploads, data isolation (own data + friends' public), GDPR account deletion
- Reliability: 99% uptime, SSE auto-reconnect, upload retry, daily DB backups
- Compatibility: iOS 15+/Android 10+, latest 2 browser versions, responsive mobile/tablet/desktop
- UX Quality: 100% Figma fidelity, loading states, empty states with first-action prompts, 300ms animations

**Scale & Complexity:**

- Primary domain: Full-stack cross-platform (Next.js API + SSR + Expo React Native)
- Complexity level: Medium — high screen count (27 mobile + desktop + tablet) but repetitive patterns, single-tenant, no regulatory compliance
- Estimated architectural components: ~11 new domain aggregates, ~35 new use cases, ~15 new API route groups, ~6 new DB schema files

### Technical Constraints & Dependencies

- PostgreSQL only — no Redis, no message queues, no external services beyond BetterAuth + R2
- SSE for real-time (no WebSockets)
- Cloudflare R2 (S3-compatible) for all file storage
- Client-side image optimization before upload
- Expo EAS for push notifications (mobile only)
- Friend codes as unique alphanumeric strings, QR codes generated client-side
- Solo developer — codebase must stay small, readable, maintainable
- Clean Architecture + DDD with ddd-kit primitives (Result, Option, Entity, Aggregate, ValueObject)
- No index.ts barrels, no comments, minimal getters, Zod for VO validation

### Cross-Cutting Concerns Identified

- **Authentication & Authorization**: requireAuth() guard on all protected routes; friend-based access control for social features
- **File Upload Pipeline**: Presigned R2 URLs used across posts, gallery, moodboard, chat, avatars — needs shared upload infrastructure
- **Real-Time Events**: SSE established for chat; potential extension to social feed updates, notification delivery, mood feed
- **Gamification Engine**: Stickers & badges earned from activity across ALL modules (journal streaks, mood consistency, post count, friend connections) — cross-cutting event listener pattern
- **Pagination**: BaseRepository pattern with PaginatedResult already in place; applies to feeds, galleries, message lists, sticker collections
- **Empty States**: Every feature needs contextual first-action prompts for new users (FR69)
- **Cross-Platform API Contract**: Single API consumed by both Next.js web and Expo mobile — API design must serve both clients
- **Domain Events**: Events dispatched after persistence; gamification and notification handlers react to events from all modules

## Starter Template Evaluation

### Primary Technology Domain

Full-stack cross-platform monorepo — brownfield project with established golden stack.

### Starter: Custom Monorepo Boilerplate (Already Established)

**Rationale:** No starter evaluation needed. This is a brownfield project with a proven, custom-built monorepo boilerplate. The stack is locked, patterns are established through 5 fully implemented modules, and all architectural decisions are already validated in production code.

### Monorepo Structure (Turborepo + pnpm)

| Package | Purpose |
|---|---|
| `apps/nextjs/` | Web app + API (Next.js 16, React 19) |
| `apps/expo/` | Mobile app (Expo 54, React Native 0.81) |
| `packages/ddd-kit/` | DDD primitives (Result, Option, Entity, Aggregate, ValueObject) |
| `packages/drizzle/` | Database schema + services (PostgreSQL) |
| `packages/ui/` | Shared UI components (shadcn/ui) |
| `packages/test/` | Shared test configuration (Vitest) |
| `packages/typescript-config/` | Shared TS config |

### Architectural Decisions Established by Stack

**Language & Runtime:**
- TypeScript 5.9 (strict), Node >=24.12
- Path aliases: @/domain/*, @/application/*, @/adapters/*, @/common/*

**Frameworks:**
- Next.js 16 (App Router, Turbopack dev, SSR/CSR hybrid)
- Expo 54 (React Native 0.81, expo-router 6)
- React 19 (shared across web + mobile)

**Styling:**
- Web: Tailwind CSS 4 + shadcn/ui + Framer Motion
- Mobile: NativeWind (Tailwind 3) + React Native Reanimated 4 + Skia

**State & Data:**
- React Hook Form + @hookform/resolvers (Zod)
- TanStack React Query (mobile API calls)
- nuqs (URL state management, web)
- next-intl (i18n, web)

**Database & ORM:**
- PostgreSQL via Drizzle ORM
- Schema in packages/drizzle/src/schema/

**Authentication:**
- BetterAuth 1.4

**File Storage:**
- Cloudflare R2 (presigned URLs)

**Real-Time:**
- SSE (react-native-sse on mobile, native EventSource on web)

**Testing:**
- Vitest (shared base config in packages/test/)
- BDD style, mock at repository level

**Quality:**
- Biome 2.3 (lint + format)
- jscpd (duplication check)
- knip (unused code detection)
- Husky (pre-commit hooks)

**Mobile-Specific:**
- expo-camera, expo-image-picker (photo capture)
- react-native-qrcode-svg (QR generation)
- react-native-draggable-flatlist (drag & drop)
- react-native-calendars (calendar views)
- victory-native (charts)
- EAS Build (preview + production profiles)

**Architecture Patterns:**
- Clean Architecture (Domain → Application → Adapters → Infrastructure)
- DDD with custom ddd-kit (Result, Option, Aggregate, Entity, ValueObject, UUID)
- CQRS (Commands via Use Cases, Queries via direct ORM)
- DI via @evyweb/ioctopus
- Domain Events (added in aggregates, dispatched after persistence)

**Note:** No starter initialization needed — project is established.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
All critical decisions resolved — stack locked, domain modeling decided, deployment target chosen.

**Important Decisions (Shape Architecture):**
All important decisions resolved — SSE scope, upload strategy, widget loading, push notification pattern.

**Deferred Decisions (Post-MVP):**
- PostgreSQL provider selection for Vercel deployment (Neon/Supabase/Railway)
- CDN/edge caching strategy
- Analytics platform selection
- Freemium model infrastructure (Phase 2)

### Data Architecture

**Post & Journal — Single Aggregate with Visibility Flag**
- Decision: One `Post` aggregate with `isPrivate: boolean`
- Journal = query filter on private posts (FR21: "filtered list of private posts")
- Rationale: PRD explicitly defines journal as a view on private posts. No need for separate aggregate. DRY, simple, matches product intent.
- Affects: Post domain, journal queries, social feed queries, dashboard widgets

**Organization — Unified Board Model with Dynamic Views**
- Decision: Single `Board` aggregate with `Column` and `Card` entities
- Todo = board with single column of checkable items
- Kanban = board with multiple columns, drag & drop between columns
- Chronology/Calendar = chronological view on cards with `dueDate`
- Users can add todos, boards, kanban views, chronology and calendar events dynamically
- Rationale: Three views on one data model. Avoids duplication, matches the PRD's "switch between three views" (FR36).
- Affects: Organization domain, dashboard task widget, board queries

**Gamification — Event-Driven Achievement Engine**
- Decision: Domain event listeners evaluate achievement criteria reactively
- Handlers subscribe to events: PostCreated, MoodRecorded, FriendRequestAccepted, streak calculations, etc.
- When criteria met → create Sticker/Badge aggregate → dispatch BadgeEarned event → trigger notification
- Rationale: Leverages existing domain events pattern. Decoupled, extensible, no polling.
- Affects: All modules (events flow to gamification), sticker/badge domain, notification handlers

### Authentication & Security

**All decisions established by brownfield stack:**
- Authentication: BetterAuth 1.4 (session-based, cookies)
- Authorization: requireAuth() guard pattern + friend-based access control
- Data isolation: Users access own data + friends' public posts only
- File security: Presigned R2 URLs with time-limited access
- GDPR: Account deletion removes all user data

### API & Communication Patterns

**SSE Scope — Chat Only**
- Decision: SSE remains exclusively for chat messaging (latency-critical <2s)
- Social feed and notifications use standard request/response with pull-to-refresh
- Rationale: Real-time is only critical for DM conversations. Feed and notifications tolerate refresh-based updates. Simpler infrastructure for solo dev.
- Affects: Chat module (existing), no SSE extension needed for new modules

**File Upload — Shared Endpoint**
- Decision: Single `/api/v1/upload` endpoint with `context` parameter (post, gallery, moodboard, avatar)
- Generates presigned R2 URL with appropriate prefix per context
- Shared `IStorageProvider` port already exists
- Rationale: Upload is a cross-cutting concern. One endpoint, one use case, one infrastructure. DRY.
- Affects: Posts, gallery, moodboard, profile avatar — all use shared upload

**API Versioning — Established**
- Already using `/api/v1/` prefix. No change needed.

### Frontend Architecture

**Dashboard Widgets — Server Components with Suspense**
- Decision: Each dashboard widget is an independent async Server Component wrapped in `<Suspense fallback={<WidgetSkeleton />}>`
- Dashboard page composes 8 widgets, each resolves independently
- Progressive loading — fastest widgets appear first
- Rationale: Idiomatic Next.js App Router. Best Time-to-First-Content. No client-side waterfall.
- Affects: Dashboard page, all 8 widget components (FR61-68)

**API Client Strategy — Platform-Native, No Sharing**
- Decision: Web uses Server Actions + direct fetch (SSR). Mobile uses TanStack React Query + fetch with SecureStore token management.
- No shared `api-client` package
- Rationale: Each platform has fundamentally different data-fetching patterns. Web benefits from SSR/Server Components. Mobile needs React Query cache + offline token management. Forcing a shared client adds abstraction without value.
- Affects: All API consumption on both platforms

### Infrastructure & Deployment

**Hosting — Vercel + Expo EAS**
- Decision: Next.js deployed on Vercel. Mobile builds via Expo EAS (preview + production profiles).
- PostgreSQL provider: TBD (Neon, Supabase, or Railway)
- R2: Cloudflare (already decided)
- Rationale: Vercel is the native deployment target for Next.js. Expo EAS handles iOS/Android builds and OTA updates. Zero-ops for solo dev.
- Affects: CI/CD, environment configuration, database connection

**Push Notifications — Domain Event Handlers**
- Decision: Push notifications triggered by domain event handlers via `IPushNotificationProvider` port
- Same event handler pattern as gamification — events flow through, handlers decide whether to push
- Event types: new message → push, friend activity → push, badge earned → push, journal reminder → scheduled
- Rationale: Consistent with existing event-driven architecture. One pattern for all side effects (gamification + notifications + future concerns).
- Affects: Notification module, all event-emitting modules, Expo Notifications (EAS) integration

### Decision Impact Analysis

**Implementation Sequence:**
1. Shared upload endpoint (unblocks posts, gallery, moodboard)
2. Post aggregate + journal queries (core content creation)
3. Mood tracker aggregate (standalone, no dependencies)
4. Organization board aggregate (standalone)
5. Gallery + Moodboard (depend on upload)
6. Social feed queries (depends on posts)
7. Gamification engine (depends on events from all modules)
8. Stickers & badges domain (depends on gamification)
9. Dashboard widgets (depends on all module queries)
10. Push notifications (depends on gamification + Expo EAS setup)
11. Settings, contact, landing pages (independent, low priority)

**Cross-Component Dependencies:**
- Upload endpoint → Posts, Gallery, Moodboard all depend on it
- Post aggregate → Social feed and Journal both depend on it
- Domain events → Gamification and Push notifications consume events from ALL modules
- Gamification → Stickers/Badges depend on achievement evaluation
- All modules → Dashboard widgets query data from every module

## Implementation Patterns & Consistency Rules

### Pattern Source

All patterns extracted from existing brownfield codebase (5 implemented modules). These are NOT recommendations — they are established conventions that MUST be followed.

### Naming Patterns

**Database (Drizzle Schema):**
- Tables: singular snake_case → `conversation`, `message`, `profile`, `message_attachment`
- Columns: camelCase in Drizzle, snake_case in SQL → `createdBy` maps to `"created_by"`
- Foreign keys: `entityId` pattern → `userId`, `conversationId`, `senderId`
- Indexes: descriptive pattern → `profile_user_id_idx`
- IDs: text type, UUID strings → `id: text("id").primaryKey()`
- Timestamps: `createdAt`, `updatedAt`, `deletedAt` (soft delete) as `timestamp`

**API Endpoints:**
- Base: `/api/v1/{resource}`
- Resources: plural kebab-case → `/friends`, `/notifications`, `/chat/conversations`
- Actions: sub-paths → `/friends/requests/[id]/respond`, `/notifications/[id]/read`
- Params: `[paramName]` Next.js convention → `[conversationId]`, `[messageId]`
- Query params: camelCase → `?page=1&limit=20`

**Code Naming:**
- Files: kebab-case → `send-message.use-case.ts`, `message-content.vo.ts`
- Aggregates: PascalCase → `Notification`, `FriendRequest`, `Conversation`
- Use Cases: PascalCase + UseCase suffix → `SendMessageUseCase`, `GetConversationsUseCase`
- Controllers: camelCase + Controller suffix → `getConversationsController`
- DTOs: camelCase + Schema/Dto suffix → `sendMessageInputDtoSchema`, `ICreateConversationOutputDto`
- VOs: PascalCase → `NotificationType`, `MessageContent`, `FriendRequestStatus`
- Events: PascalCase + Event suffix → `NotificationCreatedEvent`, `MessageSentEvent`
- Ports: I + PascalCase + Repository/Provider/Service → `IConversationRepository`, `IStorageProvider`
- DI symbols: same as port names → `DI_SYMBOLS.IConversationRepository`

**File Suffixes Convention:**
- `.aggregate.ts` — Aggregates
- `.entity.ts` — Entities (non-root)
- `.vo.ts` — Value Objects
- `.event.ts` — Domain Events
- `.use-case.ts` — Use Cases
- `.dto.ts` — DTOs
- `.controller.ts` — Controllers
- `.port.ts` — Ports/Interfaces
- `.module.ts` — DI Modules
- `.test.ts` — Tests

### Structure Patterns

**Domain Layer — per aggregate folder:**
```
src/domain/{aggregate}/
├── {aggregate}.aggregate.ts
├── {aggregate}-id.ts
├── errors/{aggregate}.errors.ts (if needed)
├── events/{event-name}.event.ts
└── value-objects/{vo-name}.vo.ts
```

**Application Layer — per domain folder:**
```
src/application/
├── use-cases/{domain}/{name}.use-case.ts
├── use-cases/{domain}/__tests__/{name}.use-case.test.ts
├── dto/{domain}/{name}.dto.ts
├── dto/common.dto.ts
└── ports/{name}.port.ts (flat, not per-domain)
```

**Adapters Layer — by type, then domain:**
```
src/adapters/
├── controllers/{domain}/{name}.controller.ts
├── repositories/{domain}/{name}.repository.ts
├── mappers/{domain}/{name}.mapper.ts
├── queries/{domain}/{name}.query.ts
├── guards/require-auth.ts
└── services/{service-name}/{files}
```

**API Routes — mirror controller structure:**
```
app/api/v1/{domain}/
├── route.ts                    → imports from controller
├── [id]/route.ts               → imports from controller
└── [id]/{action}/route.ts      → imports from controller
```

**Pages — orchestration + _components:**
```
app/(protected)/{page}/
├── page.tsx                    → Server Component, composes _components
└── _components/
    └── {component-name}.tsx    → Client components with logic
```

### Format Patterns

**API Response Format:**
- Success: direct DTO response → `NextResponse.json(result.getValue())`
- Success with create: `NextResponse.json(data, { status: 201 })`
- Error: `{ error: string }` → `NextResponse.json({ error: "message" }, { status: code })`
- Status codes: 200 (ok), 201 (created), 400 (validation), 401 (unauth), 403 (forbidden), 404 (not found), 500 (server error)
- NO envelope wrapper — data is returned directly, errors use `{ error }` shape

**Pagination Response:**
```typescript
{
  data: T[],
  pagination: { page, limit, total, totalPages, hasNextPage, hasPreviousPage }
}
```

**Date Format:**
- Database: `timestamp` type (Drizzle handles serialization)
- API: ISO 8601 strings (automatic JSON serialization of Date objects)
- UI: localized via next-intl (web) or Intl (mobile)

**JSON Field Naming:**
- camelCase everywhere (TypeScript → JSON → client)

### Communication Patterns

**Domain Events:**
- Event naming: `{aggregate}.{past-tense-verb}` → `"notification.created"`, `"message.sent"`
- Event class naming: PascalCase → `NotificationCreatedEvent`
- Payload: includes all data handlers need (no lookups)
- Dispatch: AFTER successful persistence, NEVER before
- Aggregate adds events → use case dispatches after save → handlers react

**Controller Auth Pattern:**
```typescript
const session = await getAuthenticatedUser(request);
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

**Controller Flow Pattern:**
```
1. Authenticate (getAuthenticatedUser)
2. Parse & validate input (Zod schema.safeParse)
3. Get use case (getInjection)
4. Execute use case
5. Handle Result (isFailure → error response, isSuccess → data response)
```

**Use Case Flow Pattern:**
```
1. Validate & create VOs from input
2. Business logic (repository calls, domain operations)
3. Persist (repository.create/update)
4. Dispatch domain events (if any)
5. Return Result<OutputDto>
```

### Process Patterns

**Error Handling:**
- Domain/Application: NEVER throw → return `Result.fail(errorMessage)`
- Controllers: catch Result failures → map to appropriate HTTP status
- Error messages: string-based, checked via `.includes()` for status code mapping
- Client: display error message from `{ error }` response field

**Loading States (Web):**
- Server Components: `<Suspense fallback={<Skeleton />}>`
- Client Components: loading boolean from fetch/mutation state
- Skeleton components match final layout dimensions

**Validation:**
- Input validation: Zod schemas in DTOs, parsed in controllers via `.safeParse()`
- Domain validation: Value Objects validate in `protected validate()` method
- Business rules: Use Cases enforce via Result pattern

### Enforcement Guidelines

**All AI Agents MUST:**
1. Follow existing file naming suffixes exactly (`.aggregate.ts`, `.use-case.ts`, etc.)
2. Use the established controller auth + flow pattern verbatim
3. Return `Result<T>` from all use cases, never throw
4. Use `Option<T>` for nullable values, never null
5. Place tests in `__tests__/` subfolder within use-case domain folder
6. Register all new use cases and repositories in DI modules
7. Add domain events in aggregates, dispatch in use cases after persistence
8. Use Zod schemas for all DTO validation
9. Follow the singular snake_case table naming convention
10. Match the `{ error: string }` error response format exactly

**Pattern Verification:**
- `pnpm type-check` — catches structural type mismatches
- `pnpm check` — Biome catches naming/format violations
- `pnpm test` — BDD tests verify behavior
- `pnpm check:duplication` — catches copy-paste drift
- `pnpm check:unused` — catches dead code from refactors

**Anti-Patterns (NEVER do):**
- `throw new Error()` in domain or application layer
- `null` instead of `Option.none()`
- `any` type annotations
- index.ts barrel exports
- Comments explaining obvious code
- Custom getters beyond `get id()`
- Importing from adapters in domain layer
- Envelope wrappers like `{ success: true, data: ... }`

## Project Structure & Boundaries

### Complete Project Directory Structure

Existing files marked with (existing), new files to create marked with (new).

```
eva-homecafe-app/
├── apps/
│   ├── nextjs/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── auth/[...all]/route.ts                  (existing)
│   │   │   │   └── v1/
│   │   │   │       ├── auth/                                (existing - sign-in/up/out, session, forgot/reset-password)
│   │   │   │       ├── chat/                                (existing - conversations, messages, reactions, recipients, sse, upload)
│   │   │   │       ├── friends/                             (existing - invite, requests, respond)
│   │   │   │       ├── notifications/                       (existing - list, [id], [id]/read, unread-count)
│   │   │   │       ├── profile/                             (existing - [userId])
│   │   │   │       ├── upload/route.ts                      (new) shared upload endpoint
│   │   │   │       ├── posts/                               (new)
│   │   │   │       │   ├── route.ts                         (new) GET (feed/list), POST (create)
│   │   │   │       │   ├── [postId]/route.ts                (new) GET, PUT, DELETE
│   │   │   │       │   └── [postId]/reactions/route.ts      (new) POST, DELETE
│   │   │   │       ├── journal/                             (new)
│   │   │   │       │   └── route.ts                         (new) GET (private posts filtered)
│   │   │   │       ├── mood/                                (new)
│   │   │   │       │   ├── route.ts                         (new) GET (history), POST (record)
│   │   │   │       │   ├── today/route.ts                   (new) GET
│   │   │   │       │   └── stats/route.ts                   (new) GET (weekly/6-month charts)
│   │   │   │       ├── boards/                              (new)
│   │   │   │       │   ├── route.ts                         (new) GET (list), POST (create)
│   │   │   │       │   ├── [boardId]/route.ts               (new) GET, PUT, DELETE
│   │   │   │       │   ├── [boardId]/columns/route.ts       (new) POST
│   │   │   │       │   └── [boardId]/cards/route.ts         (new) POST, PATCH (reorder)
│   │   │   │       ├── gallery/                             (new)
│   │   │   │       │   ├── route.ts                         (new) GET (list), POST (add)
│   │   │   │       │   └── [photoId]/route.ts               (new) DELETE
│   │   │   │       ├── moodboards/                          (new)
│   │   │   │       │   ├── route.ts                         (new) GET (list), POST (create)
│   │   │   │       │   ├── [moodboardId]/route.ts           (new) GET, PUT, DELETE
│   │   │   │       │   └── [moodboardId]/pins/route.ts      (new) POST, DELETE
│   │   │   │       ├── rewards/                             (new)
│   │   │   │       │   ├── stickers/route.ts                (new) GET
│   │   │   │       │   └── badges/route.ts                  (new) GET
│   │   │   │       └── settings/                            (new)
│   │   │   │           └── route.ts                         (new) GET, PUT
│   │   │   ├── (auth)/                                      (existing - login, register, forgot-password)
│   │   │   ├── (protected)/                                 (existing - layout with requireAuth)
│   │   │   │   ├── dashboard/page.tsx                       (new) 8 Suspense widgets
│   │   │   │   ├── journal/page.tsx                         (new)
│   │   │   │   ├── mood/page.tsx                            (new)
│   │   │   │   ├── organization/page.tsx                    (new)
│   │   │   │   ├── social/page.tsx                          (new)
│   │   │   │   ├── gallery/page.tsx                         (new)
│   │   │   │   ├── moodboard/page.tsx                       (new)
│   │   │   │   ├── messages/page.tsx                        (existing)
│   │   │   │   ├── rewards/page.tsx                         (new)
│   │   │   │   ├── settings/page.tsx                        (new)
│   │   │   │   ├── profile/page.tsx                         (existing)
│   │   │   │   └── posts/
│   │   │   │       ├── new/page.tsx                          (new)
│   │   │   │       └── [postId]/page.tsx                     (new)
│   │   │   ├── contact/page.tsx                             (new)
│   │   │   ├── page.tsx                                     (existing - landing page)
│   │   │   ├── layout.tsx                                   (existing)
│   │   │   └── global.css                                   (existing)
│   │   │
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   │   ├── user/                                    (existing)
│   │   │   │   ├── profile/                                 (existing)
│   │   │   │   ├── friend/                                  (existing)
│   │   │   │   ├── conversation/                            (existing)
│   │   │   │   ├── message/                                 (existing)
│   │   │   │   ├── notification/                            (existing)
│   │   │   │   ├── errors/                                  (existing)
│   │   │   │   ├── post/                                    (new)
│   │   │   │   │   ├── post.aggregate.ts
│   │   │   │   │   ├── post-id.ts
│   │   │   │   │   ├── value-objects/post-content.vo.ts, post-visibility.vo.ts, post-image.vo.ts
│   │   │   │   │   └── events/post-created.event.ts, post-updated.event.ts, post-deleted.event.ts
│   │   │   │   ├── mood/                                    (new)
│   │   │   │   │   ├── mood-entry.aggregate.ts
│   │   │   │   │   ├── mood-entry-id.ts
│   │   │   │   │   ├── value-objects/mood-category.vo.ts, mood-intensity.vo.ts
│   │   │   │   │   └── events/mood-recorded.event.ts
│   │   │   │   ├── board/                                   (new)
│   │   │   │   │   ├── board.aggregate.ts
│   │   │   │   │   ├── board-id.ts
│   │   │   │   │   ├── column.entity.ts, card.entity.ts
│   │   │   │   │   ├── value-objects/board-type.vo.ts, card-status.vo.ts
│   │   │   │   │   └── events/board-created.event.ts, card-completed.event.ts
│   │   │   │   ├── gallery/                                 (new)
│   │   │   │   │   ├── photo.aggregate.ts, photo-id.ts
│   │   │   │   │   └── events/photo-uploaded.event.ts
│   │   │   │   ├── moodboard/                               (new)
│   │   │   │   │   ├── moodboard.aggregate.ts, moodboard-id.ts
│   │   │   │   │   ├── pin.entity.ts
│   │   │   │   │   ├── value-objects/pin-type.vo.ts
│   │   │   │   │   └── events/moodboard-created.event.ts
│   │   │   │   ├── reward/                                  (new)
│   │   │   │   │   ├── sticker.aggregate.ts, badge.aggregate.ts
│   │   │   │   │   ├── sticker-id.ts, badge-id.ts
│   │   │   │   │   ├── value-objects/achievement-criteria.vo.ts, reward-type.vo.ts
│   │   │   │   │   └── events/sticker-earned.event.ts, badge-earned.event.ts
│   │   │   │   └── reaction/                                (new)
│   │   │   │       ├── reaction.entity.ts, reaction-id.ts
│   │   │   │
│   │   │   ├── application/
│   │   │   │   ├── use-cases/
│   │   │   │   │   ├── auth/       (existing - 7 use cases)
│   │   │   │   │   ├── chat/       (existing - 7 use cases)
│   │   │   │   │   ├── friend/     (existing - 6 use cases)
│   │   │   │   │   ├── notification/ (existing - 2 use cases)
│   │   │   │   │   ├── profile/    (existing - 3 use cases)
│   │   │   │   │   ├── post/       (new - create, update, delete, get, get-feed, react-to-post)
│   │   │   │   │   ├── mood/       (new - record, get-history, get-stats)
│   │   │   │   │   ├── board/      (new - create, update, delete, add-card, move-card, complete-card)
│   │   │   │   │   ├── gallery/    (new - add-photo, delete-photo)
│   │   │   │   │   ├── moodboard/  (new - create, add-pin, delete)
│   │   │   │   │   ├── reward/     (new - evaluate-achievement, get-user-rewards)
│   │   │   │   │   └── upload/     (new - generate-upload-url)
│   │   │   │   ├── dto/            (existing + new per domain)
│   │   │   │   ├── ports/
│   │   │   │   │   ├── (existing - auth, user, conversation, message, friend, notification, profile, storage, email, invite-token)
│   │   │   │   │   ├── post-repository.port.ts              (new)
│   │   │   │   │   ├── mood-repository.port.ts              (new)
│   │   │   │   │   ├── board-repository.port.ts             (new)
│   │   │   │   │   ├── gallery-repository.port.ts           (new)
│   │   │   │   │   ├── moodboard-repository.port.ts         (new)
│   │   │   │   │   ├── reward-repository.port.ts            (new)
│   │   │   │   │   └── push-notification.provider.port.ts   (new)
│   │   │   │   └── event-handlers/                          (new)
│   │   │   │       ├── gamification.handler.ts              (new)
│   │   │   │       └── push-notification.handler.ts         (new)
│   │   │   │
│   │   │   └── adapters/
│   │   │       ├── controllers/    (existing + new per domain)
│   │   │       ├── repositories/   (new per domain)
│   │   │       ├── mappers/        (new per domain)
│   │   │       ├── queries/        (new - journal, feed, mood-stats, dashboard widgets)
│   │   │       ├── guards/         (existing)
│   │   │       └── services/
│   │   │           ├── auth/       (existing)
│   │   │           ├── email/      (existing)
│   │   │           ├── llm/        (existing)
│   │   │           └── push/       (new - Expo push notification provider)
│   │   │
│   │   └── common/di/modules/
│   │       ├── (existing - auth, chat, friend, notification, profile)
│   │       ├── post.module.ts       (new)
│   │       ├── mood.module.ts       (new)
│   │       ├── board.module.ts      (new)
│   │       ├── gallery.module.ts    (new)
│   │       ├── moodboard.module.ts  (new)
│   │       ├── reward.module.ts     (new)
│   │       └── upload.module.ts     (new)
│   │
│   └── expo/                        (existing - mobile app)
│
├── packages/
│   ├── ddd-kit/                     (existing)
│   ├── drizzle/src/schema/
│   │   ├── (existing - auth, chat, friend, notification, profile)
│   │   ├── post.ts                  (new)
│   │   ├── mood.ts                  (new)
│   │   ├── board.ts                 (new)
│   │   ├── gallery.ts              (new)
│   │   ├── moodboard.ts            (new)
│   │   └── reward.ts               (new)
│   ├── ui/                          (existing)
│   ├── test/                        (existing)
│   └── typescript-config/           (existing)
```

### Architectural Boundaries

**Clean Architecture Layers (Strict Dependency Rule):**
```
Domain ← Application ← Adapters ← Infrastructure
  │           │             │            │
  │           │             │            └── app/ routes, common/di/
  │           │             └── controllers, repositories, mappers, queries, services
  │           └── use-cases, ports, dto, event-handlers
  └── aggregates, entities, VOs, events
```
- Domain imports: ONLY ddd-kit + Zod
- Application imports: Domain + ddd-kit + Zod
- Adapters imports: Application + Domain + external libs
- Infrastructure imports: Everything

**API Boundaries:**
- All API routes under `/api/v1/` — versioned, RESTful
- Route files are thin — import controller, export HTTP method
- Controllers handle auth, validation, use case orchestration
- No business logic in routes or controllers

**Data Boundaries:**
- DB schema in `packages/drizzle/` — shared across apps
- Repositories implement ports — Domain never sees Drizzle
- Mappers convert between DB rows and Domain entities
- Queries (CQRS reads) access DB directly, bypass domain layer

### Requirements to Structure Mapping

| FR Category | Domain | Use Cases | API Routes | DB Schema | Pages |
|---|---|---|---|---|---|
| Auth (FR1-9) | user/ | auth/ | /auth/* | auth.ts | (auth)/ |
| Friends (FR10-17) | friend/ | friend/ | /friends/* | friend.ts | profile/ |
| Posts (FR18-26) | post/ | post/ | /posts/* | post.ts | posts/ |
| Journal (FR21-23) | post/ (filtered) | post/get-feed | /journal | post.ts | journal/ |
| Social Feed (FR27-29) | post/ + reaction/ | post/get-feed | /posts (public) | post.ts | social/ |
| Mood (FR30-35) | mood/ | mood/ | /mood/* | mood.ts | mood/ |
| Organization (FR36-42) | board/ | board/ | /boards/* | board.ts | organization/ |
| Messaging (FR43-47) | conversation/ + message/ | chat/ | /chat/* | chat.ts | messages/ |
| Gallery (FR48-50) | gallery/ | gallery/ | /gallery/* | gallery.ts | gallery/ |
| Moodboard (FR51-54) | moodboard/ | moodboard/ | /moodboards/* | moodboard.ts | moodboard/ |
| Rewards (FR55-60) | reward/ | reward/ | /rewards/* | reward.ts | rewards/ |
| Dashboard (FR61-69) | — (queries) | — | — | — | dashboard/ |
| Notifications (FR70-74) | notification/ | notification/ | /notifications/* | notification.ts | — |
| Settings (FR75-76) | profile/ | profile/ | /settings | profile.ts | settings/ |
| Contact (FR77) | — | — | — | — | contact/ |
| Landing (FR78-81) | — | — | — | — | page.tsx |

### Cross-Cutting Concerns Mapping

| Concern | Location |
|---|---|
| Auth guard | `src/adapters/guards/require-auth.ts` |
| File upload | `src/application/use-cases/upload/`, `/api/v1/upload/` |
| Gamification | `src/application/event-handlers/gamification.handler.ts` |
| Push notifications | `src/application/event-handlers/push-notification.handler.ts`, `src/adapters/services/push/` |
| Pagination | `packages/ddd-kit` (BaseRepository, PaginatedResult) |
| DI registration | `common/di/modules/{domain}.module.ts` |

### Data Flow

```
Client Request
    → API Route (app/api/v1/{domain}/route.ts)
    → Controller (src/adapters/controllers/{domain}/)
        → Auth check (getAuthenticatedUser)
        → Input validation (Zod safeParse)
        → Use Case (src/application/use-cases/{domain}/)
            → VO creation & validation
            → Repository call (via port)
                → Mapper (domain ↔ DB)
                → Drizzle query (packages/drizzle/)
            → Domain event dispatch
                → Gamification handler
                → Push notification handler
        → Result → JSON Response
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together without conflicts. Next.js 16 + Expo 54 share React 19 and consume the same API. PostgreSQL + Drizzle, BetterAuth 1.4, Cloudflare R2, SSE — no version incompatibilities. DDD patterns (ddd-kit) apply uniformly to existing 5 modules and 11 new modules.

Post aggregate with `isPrivate` flag for Journal aligns with PRD FR21 "filtered list of private posts." Unified Board model with dynamic views aligns with FR36 "switch between three views." Event-driven gamification engine is consistent with existing domain events pattern.

**Pattern Consistency:**
Naming conventions are consistent: files kebab-case, classes PascalCase, API kebab-case, DB snake_case — no collisions. File suffixes cover all file types. Controller auth pattern is identical everywhere. Use case flow pattern (validate → business logic → persist → dispatch → return Result) is systematic.

**Structure Alignment:**
Clean Architecture layers are properly stacked. Every new module follows the same folder structure as existing modules. API routes mirror controllers. Pages follow orchestration + `_components/` pattern.

### Requirements Coverage Validation ✅

**Functional Requirements (81/81 covered):**

| FR Category | Count | Status | Notes |
|---|---|---|---|
| Auth (FR1-9) | 9 | ✅ | Existing implementation |
| Friends (FR10-17) | 8 | ✅ | Existing implementation |
| Posts & Journal (FR18-26) | 9 | ✅ | New post/ domain, journal/ query route |
| Social Feed (FR27-29) | 3 | ✅ | Feed query + reactions route |
| Mood Tracker (FR30-35) | 6 | ✅ | New mood/ domain, /stats endpoint |
| Organization (FR36-42) | 7 | ✅ | Unified board model with dynamic views |
| Messaging (FR43-47) | 5 | ✅ | Existing implementation |
| Gallery (FR48-50) | 3 | ✅ | New gallery/ domain |
| Moodboard (FR51-54) | 4 | ✅ | New moodboard/ domain |
| Stickers & Rewards (FR55-60) | 6 | ✅ | New reward/ domain + gamification handler |
| Dashboard (FR61-69) | 9 | ✅ | 8 Suspense widgets + empty states |
| Notifications (FR70-74) | 5 | ✅ | Existing notification/ + push handler |
| Settings (FR75-76) | 2 | ✅ | Settings route + profile use cases |
| Contact (FR77) | 1 | ✅ | Contact page |
| Landing (FR78-81) | 4 | ✅ | Existing landing page |

**Non-Functional Requirements Coverage:**

| NFR | Architecturally Supported |
|---|---|
| Page load <3s | ✅ Server Components + Suspense, no client waterfalls |
| Widget render <1s | ✅ Independent async Server Components |
| Real-time <2s | ✅ SSE for chat (existing, proven) |
| Upload <5s | ✅ Presigned R2 URLs (direct upload, no server proxy) |
| Mood <500ms | ✅ Lightweight POST, single DB insert |
| 60fps drag & drop | ✅ Client-side with Reanimated (mobile) / Framer Motion (web) |
| Security | ✅ HTTPS, BetterAuth hashing, presigned URLs, data isolation, GDPR deletion |
| Reliability | ✅ SSE auto-reconnect, upload retry, PostgreSQL backups |
| Compatibility | ✅ iOS 15+ / Android 10+ / latest 2 browser versions |
| UX Quality | ✅ Figma fidelity, loading states, empty states, 300ms animations |

### Implementation Readiness Validation ✅

**Decision Completeness:**
- All critical decisions documented with versions ✅
- Implementation patterns comprehensive (naming, structure, format, communication, process) ✅
- Consistency rules clear and verifiable (`pnpm check:all`) ✅
- Living examples: 5 existing modules serve as direct reference ✅

**Structure Completeness:**
- Complete directory tree with (existing)/(new) markers ✅
- All files and directories defined ✅
- Integration points clearly specified (events → handlers → notifications) ✅
- Component boundaries well-defined (Clean Architecture layers) ✅

**Pattern Completeness:**
- Naming conventions cover all cases (DB, API, code, files) ✅
- Communication patterns fully specified (events, auth, controller flow, use case flow) ✅
- Process patterns documented (error handling, validation, loading states) ✅
- Anti-patterns listed (9 explicit prohibitions) ✅

### Gap Analysis Results

**Critical Gaps: None**
All blocking decisions are made. No module lacks architectural support.

**Important Gaps (non-blocking, mitigated by brownfield context):**

1. **Expo App Structure**: Architecture details `apps/nextjs/` exhaustively but does not document `apps/expo/` screen structure (navigation, TanStack Query state management, SecureStore token storage). Mitigated by existing Expo app with extractable patterns.

2. **Friend-Based Access Control Pattern**: Architecture mentions "friend-based access control for social features" without specifying the exact verification pattern (how to check friendship in queries/controllers). Mitigated by existing friend module primitives. Pattern will be established with first social module (post feed).

**Nice-to-Have Gaps:**

1. Journal streak counter (FR23) not explicitly listed as dedicated query/endpoint
2. Calendar event coloring logic (FR42) not specified
3. Reaction domain placement rationale (standalone vs sub-entity of Post)
4. Upload context-specific authorization rules not detailed

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** HIGH — based on:
- 5 brownfield modules prove the stack and patterns work
- 81/81 FRs architecturally covered
- All NFRs addressed
- No critical gaps
- Existing codebase serves as living reference

**Key Strengths:**

- Proven brownfield patterns — every new module is a copy-adapt of existing patterns
- Strict Clean Architecture — clear boundaries, no ambiguity
- Event-driven gamification — extensible without touching existing modules
- Shared cross-platform API — single source of truth
- Solo-dev optimized — minimal complexity, PostgreSQL-only, no external services

**Areas for Future Enhancement:**

- Document Expo app structure in detail for mobile phase
- Formalize friend-based access control as a reusable guard
- Consider Redis/cache if load exceeds PostgreSQL alone (Phase 2)
- Analytics platform selection to measure PRD KPIs

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions
- Use existing modules (auth, chat, friend, notification, profile) as living reference implementations

**First Implementation Priority:**

1. Shared upload endpoint `/api/v1/upload` (unblocks posts, gallery, moodboard)
2. Post aggregate + journal queries (core content creation)
3. Mood tracker aggregate (standalone, no dependencies)
4. Organization board aggregate (standalone)
5. Gallery + Moodboard (depend on upload)
6. Social feed queries (depends on posts)
7. Gamification engine (depends on events from all modules)
8. Stickers & badges domain (depends on gamification)
9. Dashboard widgets (depends on all module queries)
10. Push notifications (depends on gamification + Expo EAS setup)
11. Settings, contact, landing pages (independent, low priority)
