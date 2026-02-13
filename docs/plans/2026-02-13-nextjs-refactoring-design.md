# Next.js Refactoring Design

## Context

The Next.js app has 54 API routes, no React Query, no caching strategy, minimal Server Actions (auth only), and inconsistent data fetching patterns. The app is also consumed by a mobile Expo app (clone of web), so API routes must be preserved.

## Approach: Progressive Enhancement (Hybrid)

Modernize the Next.js frontend layer by layer while keeping API routes intact for Expo.

### Core Decisions

1. **Server Actions** for form-based mutations (create post, settings, profile, gallery, boards, moodboards)
2. **React Query `useMutation`** for interactive mutations (likes, comments, reactions, friend requests, notifications, kanban drag)
3. **React Query `useQuery`** for all client-side data fetching (replaces manual useState/useEffect/fetch)
4. **Server Components + direct queries** for dashboard widgets (keep existing pattern, add Suspense)
5. **`revalidatePath`/`revalidateTag`** in Server Actions for server-side cache invalidation
6. **Systematic `loading.tsx` + `error.tsx`** for every route group
7. **API routes preserved** for Expo consumption

### Infrastructure

- `QueryClientProvider` added to `common/providers.tsx`
- `common/query-client.ts` with config: `staleTime: 60_000`, `gcTime: 300_000`
- Custom hooks in `app/(protected)/_hooks/` per domain
- Server Actions in `src/adapters/actions/` per domain

### Cache Strategy

| Domain | Approach | Revalidation |
|--------|----------|-------------|
| Posts/Feed | React Query staleTime: 30s | revalidateTag('posts') |
| Journal | Server Component + query | revalidatePath('/journal') |
| Profile | React Query staleTime: 5min | revalidateTag('profile') |
| Dashboard | Server Components + Suspense | revalidatePath('/dashboard') |
| Notifications | React Query refetchInterval: 30s | Polling |
| Mood | React Query staleTime: 1min | revalidateTag('mood') |

### Migration Targets

**Server Actions (formulaires):**
- Create/edit post, settings, profile edit, board/card creation, gallery upload, moodboard creation

**React Query mutations (interactions):**
- Likes/reactions, comments, friend requests, notification read, card move

**React Query queries (lectures):**
- PostsList, FeedList, MoodboardWidget, NotificationsList, JournalWidgetClient, SettingsForm

### File Structure

```
apps/nextjs/
├── common/
│   ├── providers.tsx           + QueryClientProvider
│   └── query-client.ts         NEW
├── src/adapters/actions/       NEW: Server Actions
│   ├── post.actions.ts
│   ├── profile.actions.ts
│   ├── gallery.actions.ts
│   ├── board.actions.ts
│   └── moodboard.actions.ts
├── app/(protected)/
│   ├── _hooks/                 NEW: React Query hooks
│   │   ├── use-posts.ts
│   │   ├── use-journal.ts
│   │   ├── use-feed.ts
│   │   ├── use-notifications.ts
│   │   └── use-mood.ts
│   ├── */loading.tsx           NEW per route
│   └── */error.tsx             NEW per route
```
