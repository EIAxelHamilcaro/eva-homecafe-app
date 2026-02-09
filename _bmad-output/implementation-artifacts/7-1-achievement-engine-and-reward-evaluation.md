# Story 7.1: Achievement Engine & Reward Evaluation

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to automatically earn stickers and badges when I reach activity milestones,
so that I feel rewarded for my engagement and consistency.

## Acceptance Criteria

1. **Given** domain events are dispatched from modules (PostCreated, MoodRecorded, CardCompleted, PhotoUploaded, etc.) **When** the gamification event handler receives an event **Then** it evaluates all relevant achievement criteria for the user

2. **Given** a user who meets an achievement criteria (e.g., 7-day journal streak, 10 mood check-ins, first post) **When** the criteria is evaluated **Then** a new Sticker or Badge is awarded to the user **And** a StickerEarnedEvent or BadgeEarnedEvent domain event is dispatched **And** the Sticker/Badge aggregates and DB schema (reward tables) are created

3. **Given** a user who earns a new sticker or badge **When** the reward event is dispatched **Then** a notification is created informing the user (FR58)

4. **Given** a user who already has a specific sticker/badge **When** the same criteria is met again **Then** no duplicate reward is created (idempotent)

5. **Given** the achievement criteria definitions **When** the system initializes **Then** criteria include at minimum: journal streaks, mood consistency, post count milestones, friend connection milestones, gallery milestones

## Tasks / Subtasks

