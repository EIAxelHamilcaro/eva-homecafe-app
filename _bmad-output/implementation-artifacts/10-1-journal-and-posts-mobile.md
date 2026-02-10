# Story 10.1: Journal & Posts (Mobile)

Status: done

## Story

As a **mobile user**,
I want to create, view, edit, and delete posts from my phone,
So that I can maintain my journal and share content on the go.

## Acceptance Criteria

1. **Given** an authenticated mobile user **When** they navigate to the journal screen **Then** they see their private posts grouped by date, fetched via TanStack Query from `/api/v1/journal`

2. **Given** an authenticated mobile user **When** they create a post with rich text and optional images (via expo-image-picker) **Then** the post is persisted via `POST /api/v1/posts` and appears in their journal or social feed

3. **Given** an authenticated mobile user viewing a post **When** they tap edit or delete **Then** the post is updated via `PATCH /api/v1/posts/:postId` or removed via `DELETE /api/v1/posts/:postId` and the local query cache is invalidated

4. **Given** an authenticated mobile user **When** they view their journal **Then** they see their streak counter (from `GET /api/v1/journal/streak`) and can browse entries by date

5. **Given** the existing Expo components **When** implementing this story **Then** reuse existing `components/journal/` components (`PostCard`, `PostEditor`, `PostFeed`) and `lib/api/hooks/` patterns

6. **Given** an authenticated mobile user with no posts **When** they navigate to the journal **Then** they see an empty state encouraging them to write their first entry

7. **Given** an authenticated mobile user **When** they view a single post detail **Then** real post data is fetched from `GET /api/v1/posts/:postId` replacing mock data

## Tasks / Subtasks

