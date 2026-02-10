# Story 10.2: Social Feed & Reactions (Mobile)

Status: done

## Story

As a **mobile user**,
I want to browse my friends' public posts and react to them,
So that I can stay connected with friends from my phone.

## Acceptance Criteria

1. **Given** an authenticated mobile user with friends **When** they navigate to the social feed screen **Then** they see a paginated feed of friends' public posts fetched from `GET /api/v1/feed`

2. **Given** an authenticated mobile user viewing a friend's post **When** they tap the react button **Then** the reaction toggles and the count updates optimistically via TanStack Query mutation

3. **Given** an authenticated mobile user with no friends **When** they navigate to the social feed **Then** they see an empty state encouraging friend code sharing

4. **Given** an authenticated mobile user whose friends have no public posts **When** they navigate to the social feed **Then** they see an empty state indicating no posts yet from friends

5. **Given** the existing Expo components **When** implementing this story **Then** reuse existing `components/social/PublicPostCard` and `components/shared/ActionBar`

6. **Given** an authenticated mobile user viewing the feed **When** they pull to refresh **Then** the feed re-fetches from the API with loading indicator

7. **Given** a feed with many posts **When** the user scrolls to the bottom **Then** the next page loads automatically (infinite scroll)

## Tasks / Subtasks

- [x] Task 1: Create feed type definitions and query keys (AC: #1, #5)
  - [x] 1.1 Add `FeedPost`, `FeedResponse` types to `types/post.ts`
  - [x] 1.2 Add `feedKeys` factory to `lib/api/hooks/query-keys.ts`

- [x] Task 2: Create TanStack Query hook for friend feed (AC: #1, #6, #7)
  - [x] 2.1 Create `lib/api/hooks/use-friend-feed.ts` — `useFriendFeed(page, limit)` query hook fetching `GET /api/v1/feed`

- [x] Task 3: Connect social feed screen to real API (AC: #1, #2, #3, #4, #6, #7)
  - [x] 3.1 Replace `MOCK_PUBLIC_POSTS` in `app/(protected)/social/index.tsx` with `useFriendFeed()` hook
  - [x] 3.2 Wire `onLikePress` to existing `useTogglePostReaction()` with optimistic local state
  - [x] 3.3 Add loading skeleton while data fetches
  - [x] 3.4 Add empty state for "no friends" (`hasFriends: false`) with friend code sharing CTA
  - [x] 3.5 Add empty state for "no posts yet" (`hasFriends: true`, empty data)
  - [x] 3.6 Wire pull-to-refresh to `refetch()`
  - [x] 3.7 Add infinite scroll via `onEndReached` + `fetchNextPage` (or next page load)
  - [x] 3.8 Wire `onPress` to navigate to post detail screen (`/journal/post/[id]`)

## Dev Notes

### Backend API Contract (Existing -- Do NOT modify backend)

The web backend API is fully implemented. The mobile app consumes these endpoints:

**Feed Endpoint:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/feed?page=1&limit=20` | Get friends' public posts feed |

**Reaction Endpoints (already wired in story 10.1):**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/posts/:postId/reactions` | Toggle reaction (`{ emoji }`) |
| GET | `/api/v1/posts/:postId/reactions` | Get reactions list |

**Allowed Reaction Emojis:** `thumbsup`, `heart`, `laughing`, `surprised`, `crying`, `party`

**Feed Response Shape:**
```json
{
  "data": [
    {
      "id": "uuid",
      "content": "<p>HTML string</p>",
      "images": ["url1", "url2"],
      "createdAt": "2026-02-10T14:30:00.000Z",
      "updatedAt": null,
      "author": {
        "id": "uuid",
        "name": "Marie Dupont",
        "displayName": "Marie",
        "avatarUrl": "https://..."
      },
      "reactionCount": 24,
      "hasReacted": true
    }
  ],
  "hasFriends": true,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Toggle Reaction Response:**
```json
{
  "postId": "uuid",
  "userId": "uuid",
  "emoji": "heart",
  "action": "added" | "removed"
}
```

### Architecture Compliance

- **API Client**: Use existing `lib/api/client.ts` -- NEVER create a new client
- **Auth Tokens**: Handled automatically by `ApiClient` (SecureStore + in-memory cache)
- **TanStack Query**: Follow patterns from `use-journal.ts` and `use-posts.ts`
- **Query Keys**: Add `feedKeys` to existing `query-keys.ts` using factory pattern
- **Optimistic Updates**: Use local state for like toggle (same pattern as journal `onLikePress` in story 10.1)
- **Error Handling**: Use `ApiError` class, display via toast
- **Pagination**: Use standard `Pagination` type from `types/pagination.ts`
- **HTML Content**: Use `stripHtml()` from `lib/utils/post-format.ts` for text preview in cards
- **Date Formatting**: Use `formatPostDate()` and `formatPostTime()` from `lib/utils/post-format.ts`

### Existing Components to Reuse (DO NOT recreate)

| Component | Path | Purpose | What to Change |
|-----------|------|---------|----------------|
| `PublicPostCard` | `components/social/public-post-card.tsx` | Public post display with author info | Wire props to real API data |
| `ActionBar` | `components/shared/action-bar.tsx` | Like/Comment/Repost/Share buttons | Already wired via PublicPostCard |

### Existing Hooks to Reuse (DO NOT recreate)

| Hook | Path | Purpose |
|------|------|---------|
| `useTogglePostReaction()` | `lib/api/hooks/use-posts.ts` | Toggle post reaction (POST /api/v1/posts/:postId/reactions) |

### Existing Types to Reuse (DO NOT recreate)

| Type | Path | Purpose |
|------|------|---------|
| `Post` | `types/post.ts` | Base post interface |
| `PostReaction` | `types/post.ts` | Reaction with user info |
| `ToggleReactionResponse` | `types/post.ts` | Toggle reaction API response |
| `Pagination` | `types/pagination.ts` | Standard pagination shape |

### Existing Utilities to Reuse

| Utility | Path | Purpose |
|---------|------|---------|
| `stripHtml()` | `lib/utils/post-format.ts` | Strip HTML tags for plain text preview |
| `formatPostDate()` | `lib/utils/post-format.ts` | Format ISO date to display string |
| `formatPostTime()` | `lib/utils/post-format.ts` | Format ISO date to time string |

### Existing Screen to Modify (replace mock data)

| Screen | Path | Current State | Action |
|--------|------|---------------|--------|
| Social Feed | `app/(protected)/social/index.tsx` | MOCK_PUBLIC_POSTS array, local state for likes | Replace with `useFriendFeed()`, wire real reactions |

### New Files to Create

```
apps/expo/
└── lib/api/hooks/
    └── use-friend-feed.ts          # useFriendFeed() query hook
```

Plus additions to existing:
- `types/post.ts` -- add `FeedPost` and `FeedResponse` interfaces
- `lib/api/hooks/query-keys.ts` -- add `feedKeys` factory

### Key Implementation Patterns (from story 10.1)

**Feed query hook pattern** (follow `use-journal.ts`):
```typescript
export function useFriendFeed(page = 1, limit = 20) {
  return useQuery({
    queryKey: feedKeys.list(page, limit),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      return api.get<FeedResponse>(`/api/v1/feed?${params}`);
    },
    staleTime: 1000 * 30,
  });
}
```

**Query key factory pattern** (follow existing `query-keys.ts`):
```typescript
export const feedKeys = {
  all: ["feed"] as const,
  list: (page?: number, limit?: number) =>
    [...feedKeys.all, "list", { page, limit }] as const,
};
```

**Optimistic like toggle pattern** (from story 10.1 journal screen):
```typescript
const [localLikes, setLocalLikes] = useState<Record<string, boolean>>({});
const [localCounts, setLocalCounts] = useState<Record<string, number>>({});
const { mutate: toggleReaction } = useTogglePostReaction();

const handleLike = (postId: string, currentlyLiked: boolean, currentCount: number) => {
  setLocalLikes(prev => ({ ...prev, [postId]: !currentlyLiked }));
  setLocalCounts(prev => ({ ...prev, [postId]: currentlyLiked ? currentCount - 1 : currentCount + 1 }));
  toggleReaction({ postId, emoji: "heart" });
};
```

**Mapping FeedPost to PublicPostCard props:**
```typescript
const mapFeedPostToCard = (post: FeedPost) => ({
  id: post.id,
  authorName: post.author.displayName || post.author.name,
  authorAvatar: post.author.avatarUrl ?? undefined,
  date: formatPostDate(post.createdAt),
  time: formatPostTime(post.createdAt),
  content: stripHtml(post.content),
  likesCount: localCounts[post.id] ?? post.reactionCount,
  isLiked: localLikes[post.id] ?? post.hasReacted,
});
```

### Library Versions (Already Installed -- DO NOT upgrade)

| Library | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | 5.67.3 | Server state management |
| `expo-router` | 6.0.21 | File-based routing |
| `expo-secure-store` | 15.0.8 | Auth token storage |
| `nativewind` | 4.1.23 | Tailwind CSS for RN |
| `lucide-react-native` | 0.562.0 | Icons |

### Critical Guardrails

1. **DO NOT modify any backend code** -- all APIs are implemented and working
2. **DO NOT create new UI components** -- reuse existing `PublicPostCard`, `ActionBar`
3. **DO NOT install new libraries** -- everything needed is already installed
4. **DO NOT use Redux or Zustand** -- use TanStack Query for server state, useState for local UI state
5. **Follow NativeWind styling** -- all styles via Tailwind classNames, not StyleSheet
6. **Type everything** -- no `any`, use proper TypeScript interfaces
7. **Handle loading and error states** -- skeleton loaders, empty states, toast on error
8. **Invalidate caches on mutations** -- `useTogglePostReaction()` already invalidates `postKeys.all` and `journalKeys.all`; also add `feedKeys.all` invalidation
9. **Use `SafeAreaView`** -- import from `react-native-safe-area-context` (NOT from `react-native`)
10. **Cache invalidation on reaction**: When wiring `useTogglePostReaction()`, ensure `feedKeys.all` is also invalidated. The current hook invalidates `postKeys.all` and `journalKeys.all` but NOT `feedKeys`. Either add `feedKeys.all` to the hook's `onSuccess` or invalidate locally after mutation.

### Project Structure Notes

- Alignment with monorepo: Mobile app at `apps/expo/`, shares no code with `apps/nextjs/` except `packages/`
- API hooks are mobile-specific -- web uses Server Actions, mobile uses TanStack Query
- Navigation: Social screen is at `app/(protected)/social/index.tsx` (tab screen)
- Post detail screen already exists at `app/(protected)/journal/post/[id].tsx` -- navigate there for post details
- Protected layout at `app/(protected)/_layout.tsx` handles auth guard

### Previous Story Intelligence (10.1)

**Key Learnings from Story 10.1:**
- SafeAreaView MUST be imported from `react-native-safe-area-context`, NOT from `react-native`
- Like handlers need local optimistic state (not just server invalidation) for instant UI feedback
- `stripHtml()` is at `lib/utils/post-format.ts` for converting HTML content to plain text preview
- `formatPostDate()` and `formatPostTime()` are shared utilities -- do not recreate
- All post hooks invalidate both `journalKeys.all` and `postKeys.all` on mutation success
- PostFeed component re-groups flattened data (known minor perf overhead, accepted)

**Code Review Fixes Applied in 10.1 (avoid repeating):**
- H1: Like handlers must actually call the mutation (not just local state toggle)
- H2: HTML content should be preserved when editing (don't strip tags for display in editors)
- H4: SafeAreaView import consistency across all screens
- M1-M3: Extract shared utilities, don't duplicate across screens

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 10: Story 10.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Client Strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/implementation-artifacts/10-1-journal-and-posts-mobile.md — Previous story learnings]
- [Source: apps/expo/lib/api/client.ts — Base API client with token management]
- [Source: apps/expo/lib/api/hooks/use-posts.ts — useTogglePostReaction() hook]
- [Source: apps/expo/lib/api/hooks/use-journal.ts — Reference query hook pattern]
- [Source: apps/expo/lib/api/hooks/query-keys.ts — Query key factory pattern]
- [Source: apps/expo/lib/utils/post-format.ts — stripHtml, formatPostDate, formatPostTime]
- [Source: apps/expo/components/social/public-post-card.tsx — PublicPostCard component]
- [Source: apps/expo/components/shared/action-bar.tsx — ActionBar component]
- [Source: apps/expo/app/(protected)/social/index.tsx — Current screen with mock data]
- [Source: apps/expo/types/post.ts — Post, PostReaction, ToggleReactionResponse types]
- [Source: apps/nextjs/app/api/v1/feed/route.ts — Backend feed endpoint]
- [Source: apps/nextjs/src/application/dto/feed/get-friend-feed.dto.ts — Feed DTO schema]
- [Source: apps/nextjs/src/adapters/queries/friend-feed.query.ts — Feed query implementation]
- [Source: apps/nextjs/app/api/v1/posts/[postId]/reactions/route.ts — Reaction endpoints]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List
- All 3 tasks completed: feed types + query keys, feed query hook, social screen wiring
- All 7 ACs satisfied: feed API, optimistic reactions, empty state (no friends), empty state (no posts), component reuse, pull-to-refresh, infinite scroll
- `pnpm fix` passes (2 pre-existing warnings: console + dangerouslySetInnerHTML)
- `pnpm type-check` passes (0 errors)
- `pnpm test` passes (389 tests, 0 regressions)
- No new libraries installed, no backend modifications
- Added `feedKeys.all` invalidation to `useTogglePostReaction()`, `useCreatePost()`, `useDeletePost()` for consistent cache strategy
- SafeAreaView imported from react-native-safe-area-context (lesson from story 10.1)
- Share sheet uses React Native's built-in `Share.share()` API

### Code Review Fixes Applied
- **H1**: Infinite scroll implemented — converted `useFriendFeed` from `useQuery` to `useInfiniteQuery`, added `onEndReached` handler with `fetchNextPage`/`hasNextPage`/`isFetchingNextPage`, posts flattened via `useMemo` over `data.pages`
- **M1**: Cache invalidation consistency — added `feedKeys.all` invalidation to `useCreatePost()` and `useDeletePost()` (was only on `useTogglePostReaction`)
- **M2**: Empty catch block — added proper error handling in `handleSharePress` catch block, filtering out expected user cancellation
- **Bonus**: Fixed reaction emoji from `"❤️"` (emoji character) to `"heart"` (backend-expected string name)

### File List
**Created:**
- `apps/expo/lib/api/hooks/use-friend-feed.ts` — useFriendFeed() infinite query hook for GET /api/v1/feed

**Modified:**
- `apps/expo/types/post.ts` — Added FeedPostAuthor, FeedPost, FeedResponse interfaces
- `apps/expo/lib/api/hooks/query-keys.ts` — Added feedKeys factory
- `apps/expo/lib/api/hooks/use-posts.ts` — Added feedKeys.all invalidation to useTogglePostReaction(), useCreatePost(), useDeletePost()
- `apps/expo/app/(protected)/social/index.tsx` — Complete rewrite: mock data replaced with useFriendFeed(), useInfiniteQuery infinite scroll, optimistic likes, loading/error/empty states, pull-to-refresh, share sheet, navigation to post detail