- [x] Task 1: Design & Create Reward Domain (AC: #2, #5)
  - [x]1.1 Create DB schema `packages/drizzle/src/schema/reward.ts` with three tables: `achievement_definition` (id, type, key, name, description, criteria JSON, iconUrl, createdAt), `user_reward` (id, userId, achievementDefinitionId, earnedAt), `achievement_type_enum` pgEnum ("sticker" | "badge")
  - [x]1.2 Create `src/domain/reward/reward-id.ts` — RewardId extending UUID
  - [x]1.3 Create `src/domain/reward/value-objects/achievement-type.vo.ts` — VO with "sticker" | "badge" validation
  - [x]1.4 Create `src/domain/reward/value-objects/achievement-criteria.vo.ts` — VO wrapping criteria JSON (eventType, threshold, field)
  - [x]1.5 Create `src/domain/reward/user-reward.aggregate.ts` — UserReward aggregate (userId, achievementDefinitionId, achievementType, achievementKey, earnedAt)
  - [x]1.6 Create `src/domain/reward/events/sticker-earned.event.ts` — StickerEarnedEvent
  - [x]1.7 Create `src/domain/reward/events/badge-earned.event.ts` — BadgeEarnedEvent
  - [x]1.8 Run `pnpm db:push` to create reward tables

- [x] Task 2: Create Reward Repository & Port (AC: #2, #4)
  - [x]2.1 Create `src/application/ports/reward-repository.port.ts` — IRewardRepository extending BaseRepository<UserReward> with `findByUserId()`, `findByUserIdAndDefinitionId()`, `getAllDefinitions()`, `getDefinitionsByType()`
  - [x]2.2 Create `src/adapters/mappers/reward.mapper.ts` — userRewardToDomain/toPersistence + definitionToDomain
  - [x]2.3 Create `src/adapters/repositories/reward.repository.ts` — DrizzleRewardRepository implementing IRewardRepository

- [x] Task 3: Seed Achievement Definitions (AC: #5)
  - [x]3.1 Create seed data file or inline seed in repository — define initial achievements:
    - **Stickers:** first-post, first-mood, first-photo, first-moodboard, first-friend, journal-streak-3, journal-streak-7, mood-streak-7, mood-streak-30, posts-10, photos-10
    - **Badges:** journal-streak-30, mood-streak-60, posts-50, photos-50, friends-5, friends-10, all-moods-recorded, kanban-master (10 cards completed)
  - [x]3.2 Create seed script or use-case that ensures definitions exist (upsert pattern — idempotent)

- [x] Task 4: Create Achievement Evaluation Use Case (AC: #1, #2, #4)
  - [x]4.1 Create `src/application/dto/reward/evaluate-achievement.dto.ts` — input (userId, eventType, eventPayload), output (newRewards[])
  - [x]4.2 Create `src/application/use-cases/reward/evaluate-achievement.use-case.ts` — loads user's existing rewards, loads matching definitions for eventType, checks criteria thresholds by querying counts/streaks, awards new rewards (idempotent), creates notification for each new reward
  - [x]4.3 Write BDD tests `src/application/use-cases/reward/__tests__/evaluate-achievement.use-case.test.ts`

- [x] Task 5: Create Event Handler for Gamification (AC: #1)
  - [x]5.1 Create `src/application/event-handlers/gamification.handler.ts` — subscribes to domain events, calls EvaluateAchievementUseCase
  - [x]5.2 Wire event handler: create `src/adapters/services/gamification/gamification-event-dispatcher.ts` that dispatches aggregate events to handlers after persistence
  - [x]5.3 Create `src/application/ports/event-dispatcher.port.ts` — IEventDispatcher interface with `dispatch(event)` and `dispatchAll(events[])`
  - [x]5.4 Create adapter implementation of IEventDispatcher that routes events to gamification handler

- [x] Task 6: Wire Event Dispatch in Existing Use Cases (AC: #1)
  - [x]6.1 Update existing use cases (CreatePost, RecordMood, AddPhoto, CreateMoodboard, etc.) to call `eventDispatcher.dispatchAll(aggregate.domainEvents)` after successful persistence
  - [x]6.2 Update DI modules to inject IEventDispatcher into use cases that emit events
  - [x]6.3 Ensure backward compatibility — all existing tests still pass

- [x] Task 7: Create Notification Integration (AC: #3)
  - [x]7.1 When EvaluateAchievementUseCase awards a new reward, create a Notification via existing notification repository with type "reward_earned"
  - [x]7.2 Add "reward_earned" to NotificationType VO enum values

- [x] Task 8: Create Streak & Count Query Functions (AC: #1, #2)
  - [x]8.1 Create `src/adapters/queries/reward/achievement-queries.ts` — query functions for: getJournalStreakDays(userId), getMoodStreakDays(userId), getPostCount(userId), getPhotoCount(userId), getFriendCount(userId), getMoodboardCount(userId), getCompletedCardCount(userId), getUniqueMoodCategoriesCount(userId)
  - [x]8.2 These are CQRS read queries — direct ORM, no domain layer

- [x] Task 9: DI Registration (AC: all)
  - [x]9.1 Add DI symbols: IRewardRepository, EvaluateAchievementUseCase, IEventDispatcher to `common/di/types.ts`
  - [x]9.2 Add DI return types for all new symbols
  - [x]9.3 Create `common/di/modules/reward.module.ts` — bind repository, use case, event dispatcher
  - [x]9.4 Load reward module in `container.ts` (alphabetical order)
  - [x]9.5 Update existing modules to inject IEventDispatcher where needed

- [x] Task 10: Quality Checks (AC: all)
  - [x]10.1 Run `pnpm fix` — auto-fix formatting
  - [x]10.2 Run `pnpm type-check` — TypeScript passes
  - [x]10.3 Run `pnpm test` — all tests pass (existing + new)
  - [x]10.4 Run `pnpm check` — 0 new Biome errors

## Dev Notes

### Architecture: Event-Driven Gamification Engine

This is the most cross-cutting story in the project. It introduces:
1. **Domain event dispatch infrastructure** — the IEventDispatcher port that was deferred until now
2. **Reward domain** — UserReward aggregate, achievement definitions, earned rewards
3. **Gamification handler** — event listener that evaluates achievements reactively
4. **Notification integration** — creating notifications when rewards are earned

### CRITICAL: IEventDispatcher Does NOT Exist Yet

The codebase has 27 domain events across all modules. They are added via `aggregate.addEvent()` but **never dispatched**. This story must:
1. Create the `IEventDispatcher` port
2. Create an in-process synchronous implementation
3. Wire it into all existing use cases that emit events
4. Register the gamification handler as an event subscriber

### Domain Event Inventory (Events to Subscribe To)

Events that trigger achievement evaluation:

| Event | Module | Achievement Check |
|-------|--------|-------------------|
| PostCreatedEvent | post | post count, first-post |
| MoodRecordedEvent | mood | mood count, mood streak, unique moods, first-mood |
| PhotoUploadedEvent | gallery | photo count, first-photo |
| MoodboardCreatedEvent | moodboard | moodboard count, first-moodboard |
| FriendRequestAcceptedEvent | friend | friend count, first-friend |
| CardCompletedEvent | board | completed card count, kanban-master |
| PinAddedEvent | moodboard | (no direct achievement, but tracked) |

### Journal Streak Calculation

Journal streak = consecutive days with at least one private post. Query pattern:
```sql
-- Get distinct dates with private posts, ordered desc
SELECT DISTINCT DATE(created_at) as post_date
FROM post
WHERE user_id = ? AND is_private = true
ORDER BY post_date DESC;
-- Then count consecutive days from today backward
```

This is a CQRS read query, not domain logic. Lives in `adapters/queries/reward/`.

### Mood Streak Calculation

Similar pattern: consecutive days with at least one mood entry.
```sql
SELECT DISTINCT DATE(created_at) as mood_date
FROM mood_entry
WHERE user_id = ?
ORDER BY mood_date DESC;
```

### Achievement Definition Schema Design

Using a **definition table** rather than hardcoded criteria in code:

```typescript
// achievement_definition table
{
  id: text("id").primaryKey(),              // UUID
  type: achievementTypeEnum("type"),         // "sticker" | "badge"
  key: text("key").notNull().unique(),       // "first-post", "journal-streak-7"
  name: text("name").notNull(),              // "First Post!"
  description: text("description").notNull(), // "Write your first post"
  criteria: jsonb("criteria").notNull(),      // { eventType: "PostCreated", threshold: 1, field: "count" }
  iconUrl: text("icon_url"),                  // Optional icon/image URL
  createdAt: timestamp("created_at").notNull().defaultNow(),
}

// user_reward table (earned rewards)
{
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  achievementDefinitionId: text("achievement_definition_id").references(() => achievementDefinition.id),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
}
// Unique constraint on (userId, achievementDefinitionId) for idempotency
```

### Event Dispatcher Design

Simple in-process synchronous dispatcher:

```typescript
// Port
export interface IEventDispatcher {
  dispatch(event: DomainEvent): Promise<void>;
  dispatchAll(events: DomainEvent[]): Promise<void>;
}

// Implementation routes to registered handlers
export class InProcessEventDispatcher implements IEventDispatcher {
  constructor(private readonly handlers: Map<string, EventHandler[]>) {}

  async dispatch(event: DomainEvent): Promise<void> {
    const eventHandlers = this.handlers.get(event.type) ?? [];
    for (const handler of eventHandlers) {
      await handler.handle(event);
    }
  }

  async dispatchAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.dispatch(event);
    }
  }
}
```

**Handler registration happens in DI module**, not at runtime. The dispatcher is injected into use cases.

### Wiring Event Dispatch into Existing Use Cases

Use cases that need IEventDispatcher injection (add as last constructor dependency):

| Use Case | Events | Module File |
|----------|--------|-------------|
| CreatePostUseCase | PostCreatedEvent | post.module.ts |
| UpdatePostUseCase | PostUpdatedEvent | post.module.ts |
| DeletePostUseCase | PostDeletedEvent | post.module.ts |
| ReactToPostUseCase | PostReactedEvent | post.module.ts |
| RecordMoodUseCase | MoodRecordedEvent | mood.module.ts |
| CreateBoardUseCase | BoardCreatedEvent | board.module.ts |
| CompleteBoardCardUseCase (if exists) | CardCompletedEvent | board.module.ts |
| AddPhotoUseCase | PhotoUploadedEvent | gallery.module.ts |
| DeletePhotoUseCase | PhotoDeletedEvent | gallery.module.ts |
| CreateMoodboardUseCase | MoodboardCreatedEvent | moodboard.module.ts |
| AddPinUseCase | PinAddedEvent | moodboard.module.ts |
| DeleteMoodboardUseCase | MoodboardDeletedEvent | moodboard.module.ts |

**Pattern for wiring:**
```typescript
// In use case, after successful persistence:
const saveResult = await this.repo.create(entity);
if (saveResult.isFailure) return Result.fail(saveResult.getError());

// NEW: dispatch events after persistence
await this.eventDispatcher.dispatchAll(entity.domainEvents);
entity.clearEvents();

return Result.ok(dto);
```

**CRITICAL: Update use case constructors AND DI module bindings to add IEventDispatcher dependency.**

### Existing Notification Integration

The notification module already has:
- `Notification.create()` that takes userId, type, title, body, data
- `INotificationRepository` with `create()` method
- `NotificationType` VO with values: "friend_request", "friend_accepted", "new_message"

**Must add:** "reward_earned" to the NotificationType VO enum values.

Then in EvaluateAchievementUseCase, when a new reward is awarded:
```typescript
const notification = Notification.create({
  userId,
  type: NotificationType.create("reward_earned").getValue(),
  title: `New ${achievement.type}: ${achievement.name}!`,
  body: achievement.description,
  data: { achievementId: achievement.id, achievementType: achievement.type },
});
await this.notificationRepo.create(notification);
```

### Idempotency Strategy (AC #4)

Before awarding any reward:
```typescript
const existingReward = await this.rewardRepo.findByUserIdAndDefinitionId(userId, definitionId);
if (existingReward.isSuccess && existingReward.getValue().isSome()) {
  // Already earned — skip silently
  continue;
}
```

Plus unique DB constraint on (userId, achievementDefinitionId) as safety net.

### What Already Exists (DO NOT Recreate)

**Domain Events (27 total across all modules):** All events use `DomainEvent` interface from @packages/ddd-kit with `type`, `dateTimeOccurred`, `aggregateId` fields. Events have PascalCase `type` values like "PostCreated", "MoodRecorded".

**Notification Module:** Fully implemented — Notification aggregate, NotificationType VO, INotificationRepository, DrizzleNotificationRepository, mappers, queries, controllers, API routes.

**DI Container:** @evyweb/ioctopus with Symbol-based bindings. All 12 domain modules registered. Container loads modules alphabetically.

### Project Structure Notes

All new files follow established patterns:
- Domain: `src/domain/reward/` folder
- Application: `src/application/use-cases/reward/`, `src/application/dto/reward/`
- Adapters: `src/adapters/repositories/reward.repository.ts`, `src/adapters/mappers/reward.mapper.ts`
- Queries: `src/adapters/queries/reward/achievement-queries.ts`
- Event infrastructure: `src/application/ports/event-dispatcher.port.ts`, `src/application/event-handlers/gamification.handler.ts`
- DI: `common/di/modules/reward.module.ts`
- DB: `packages/drizzle/src/schema/reward.ts`
- No UI changes in this story (UI is Story 7.2)
- No API routes in this story (API is Story 7.2)

### File Structure

```
# New files to create
packages/drizzle/src/schema/reward.ts
apps/nextjs/src/domain/reward/reward-id.ts
apps/nextjs/src/domain/reward/user-reward.aggregate.ts
apps/nextjs/src/domain/reward/value-objects/achievement-type.vo.ts
apps/nextjs/src/domain/reward/value-objects/achievement-criteria.vo.ts
apps/nextjs/src/domain/reward/events/sticker-earned.event.ts
apps/nextjs/src/domain/reward/events/badge-earned.event.ts
apps/nextjs/src/application/ports/event-dispatcher.port.ts
apps/nextjs/src/application/ports/reward-repository.port.ts
apps/nextjs/src/application/dto/reward/evaluate-achievement.dto.ts
apps/nextjs/src/application/use-cases/reward/evaluate-achievement.use-case.ts
apps/nextjs/src/application/use-cases/reward/__tests__/evaluate-achievement.use-case.test.ts
apps/nextjs/src/application/event-handlers/gamification.handler.ts
apps/nextjs/src/adapters/services/gamification/gamification-event-dispatcher.ts
apps/nextjs/src/adapters/mappers/reward.mapper.ts
apps/nextjs/src/adapters/repositories/reward.repository.ts
apps/nextjs/src/adapters/queries/reward/achievement-queries.ts
apps/nextjs/common/di/modules/reward.module.ts

# Files to modify
apps/nextjs/src/domain/notification/value-objects/notification-type.vo.ts  # Add "reward_earned"
apps/nextjs/common/di/types.ts                                             # Add reward DI symbols
apps/nextjs/common/di/container.ts                                         # Load reward module
apps/nextjs/src/application/use-cases/post/create-post.use-case.ts         # Add event dispatch
apps/nextjs/src/application/use-cases/post/update-post.use-case.ts         # Add event dispatch
apps/nextjs/src/application/use-cases/post/delete-post.use-case.ts         # Add event dispatch
apps/nextjs/src/application/use-cases/post/react-to-post.use-case.ts       # Add event dispatch
apps/nextjs/src/application/use-cases/mood/record-mood.use-case.ts         # Add event dispatch
apps/nextjs/src/application/use-cases/board/create-board.use-case.ts       # Add event dispatch
apps/nextjs/src/application/use-cases/gallery/add-photo.use-case.ts        # Add event dispatch
apps/nextjs/src/application/use-cases/gallery/delete-photo.use-case.ts     # Add event dispatch
apps/nextjs/src/application/use-cases/moodboard/create-moodboard.use-case.ts # Add event dispatch
apps/nextjs/src/application/use-cases/moodboard/add-pin.use-case.ts       # Add event dispatch
apps/nextjs/src/application/use-cases/moodboard/delete-moodboard.use-case.ts # Add event dispatch
apps/nextjs/common/di/modules/post.module.ts                               # Add IEventDispatcher dep
apps/nextjs/common/di/modules/mood.module.ts                               # Add IEventDispatcher dep
apps/nextjs/common/di/modules/board.module.ts                              # Add IEventDispatcher dep
apps/nextjs/common/di/modules/gallery.module.ts                            # Add IEventDispatcher dep
apps/nextjs/common/di/modules/moodboard.module.ts                          # Add IEventDispatcher dep
packages/drizzle/src/schema/index.ts                                       # Export reward schema (if barrel exists)
```

### DI Registration

**types.ts additions:**
```typescript
// DI_SYMBOLS:
IRewardRepository: Symbol.for("IRewardRepository"),
EvaluateAchievementUseCase: Symbol.for("EvaluateAchievementUseCase"),
IEventDispatcher: Symbol.for("IEventDispatcher"),

// DI_RETURN_TYPES:
IRewardRepository: IRewardRepository;
EvaluateAchievementUseCase: EvaluateAchievementUseCase;
IEventDispatcher: IEventDispatcher;
```

**reward.module.ts:**
```typescript
m.bind(DI_SYMBOLS.IRewardRepository).toClass(DrizzleRewardRepository);
m.bind(DI_SYMBOLS.EvaluateAchievementUseCase).toClass(EvaluateAchievementUseCase, [
  DI_SYMBOLS.IRewardRepository,
  DI_SYMBOLS.INotificationRepository,
]);
m.bind(DI_SYMBOLS.IEventDispatcher).toClass(InProcessEventDispatcher, [
  DI_SYMBOLS.EvaluateAchievementUseCase,
]);
```

### Testing Strategy

**EvaluateAchievementUseCase tests (~12 tests):**
- Happy path: user earns first-post sticker (post count reaches 1)
- Happy path: user earns journal-streak-7 sticker (7 consecutive days)
- Happy path: user earns mood-streak-30 badge (30 consecutive days)
- Idempotency: no duplicate reward when criteria already met
- Notification: notification created when new reward earned
- Multiple: user earns multiple rewards from single event (e.g., first-post + posts-10 if 10th post)
- No match: event type has no matching achievement definitions
- Count threshold: user below threshold, no reward earned
- Streak broken: streak count returns 0 or less than threshold
- Repository error: fail gracefully when reward repo returns error
- Query error: fail gracefully when count query returns error
- No definitions: empty definitions list, no rewards checked

**Mocking strategy:**
- Mock IRewardRepository (findByUserIdAndDefinitionId, getAllDefinitions, create)
- Mock INotificationRepository (create)
- Mock achievement query functions (getJournalStreakDays, getPostCount, etc.)

### Data Integrity Checklist

- **Unique constraint** on (userId, achievementDefinitionId) prevents duplicate rewards at DB level
- **Idempotent check** in use case prevents unnecessary DB writes
- **CASCADE DELETE** on userId foreign key — user deletion removes all rewards
- **Event dispatch order** — events dispatched AFTER successful persistence, never before
- **Notification creation** — best-effort, don't fail reward creation if notification fails

### Security Checklist

- Achievement evaluation triggered by domain events only (not exposed via API)
- userId comes from event payload (set by authenticated use case), never from external input
- No public API endpoint for this story — all internal
- Reward definitions are system-managed, not user-modifiable

### Critical Anti-Patterns to Avoid

1. **Do NOT hardcode achievement criteria in the use case** — use definition table for extensibility
2. **Do NOT use polling** to check achievements — use event-driven reactive pattern
3. **Do NOT throw exceptions** — use Result<T> exclusively
4. **Do NOT create separate Sticker and Badge aggregates** — single UserReward aggregate with AchievementType VO differentiates
5. **Do NOT skip idempotency check** — always verify reward not already earned before creating
6. **Do NOT create index.ts barrel files**
7. **Do NOT add comments** — self-documenting code
8. **Do NOT create API routes** in this story — API is Story 7.2
9. **Do NOT create UI pages** in this story — UI is Story 7.2
10. **Do NOT break existing tests** — all 335 existing tests must pass after wiring event dispatch

### Golden Reference Files

| Purpose | Source File | Adaptation |
|---------|------------|------------|
| Aggregate pattern | `src/domain/gallery/photo.aggregate.ts` | UserReward aggregate |
| Event pattern | `src/domain/post/events/post-created.event.ts` | StickerEarnedEvent, BadgeEarnedEvent |
| Repository port | `src/application/ports/gallery-repository.port.ts` | IRewardRepository |
| Repository impl | `src/adapters/repositories/gallery.repository.ts` | DrizzleRewardRepository |
| Mapper | `src/adapters/mappers/moodboard.mapper.ts` | reward.mapper.ts |
| DB schema | `packages/drizzle/src/schema/moodboard.ts` | reward.ts (definition + user_reward) |
| DI module | `common/di/modules/gallery.module.ts` | reward.module.ts |
| Notification creation | `src/domain/notification/notification.aggregate.ts` | NotificationType "reward_earned" |
| VO enum | `src/domain/notification/value-objects/notification-type.vo.ts` | Add "reward_earned" value |
| CQRS query | `src/adapters/queries/mood/mood-stats.query.ts` | achievement-queries.ts |

### Previous Story Intelligence (Story 6.2)

Key learnings from Story 6.2 that impact this story:
1. **Events use DomainEvent interface** with `type`, `dateTimeOccurred`, `aggregateId` — NOT BaseDomainEvent class
2. **addEvent() pattern** is consistent across all aggregates — events stored but never dispatched
3. **335 tests currently passing** — new tests and event dispatch wiring must not break them
4. **IEventDispatcher was explicitly deferred** to Epic 7 (noted in Story 6.2 anti-patterns)
5. **Repository update() uses transactions** — follow same pattern for reward operations
6. **Biome formatting: spaces not tabs** — always run `pnpm fix` after writing files
7. **Commit pattern**: `feat(nextjs): implement story X.Y — [description] with code review fixes`

### Git Intelligence

Recent commits show all epics 1-6 complete. Last 5 commits:
- `feat(nextjs): implement story 6.1 — create and browse moodboards with code review fixes`
- `docs: document shadcn/ui import path workaround in CLAUDE.md`
- `docs: complete epic 5 retrospective and mark epic as done`
- `feat(nextjs): implement story 5.2 — browse and delete gallery photos with code review fixes`
- `feat(nextjs): implement story 5.1 — upload photos to gallery with code review fixes`

All quality checks pass on current main. 335 tests across ~40 files. Code review fixes consistently applied in same commit.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.1: Achievement Engine & Reward Evaluation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Gamification — Event-Driven Achievement Engine]
- [Source: _bmad-output/planning-artifacts/architecture.md#Domain Events]
- [Source: _bmad-output/planning-artifacts/architecture.md#Push Notifications — Domain Event Handlers]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure — reward/ files]
- [Source: _bmad-output/planning-artifacts/prd.md#FR55-FR60 — Stickers & Rewards]
- [Source: _bmad-output/implementation-artifacts/6-2-pin-items-and-manage-moodboard-content.md — previous story]
- [Source: apps/nextjs/src/domain/notification/ — notification module reference]
- [Source: apps/nextjs/src/domain/post/events/ — event pattern reference]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