- [x] Task 1: Create Post type definitions (AC: #5)
  - [x] 1.1 Create `types/post.ts` with `Post`, `PostGroup`, `JournalResponse`, `StreakResponse`, `CreatePostInput`, `UpdatePostInput` types
  - [x] 1.2 Add `postKeys` and `journalKeys` to `lib/api/hooks/query-keys.ts`

- [x] Task 2: Create TanStack Query hooks for journal (AC: #1, #4)
  - [x] 2.1 Create `lib/api/hooks/use-journal.ts` — `useJournalEntries(page, limit, date?)` query hook fetching `GET /api/v1/journal`
  - [x] 2.2 Create `lib/api/hooks/use-journal-streak.ts` — `useJournalStreak()` query hook fetching `GET /api/v1/journal/streak`

- [x] Task 3: Create TanStack Query hooks for post CRUD (AC: #2, #3, #7)
  - [x] 3.1 Create `lib/api/hooks/use-posts.ts` — `useCreatePost()` mutation, `useUpdatePost()` mutation, `useDeletePost()` mutation, `usePost(postId)` query
  - [x] 3.2 Add cache invalidation: after create/update/delete, invalidate `journalKeys.all` and `postKeys.all`

- [x] Task 4: Connect journal index screen to real API (AC: #1, #4, #6)
  - [x] 4.1 Replace `MOCK_POSTS` in `app/(protected)/journal/index.tsx` with `useJournalEntries()` hook
  - [x] 4.2 Add `useJournalStreak()` to display streak counter in journal header
  - [x] 4.3 Add loading skeleton while data fetches
  - [x] 4.4 Add empty state when no posts exist
  - [x] 4.5 Wire `onLikePress` to real API (if reaction toggle is needed)

- [x] Task 5: Connect create post screen to real API (AC: #2)
  - [x] 5.1 Replace `console.log` in `app/(protected)/journal/create.tsx` with `useCreatePost()` mutation
  - [x] 5.2 Wire image picker (already has `onImagePress`) to `useMediaUpload()` hook with context "post"
  - [x] 5.3 On success, navigate back and invalidate journal queries
  - [x] 5.4 Show loading/disabled state during submission
  - [x] 5.5 Show error toast on failure

- [x] Task 6: Connect post detail screen to real API (AC: #7)
  - [x] 6.1 Replace `MOCK_POST` in `app/(protected)/journal/post/[id].tsx` with `usePost(id)` query
  - [x] 6.2 Wire action bar to real API calls
  - [x] 6.3 Add loading skeleton for post detail

- [x] Task 7: Add edit and delete functionality (AC: #3)
  - [x] 7.1 Add edit button in post detail screen that navigates to edit mode
  - [x] 7.2 Create edit post modal/screen reusing `PostEditor` component, pre-filled with existing data
  - [x] 7.3 Wire delete button with confirmation alert + `useDeletePost()` mutation
  - [x] 7.4 After edit/delete, navigate back and invalidate caches

- [x] Task 8: Image upload integration (AC: #2)
  - [x] 8.1 Wire `PostEditor`'s image picker button to `expo-image-picker` for camera/gallery selection
  - [x] 8.2 Upload selected images using existing `useMediaUpload()` hook with `context: "post"`
  - [x] 8.3 Display uploaded image thumbnails in editor
  - [x] 8.4 Include image URLs in `createPost` payload

## Dev Notes

### Backend API Contract (Existing — Do NOT modify backend)

The web backend API is fully implemented. The mobile app consumes these endpoints:

**Journal Endpoints:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/journal?page=1&limit=20&date=YYYY-MM-DD` | Get private posts grouped by date |
| GET | `/api/v1/journal/streak` | Get current and longest streak |

**Post CRUD Endpoints:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/posts` | Create post (`{ content, isPrivate, images }`) |
| GET | `/api/v1/posts/:postId` | Get single post |
| PATCH | `/api/v1/posts/:postId` | Update post (`{ content?, isPrivate?, images? }`) |
| DELETE | `/api/v1/posts/:postId` | Delete post |

**Reaction Endpoints:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/posts/:postId/reactions` | Toggle reaction (`{ emoji }`) |
| GET | `/api/v1/posts/:postId/reactions` | Get reactions list |

**Allowed Reaction Emojis:** `👍`, `❤️`, `😂`, `😮`, `😢`, `🎉`

**Response Shapes:**

Journal response:
```json
{
  "groups": [{ "date": "2026-02-10", "posts": [{ "id", "content", "isPrivate", "images", "userId", "createdAt", "updatedAt" }] }],
  "pagination": { "page", "limit", "total", "totalPages", "hasNextPage", "hasPreviousPage" }
}
```

Streak response:
```json
{ "currentStreak": 5, "longestStreak": 12, "lastPostDate": "2026-02-10" }
```

Create post request:
```json
{ "content": "HTML string (sanitized server-side)", "isPrivate": true, "images": ["url1", "url2"] }
```

**Content Sanitization:** Server allows only: `p, br, strong, em, u, ul, ol, li, h1-h6, blockquote, code, pre, hr`

### Architecture Compliance

- **API Client**: Use existing `lib/api/client.ts` — NEVER create a new client
- **Auth Tokens**: Handled automatically by `ApiClient` (SecureStore + in-memory cache)
- **TanStack Query**: Follow patterns from `use-conversations.ts` and `use-messages.ts`
- **Query Keys**: Add to existing `query-keys.ts` using factory pattern
- **Optimistic Updates**: Use for like/reaction toggle (see `use-reactions.ts` for pattern)
- **Error Handling**: Use `ApiError` class, display via toast
- **Pagination**: Use standard `Pagination` type from `types/pagination.ts`

### Existing Components to Reuse (DO NOT recreate)

| Component | Path | Purpose | What to Change |
|-----------|------|---------|----------------|
| `PostCard` | `components/journal/post-card.tsx` | Private post display | Wire props to real data |
| `PostEditor` | `components/journal/post-editor.tsx` | Rich text editor | Wire formatting + image picker |
| `PostFeed` | `components/journal/post-feed.tsx` | Date-grouped SectionList | Wire to API data |
| `ActionBar` | `components/shared/action-bar.tsx` | Like/Comment/Share actions | Wire handlers to mutations |

### Existing Screens to Modify (replace mock data)

| Screen | Path | Current State | Action |
|--------|------|---------------|--------|
| Journal Index | `app/(protected)/journal/index.tsx` | MOCK_POSTS array | Replace with `useJournalEntries()` |
| Create Post | `app/(protected)/journal/create.tsx` | console.log on publish | Wire `useCreatePost()` + `useMediaUpload()` |
| Post Detail | `app/(protected)/journal/post/[id].tsx` | MOCK_POST + MOCK_COMMENTS | Wire `usePost(id)` |

### New Files to Create

```
apps/expo/
├── types/
│   └── post.ts                          # Post, PostGroup, JournalResponse, StreakResponse, CreatePostInput, UpdatePostInput
└── lib/api/hooks/
    ├── use-journal.ts                   # useJournalEntries() query hook
    ├── use-journal-streak.ts            # useJournalStreak() query hook
    └── use-posts.ts                     # useCreatePost(), useUpdatePost(), useDeletePost(), usePost()
```

Plus additions to existing:
- `lib/api/hooks/query-keys.ts` — add `postKeys` and `journalKeys` factories

### Key Implementation Patterns (from existing hooks)

**Query hook pattern** (follow `use-notifications.ts`):
```typescript
export function useJournalEntries(page = 1, limit = 20, date?: string) {
  return useQuery({
    queryKey: journalKeys.list(page, limit, date),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (date) params.set("date", date);
      return api.get<JournalResponse>(`/api/v1/journal?${params}`);
    },
    staleTime: 1000 * 30,
  });
}
```

**Mutation pattern** (follow `use-messages.ts`):
```typescript
export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) =>
      api.post<Post>("/api/v1/posts", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.all });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
```

**Query key factory pattern** (follow existing `query-keys.ts`):
```typescript
export const journalKeys = {
  all: ["journal"] as const,
  list: (page?: number, limit?: number, date?: string) =>
    [...journalKeys.all, "list", { page, limit, date }] as const,
  streak: () => [...journalKeys.all, "streak"] as const,
};

export const postKeys = {
  all: ["posts"] as const,
  detail: (id: string) => [...postKeys.all, "detail", id] as const,
  reactions: (postId: string) => [...postKeys.all, "reactions", postId] as const,
};
```

**File upload pattern** (reuse `use-media-upload.ts`):
```typescript
// Already exists — use it for post image uploads
const { mutateAsync: uploadMedia, isPending: isUploading } = useMediaUpload();

const handleImagePress = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({ ... });
  if (!result.canceled) {
    const uploaded = await uploadMedia({ uri: result.assets[0].uri, context: "post" });
    setImages(prev => [...prev, uploaded.url]);
  }
};
```

### Library Versions (Already Installed — DO NOT upgrade)

| Library | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | 5.67.3 | Server state management |
| `expo-image-picker` | 16.1.4 | Photo selection |
| `expo-router` | 6.0.21 | File-based routing |
| `expo-secure-store` | 15.0.8 | Auth token storage |
| `nativewind` | 4.1.23 | Tailwind CSS for RN |
| `lucide-react-native` | 0.562.0 | Icons |

### Critical Guardrails

1. **DO NOT modify any backend code** — all APIs are implemented and working
2. **DO NOT create new UI components** — reuse existing `PostCard`, `PostEditor`, `PostFeed`, `ActionBar`
3. **DO NOT install new libraries** — everything needed is already installed
4. **DO NOT use Redux or Zustand** — use TanStack Query for server state, useState for local UI state
5. **Follow NativeWind styling** — all styles via Tailwind classNames, not StyleSheet
6. **Type everything** — no `any`, use proper TypeScript interfaces from `types/post.ts`
7. **Handle loading and error states** — skeleton loaders, toast on error, disabled buttons during mutations
8. **Invalidate caches on mutations** — always invalidate related query keys after create/update/delete
9. **Use `SafeAreaView`** — all screens must respect safe areas
10. **Test on both platforms** — iOS and Android behavior may differ (especially keyboard handling)

### Project Structure Notes

- Alignment with monorepo: Mobile app at `apps/expo/`, shares no code with `apps/nextjs/` except `packages/` (ddd-kit, drizzle, ui)
- API hooks are mobile-specific — web uses Server Actions, mobile uses TanStack Query
- Navigation: Journal screens are in `app/(protected)/journal/` stack with modal routes for create and detail
- Protected layout at `app/(protected)/_layout.tsx` handles auth guard (redirects to register if not authenticated)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 10: Story 10.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Client Strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: apps/expo/lib/api/client.ts — Base API client with token management]
- [Source: apps/expo/lib/api/hooks/use-messages.ts — Reference mutation + optimistic update pattern]
- [Source: apps/expo/lib/api/hooks/use-notifications.ts — Reference query hook pattern]
- [Source: apps/expo/lib/api/hooks/use-media-upload.ts — File upload with progress]
- [Source: apps/expo/lib/api/hooks/query-keys.ts — Query key factory pattern]
- [Source: apps/expo/components/journal/ — Existing PostCard, PostEditor, PostFeed components]
- [Source: apps/expo/app/(protected)/journal/ — Existing screens with mock data to replace]
- [Source: apps/nextjs/app/api/v1/posts/ — Backend API routes]
- [Source: apps/nextjs/app/api/v1/journal/ — Backend journal API routes]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- All 8 tasks completed: types, query hooks, journal index, create, detail, edit, delete, image upload
- All 7 ACs satisfied: journal view, create with images, edit/delete, streak counter, component reuse, empty state, real post detail
- `pnpm fix` passes (1 pre-existing warning: dangerouslySetInnerHTML in nextjs landing page)
- `pnpm type-check` passes (0 errors)
- No new libraries installed, no backend modifications

### File List
**Created:**
- `apps/expo/types/post.ts` — Post, PostGroup, JournalResponse, StreakResponse, CreatePostInput, UpdatePostInput, PostReaction types
- `apps/expo/lib/api/hooks/use-journal.ts` — useJournalEntries() query hook
- `apps/expo/lib/api/hooks/use-journal-streak.ts` — useJournalStreak() query hook
- `apps/expo/lib/api/hooks/use-posts.ts` — usePost(), useCreatePost(), useUpdatePost(), useDeletePost(), useTogglePostReaction()
- `apps/expo/lib/utils/post-format.ts` — Shared formatPostDate(), formatPostTime(), stripHtml() utilities
- `apps/expo/lib/hooks/use-image-picker.ts` — Shared usePostImages() hook (picker + upload + state)
- `apps/expo/app/(protected)/journal/edit/[id].tsx` — Edit post screen (modal)

**Modified:**
- `apps/expo/lib/api/hooks/query-keys.ts` — Added journalKeys and postKeys factories
- `apps/expo/app/(protected)/journal/index.tsx` — useJournalEntries(), useJournalStreak(), useTogglePostReaction(), shared utils
- `apps/expo/app/(protected)/journal/create.tsx` — useCreatePost(), usePostImages(), SafeAreaView from safe-area-context
- `apps/expo/app/(protected)/journal/post/[id].tsx` — usePost(), useTogglePostReaction(), edit/delete buttons, shared utils
- `apps/expo/app/(protected)/journal/_layout.tsx` — Added edit/[id] modal route

### Senior Developer Review (AI)
**Reviewer:** Claude Opus 4.6 | **Date:** 2026-02-10

**Issues Found:** 4 High, 4 Medium, 2 Low
**Issues Fixed:** 8 (all HIGH + all MEDIUM)
**Action Items:** 0

**Fixes Applied:**
- H1: Wired like handlers with useTogglePostReaction() + optimistic local state in index.tsx and post/[id].tsx
- H2: Edit screen now preserves HTML content (no longer strips tags before editing)
- H3: Edit screen sends images array directly (empty array clears images instead of undefined)
- H4: All screens now import SafeAreaView from react-native-safe-area-context consistently
- M1: Extracted formatPostDate/formatPostTime into shared lib/utils/post-format.ts
- M2: Extracted stripHtml into shared lib/utils/post-format.ts
- M3: Extracted image picker logic into shared lib/hooks/use-image-picker.ts (usePostImages hook)
- M4: Documented as known limitation (PostFeed re-groups flattened data, minor perf overhead)

**Remaining LOW issues (not blocking):**
- L1: No unsaved changes warning on navigation away (UX enhancement, future story)
- L2: Streak hidden at 0 days (motivational UX, future story)
