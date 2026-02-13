# Next.js Refactoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Modernize the Next.js app with React Query, Server Actions, cache invalidation, and systematic error/loading boundaries — while keeping all 54 API routes intact for Expo.

**Architecture:** Hybrid approach — Server Actions for form mutations + React Query for interactive mutations & all client queries. Server Components with Suspense for dashboard widgets (already done). `revalidatePath`/`revalidateTag` in Server Actions for server-side cache invalidation.

**Tech Stack:** @tanstack/react-query v5, Next.js 16, React 19, existing DI container + use cases

---

## Phase 1: Foundation

### Task 1: Install @tanstack/react-query

**Files:**
- Modify: `apps/nextjs/package.json`

**Step 1: Install the package**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm add @tanstack/react-query --filter nextjs`

Expected: Package added to dependencies

**Step 2: Verify installation**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm ls @tanstack/react-query --filter nextjs`

Expected: Shows @tanstack/react-query v5.x.x

**Step 3: Commit**

```bash
git add apps/nextjs/package.json pnpm-lock.yaml
git commit -m "chore: add @tanstack/react-query"
```

---

### Task 2: Create QueryClient config + update Providers

**Files:**
- Create: `apps/nextjs/common/query-client.ts`
- Modify: `apps/nextjs/common/providers.tsx`

**Step 1: Create query-client.ts**

```typescript
// apps/nextjs/common/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 300_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
```

**Step 2: Update providers.tsx to wrap with QueryClientProvider**

Replace the full content of `apps/nextjs/common/providers.tsx` with:

```typescript
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, Toaster } from "@packages/ui/index";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { env } from "./env";
import { getQueryClient } from "./query-client";

export default function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme={env.NODE_ENV === "development" ? "light" : "system"}
          enableSystem
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}
```

**Important:** The providers.tsx currently does NOT have `"use client"` — adding it is required because `QueryClientProvider` is a client component. This is safe because providers.tsx is already used as a wrapper in the root layout and only renders its children.

**Step 3: Run format**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix --filter nextjs`

**Step 4: Verify it builds**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm type-check --filter nextjs`

Expected: No errors

**Step 5: Commit**

```bash
git add apps/nextjs/common/query-client.ts apps/nextjs/common/providers.tsx
git commit -m "feat: add React Query provider with default config"
```

---

### Task 3: Create shared API helper + extract ActionResult type

**Files:**
- Create: `apps/nextjs/common/api.ts`
- Create: `apps/nextjs/common/action-result.ts`

**Step 1: Create action-result.ts (shared type for all server actions)**

```typescript
// apps/nextjs/common/action-result.ts
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

**Step 2: Create api.ts (typed fetch wrapper for React Query)**

```typescript
// apps/nextjs/common/api.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      body?.error ?? `Request failed: ${res.status}`,
      res.status,
    );
  }
  return res.json() as Promise<T>;
}
```

**Step 3: Update auth.actions.ts to use shared ActionResult type**

In `apps/nextjs/src/adapters/actions/auth.actions.ts`, replace the local `ActionResult<T>` type with the import:

```typescript
// Remove lines 13-15 (local type definition)
// Add import:
import type { ActionResult } from "@/common/action-result";
```

**Step 4: Run format + type-check**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix --filter nextjs && pnpm type-check --filter nextjs`

**Step 5: Commit**

```bash
git add apps/nextjs/common/api.ts apps/nextjs/common/action-result.ts apps/nextjs/src/adapters/actions/auth.actions.ts
git commit -m "feat: add shared API fetch helper and ActionResult type"
```

---

## Phase 2: React Query Hooks

### Task 4: Create query hooks — posts, feed, journal

**Files:**
- Create: `apps/nextjs/app/(protected)/_hooks/use-posts.ts`
- Create: `apps/nextjs/app/(protected)/_hooks/use-feed.ts`
- Create: `apps/nextjs/app/(protected)/_hooks/use-journal.ts`

**Step 1: Create use-posts.ts**

```typescript
// apps/nextjs/app/(protected)/_hooks/use-posts.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { IGetUserPostsOutputDto } from "@/application/dto/post/get-user-posts.dto";
import type { IGetPostDetailOutputDto } from "@/application/dto/post/get-post-detail.dto";
import { apiFetch } from "@/common/api";

export const postKeys = {
  all: ["posts"] as const,
  list: (page: number) => [...postKeys.all, "list", page] as const,
  detail: (id: string) => [...postKeys.all, "detail", id] as const,
  reactions: (id: string) => [...postKeys.all, "reactions", id] as const,
  comments: (id: string) => [...postKeys.all, "comments", id] as const,
};

export function usePostsQuery(page: number) {
  return useQuery({
    queryKey: postKeys.list(page),
    queryFn: () =>
      apiFetch<IGetUserPostsOutputDto>(`/api/v1/posts?page=${page}&limit=10`),
    staleTime: 30_000,
  });
}

export function usePostDetailQuery(postId: string) {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () =>
      apiFetch<IGetPostDetailOutputDto>(`/api/v1/posts/${postId}`),
  });
}

export function usePostReactionsQuery(postId: string) {
  return useQuery({
    queryKey: postKeys.reactions(postId),
    queryFn: () => apiFetch(`/api/v1/posts/${postId}/reactions`),
  });
}

export function usePostCommentsQuery(postId: string) {
  return useQuery({
    queryKey: postKeys.comments(postId),
    queryFn: () => apiFetch(`/api/v1/posts/${postId}/comments`),
  });
}

export function useTogglePrivacyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      isPrivate,
    }: { postId: string; isPrivate: boolean }) =>
      apiFetch(`/api/v1/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrivate }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useToggleReactionMutation(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emoji: string) =>
      apiFetch(`/api/v1/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.reactions(postId) });
    },
  });
}

export function useAddCommentMutation(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      apiFetch(`/api/v1/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
  });
}

export function useDeleteCommentMutation(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      apiFetch(`/api/v1/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
  });
}

export function useUpdateCommentMutation(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: { commentId: string; content: string }) =>
      apiFetch(`/api/v1/posts/${postId}/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      apiFetch(`/api/v1/posts/${postId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
```

**Step 2: Create use-feed.ts**

```typescript
// apps/nextjs/app/(protected)/_hooks/use-feed.ts
import { useQuery } from "@tanstack/react-query";
import type { IGetFriendFeedOutputDto } from "@/application/dto/feed/get-friend-feed.dto";
import { apiFetch } from "@/common/api";

export const feedKeys = {
  all: ["feed"] as const,
  unified: (page: number) => [...feedKeys.all, "unified", page] as const,
  friends: (page: number) => [...feedKeys.all, "friends", page] as const,
};

export function useUnifiedFeedQuery(page: number) {
  return useQuery({
    queryKey: feedKeys.unified(page),
    queryFn: () =>
      apiFetch<IGetFriendFeedOutputDto>(
        `/api/v1/feed/unified?page=${page}&limit=10`,
      ),
    staleTime: 30_000,
  });
}

export function useFriendFeedQuery(page: number) {
  return useQuery({
    queryKey: feedKeys.friends(page),
    queryFn: () =>
      apiFetch<IGetFriendFeedOutputDto>(
        `/api/v1/feed?page=${page}&limit=20`,
      ),
    staleTime: 30_000,
  });
}
```

**Step 3: Create use-journal.ts**

```typescript
// apps/nextjs/app/(protected)/_hooks/use-journal.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiFetch } from "@/common/api";
import { postKeys } from "./use-posts";

export const journalKeys = {
  all: ["journal"] as const,
  entries: (page: number) => [...journalKeys.all, "entries", page] as const,
  streak: () => [...journalKeys.all, "streak"] as const,
};

export function useJournalEntriesQuery(page = 1) {
  return useQuery({
    queryKey: journalKeys.entries(page),
    queryFn: () => apiFetch(`/api/v1/journal?page=${page}&limit=10`),
  });
}

export function useJournalStreakQuery() {
  return useQuery({
    queryKey: journalKeys.streak(),
    queryFn: () => apiFetch(`/api/v1/journal/streak`),
  });
}

export function useEditJournalEntryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      content,
      images,
    }: { postId: string; content: string; images: string[] }) =>
      apiFetch(`/api/v1/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, images }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.all });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
```

**Step 4: Run format**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix --filter nextjs`

**Step 5: Type-check**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm type-check --filter nextjs`

Note: Some DTO imports may need adjusting if the exact type paths differ. Fix any import errors before proceeding.

**Step 6: Commit**

```bash
git add apps/nextjs/app/\(protected\)/_hooks/
git commit -m "feat: add React Query hooks for posts, feed, journal"
```

---

### Task 5: Create query hooks — mood, gallery, moodboard, settings, notifications

**Files:**
- Create: `apps/nextjs/app/(protected)/_hooks/use-mood.ts`
- Create: `apps/nextjs/app/(protected)/_hooks/use-gallery.ts`
- Create: `apps/nextjs/app/(protected)/_hooks/use-moodboard.ts`
- Create: `apps/nextjs/app/(protected)/_hooks/use-settings.ts`
- Create: `apps/nextjs/app/(protected)/_hooks/use-notifications.ts`

**Step 1: Create use-mood.ts**

```typescript
// apps/nextjs/app/(protected)/_hooks/use-mood.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/common/api";

export const moodKeys = {
  all: ["mood"] as const,
  today: () => [...moodKeys.all, "today"] as const,
  week: () => [...moodKeys.all, "week"] as const,
  stats: () => [...moodKeys.all, "stats"] as const,
  trends: () => [...moodKeys.all, "trends"] as const,
};

export function useTodayMoodQuery() {
  return useQuery({
    queryKey: moodKeys.today(),
    queryFn: () => apiFetch(`/api/v1/mood`),
    staleTime: 60_000,
  });
}

export function useMoodWeekQuery() {
  return useQuery({
    queryKey: moodKeys.week(),
    queryFn: () => apiFetch(`/api/v1/mood/week`),
  });
}

export function useMoodStatsQuery() {
  return useQuery({
    queryKey: moodKeys.stats(),
    queryFn: () => apiFetch(`/api/v1/mood/stats`),
  });
}

export function useMoodTrendsQuery() {
  return useQuery({
    queryKey: moodKeys.trends(),
    queryFn: () => apiFetch(`/api/v1/mood/trends`),
  });
}

export function useRecordMoodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { category: string; intensity: number }) =>
      apiFetch(`/api/v1/mood`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodKeys.all });
    },
  });
}
```

**Step 2: Create use-gallery.ts**

```typescript
// apps/nextjs/app/(protected)/_hooks/use-gallery.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/common/api";

export const galleryKeys = {
  all: ["gallery"] as const,
  list: (page: number) => [...galleryKeys.all, "list", page] as const,
};

export function useGalleryQuery(page: number) {
  return useQuery({
    queryKey: galleryKeys.list(page),
    queryFn: () => apiFetch(`/api/v1/gallery?page=${page}&limit=20`),
  });
}

export function useDeletePhotoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) =>
      apiFetch(`/api/v1/gallery/${photoId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
  });
}

export function useUploadPhotoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const presignRes = await apiFetch<{
        uploadUrl: string;
        fileUrl: string;
      }>(`/api/v1/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      await fetch(presignRes.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      return apiFetch(`/api/v1/gallery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: presignRes.fileUrl }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
  });
}
```

**Step 3: Create use-moodboard.ts**

```typescript
// apps/nextjs/app/(protected)/_hooks/use-moodboard.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/common/api";

export const moodboardKeys = {
  all: ["moodboards"] as const,
  list: (page: number) => [...moodboardKeys.all, "list", page] as const,
  detail: (id: string) => [...moodboardKeys.all, "detail", id] as const,
  pins: (id: string) => [...moodboardKeys.all, "pins", id] as const,
};

export function useMoodboardsQuery(page: number) {
  return useQuery({
    queryKey: moodboardKeys.list(page),
    queryFn: () => apiFetch(`/api/v1/moodboards?page=${page}&limit=20`),
  });
}

export function useMoodboardDetailQuery(id: string) {
  return useQuery({
    queryKey: moodboardKeys.detail(id),
    queryFn: () => apiFetch(`/api/v1/moodboards/${id}`),
    enabled: !!id,
  });
}

export function useDeleteMoodboardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/v1/moodboards/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodboardKeys.all });
    },
  });
}
```

**Step 4: Create use-settings.ts**

```typescript
// apps/nextjs/app/(protected)/_hooks/use-settings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/common/api";

export const settingsKeys = {
  all: ["settings"] as const,
};

export function useSettingsQuery() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: () => apiFetch(`/api/v1/settings`),
    staleTime: 300_000,
  });
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch(`/api/v1/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}
```

**Step 5: Create use-notifications.ts**

```typescript
// apps/nextjs/app/(protected)/_hooks/use-notifications.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/common/api";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

export function useNotificationsQuery() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => apiFetch(`/api/v1/notifications`),
    refetchInterval: 30_000,
  });
}

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => apiFetch<{ count: number }>(`/api/v1/notifications/unread-count`),
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      apiFetch(`/api/v1/notifications/${notificationId}/read`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
```

**Step 6: Run format + type-check**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix --filter nextjs && pnpm type-check --filter nextjs`

Fix any DTO import path issues.

**Step 7: Commit**

```bash
git add apps/nextjs/app/\(protected\)/_hooks/
git commit -m "feat: add React Query hooks for mood, gallery, moodboard, settings, notifications"
```

---

### Task 6: Create query hooks — organization (kanban)

**Files:**
- Create: `apps/nextjs/app/(protected)/_hooks/use-boards.ts`

**Step 1: Create use-boards.ts**

```typescript
// apps/nextjs/app/(protected)/_hooks/use-boards.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/common/api";

export const boardKeys = {
  all: ["boards"] as const,
  list: () => [...boardKeys.all, "list"] as const,
  detail: (id: string) => [...boardKeys.all, "detail", id] as const,
};

export function useBoardsQuery() {
  return useQuery({
    queryKey: boardKeys.list(),
    queryFn: () => apiFetch(`/api/v1/boards`),
  });
}

export function useBoardDetailQuery(id: string) {
  return useQuery({
    queryKey: boardKeys.detail(id),
    queryFn: () => apiFetch(`/api/v1/boards/${id}`),
    enabled: !!id,
  });
}

export function useAddCardMutation(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { columnId: string; title: string }) =>
      apiFetch(`/api/v1/boards/${boardId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
}

export function useMoveCardMutation(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      cardId: string;
      targetColumnId: string;
      position: number;
    }) =>
      apiFetch(`/api/v1/boards/${boardId}/cards/${data.cardId}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetColumnId: data.targetColumnId,
          position: data.position,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
}

export function useAddColumnMutation(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string }) =>
      apiFetch(`/api/v1/boards/${boardId}/columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
}

export function useDeleteBoardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) =>
      apiFetch(`/api/v1/boards/${boardId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}
```

**Step 2: Run format + type-check**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix --filter nextjs && pnpm type-check --filter nextjs`

**Step 3: Commit**

```bash
git add apps/nextjs/app/\(protected\)/_hooks/use-boards.ts
git commit -m "feat: add React Query hooks for boards/kanban"
```

---

## Phase 3: Server Actions

### Task 7: Create Server Actions — post (create/edit)

**Files:**
- Create: `apps/nextjs/src/adapters/actions/post.actions.ts`

**Step 1: Create post.actions.ts**

Read the existing post controller at `src/adapters/controllers/post/post.controller.ts` to understand the exact use case names and DTOs used. Then create matching Server Actions:

```typescript
// apps/nextjs/src/adapters/actions/post.actions.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import type { ActionResult } from "@/common/action-result";
import { getInjection } from "@/common/di/container";
import { authGuard } from "@/adapters/guards/auth.guard";

export async function createPostAction(input: {
  content: string;
  images: string[];
  isPrivate: boolean;
}): Promise<ActionResult<{ id: string }>> {
  const guard = await authGuard();
  if (!guard.authenticated) {
    return { success: false, error: "Non authentifié" };
  }

  const useCase = getInjection("CreatePostUseCase");
  const result = await useCase.execute({
    userId: guard.session.user.id,
    content: input.content,
    images: input.images,
    isPrivate: input.isPrivate,
  });

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  revalidatePath("/journal");
  revalidatePath("/posts");
  revalidatePath("/dashboard");
  revalidatePath("/feed");

  return { success: true, data: result.getValue() };
}

export async function updatePostAction(
  postId: string,
  input: {
    content?: string;
    images?: string[];
    isPrivate?: boolean;
  },
): Promise<ActionResult<{ id: string }>> {
  const guard = await authGuard();
  if (!guard.authenticated) {
    return { success: false, error: "Non authentifié" };
  }

  const useCase = getInjection("UpdatePostUseCase");
  const result = await useCase.execute({
    postId,
    userId: guard.session.user.id,
    ...input,
  });

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  revalidatePath("/journal");
  revalidatePath("/posts");
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/dashboard");

  return { success: true, data: result.getValue() };
}
```

**Important:** The exact use case names (`CreatePostUseCase`, `UpdatePostUseCase`) and their input shapes must match what's registered in the DI container. Read `src/adapters/controllers/post/post.controller.ts` to confirm the exact names and input types. Adjust the action code accordingly.

**Step 2: Run format + type-check**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix --filter nextjs && pnpm type-check --filter nextjs`

Fix any issues (use case name, DTO shape, auth guard signature).

**Step 3: Commit**

```bash
git add apps/nextjs/src/adapters/actions/post.actions.ts
git commit -m "feat: add Server Actions for post create/update with revalidation"
```

---

### Task 8: Create Server Actions — mood, settings, profile, gallery, moodboard

**Files:**
- Create: `apps/nextjs/src/adapters/actions/mood.actions.ts`
- Create: `apps/nextjs/src/adapters/actions/settings.actions.ts`
- Create: `apps/nextjs/src/adapters/actions/profile.actions.ts`
- Create: `apps/nextjs/src/adapters/actions/gallery.actions.ts`
- Create: `apps/nextjs/src/adapters/actions/moodboard.actions.ts`

**Pattern:** Each action follows the same pattern as Task 7:
1. `"use server"` directive
2. `authGuard()` check
3. `getInjection("UseCaseName")`
4. `useCase.execute(input)`
5. `revalidatePath()`/`revalidateTag()` on success
6. Return `ActionResult<T>`

**Step 1: Create each action file**

For each file, read the corresponding controller to find:
- The exact use case name registered in DI
- The exact input DTO shape
- Which paths to revalidate

Reference files to read:
- `src/adapters/controllers/mood/` → mood.actions.ts
- `src/adapters/controllers/settings/` or similar → settings.actions.ts
- `src/adapters/controllers/profile/` → profile.actions.ts
- `src/adapters/controllers/gallery/` → gallery.actions.ts
- `src/adapters/controllers/moodboard/` → moodboard.actions.ts

**Revalidation map:**
- mood.actions.ts → `revalidatePath("/mood")`, `revalidatePath("/dashboard")`
- settings.actions.ts → `revalidatePath("/settings")`
- profile.actions.ts → `revalidatePath("/profile")`
- gallery.actions.ts → `revalidatePath("/gallery")`, `revalidatePath("/dashboard")`
- moodboard.actions.ts → `revalidatePath("/moodboard")`, `revalidatePath("/dashboard")`

**Step 2: Run format + type-check**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix --filter nextjs && pnpm type-check --filter nextjs`

**Step 3: Commit**

```bash
git add apps/nextjs/src/adapters/actions/
git commit -m "feat: add Server Actions for mood, settings, profile, gallery, moodboard"
```

---

## Phase 4: Migrate Client Components

### Task 9: Migrate read-only lists — FeedList, PostsList, FriendFeed, MoodboardGrid

**Files:**
- Modify: `apps/nextjs/app/(protected)/feed/_components/feed-list.tsx`
- Modify: `apps/nextjs/app/(protected)/posts/_components/posts-list.tsx`
- Modify: `apps/nextjs/app/(protected)/social/_components/friend-feed.tsx`
- Modify: `apps/nextjs/app/(protected)/moodboard/_components/moodboard-grid.tsx`

**Migration pattern for each file:**

1. Remove `useState` for data/loading/error
2. Remove `useCallback` + `useEffect` fetch function
3. Replace with the corresponding `useQuery` hook
4. Use `{ data, isLoading, error }` destructuring
5. Keep the JSX rendering logic intact
6. For components with mutations (PostsList toggle), add `useMutation`

**Example: FeedList migration**

Before (current):
```typescript
const [data, setData] = useState<IGetFriendFeedOutputDto | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [page, setPage] = useState(1);

const fetchFeed = useCallback(async (currentPage: number) => { ... }, []);
useEffect(() => { fetchFeed(page); }, [page, fetchFeed]);
```

After:
```typescript
const [page, setPage] = useState(1);
const { data, isLoading, error } = useUnifiedFeedQuery(page);
```

Then update the JSX conditions:
- `loading` → `isLoading`
- `error` → `error?.message`
- `!data || data.data.length === 0` → `!data || data.data.length === 0` (same)

**For PostsList specifically:**
```typescript
const [page, setPage] = useState(1);
const { data, isLoading, error } = usePostsQuery(page);
const togglePrivacy = useTogglePrivacyMutation();

// In the onClick handler:
onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();
  togglePrivacy.mutate({ postId: post.id, isPrivate: !post.isPrivate });
}}
```

**Step 1:** Migrate each file following the pattern above.

**Step 2: Run format + type-check**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix --filter nextjs && pnpm type-check --filter nextjs`

**Step 3: Commit**

```bash
git add apps/nextjs/app/\(protected\)/feed/ apps/nextjs/app/\(protected\)/posts/ apps/nextjs/app/\(protected\)/social/ apps/nextjs/app/\(protected\)/moodboard/
git commit -m "refactor: migrate read-only lists to React Query"
```

---

### Task 10: Migrate PostDetail component

**Files:**
- Modify: `apps/nextjs/app/(protected)/posts/[postId]/_components/post-detail.tsx`

**This is the most complex migration.** Current component has 13 useState calls and multiple fetch operations.

**Step 1: Replace all fetch-based state with React Query hooks**

```typescript
// Replace manual state with:
const { data, isLoading, error } = usePostDetailQuery(postId);
const { data: reactions } = usePostReactionsQuery(postId);
const { data: comments } = usePostCommentsQuery(postId);

const toggleReaction = useToggleReactionMutation(postId);
const addComment = useAddCommentMutation(postId);
const deleteComment = useDeleteCommentMutation(postId);
const updateComment = useUpdateCommentMutation(postId);
const deletePost = useDeletePostMutation();

// Keep local UI state:
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [commentText, setCommentText] = useState("");
const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
const [editingCommentText, setEditingCommentText] = useState("");
```

**Step 2: Replace mutation handlers**

```typescript
// Before: await fetch(...); fetchReactions();
// After:
function handleToggleReaction(emoji: string) {
  toggleReaction.mutate(emoji);
}

function handleSubmitComment() {
  if (!commentText.trim()) return;
  addComment.mutate(commentText, {
    onSuccess: () => setCommentText(""),
  });
}

function handleDeleteComment(commentId: string) {
  deleteComment.mutate(commentId);
}

function handleUpdateComment(commentId: string) {
  updateComment.mutate(
    { commentId, content: editingCommentText },
    { onSuccess: () => { setEditingCommentId(null); setEditingCommentText(""); } },
  );
}

function handleDelete() {
  deletePost.mutate(postId, {
    onSuccess: () => router.back(),
  });
}
```

**Step 3: Remove all useCallback/useEffect for fetching**

Delete the `fetchPost`, `fetchReactions`, `fetchComments` functions and their corresponding `useEffect` calls.

**Step 4: Run format + type-check**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix --filter nextjs && pnpm type-check --filter nextjs`

**Step 5: Commit**

```bash
git add apps/nextjs/app/\(protected\)/posts/
git commit -m "refactor: migrate PostDetail to React Query with mutation hooks"
```

---

### Task 11: Migrate form components to Server Actions — CreatePostForm, EditPostForm

**Files:**
- Modify: `apps/nextjs/app/(protected)/posts/new/_components/create-post-form.tsx`
- Modify: `apps/nextjs/app/(protected)/posts/[postId]/edit/_components/edit-post-form.tsx`

**Step 1: Migrate CreatePostForm**

Replace the manual `fetch("/api/v1/posts", { method: "POST" })` with `createPostAction`:

```typescript
import { createPostAction } from "@/adapters/actions/post.actions";

// In handleSubmit:
async function handleSubmit(data: { html: string; images: string[] }) {
  setIsSubmitting(true);
  setError(null);
  try {
    const result = await createPostAction({
      content: data.html,
      images: data.images,
      isPrivate,
    });
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push(`/posts/${result.data.id}`);
  } catch {
    setError("Erreur lors de la création");
  } finally {
    setIsSubmitting(false);
  }
}
```

**Step 2: Migrate EditPostForm similarly**

Replace `fetch(`/api/v1/posts/${postId}`, { method: "PATCH" })` with `updatePostAction`.

For the initial load of the post data, use `usePostDetailQuery(postId)` instead of manual fetch + useEffect.

**Step 3: Run format + type-check**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix --filter nextjs && pnpm type-check --filter nextjs`

**Step 4: Commit**

```bash
git add apps/nextjs/app/\(protected\)/posts/
git commit -m "refactor: migrate post forms to Server Actions + React Query"
```

---

### Task 12: Migrate forms — MoodForm, SettingsForm, GalleryGrid, GalleryUpload

**Files:**
- Modify: `apps/nextjs/app/(protected)/mood/_components/mood-form.tsx`
- Modify: `apps/nextjs/app/(protected)/settings/_components/settings-form.tsx`
- Modify: `apps/nextjs/app/(protected)/gallery/_components/gallery-grid.tsx`
- Modify: `apps/nextjs/app/(protected)/gallery/_components/gallery-upload.tsx`

**Migration pattern:**

**MoodForm:**
- GET `/api/v1/mood` → `useTodayMoodQuery()`
- POST `/api/v1/mood` → `useRecordMoodMutation()`

**SettingsForm:**
- GET `/api/v1/settings` → `useSettingsQuery()`
- PATCH `/api/v1/settings` → `useUpdateSettingsMutation()`

**GalleryGrid:**
- GET `/api/v1/gallery` → `useGalleryQuery(page)`
- DELETE `/api/v1/gallery/${id}` → `useDeletePhotoMutation()`

**GalleryUpload:**
- Multi-step upload → `useUploadPhotoMutation()`

**Step 1:** Apply each migration following the pattern from Task 9/10.

**Step 2: Run format + type-check**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix --filter nextjs && pnpm type-check --filter nextjs`

**Step 3: Commit**

```bash
git add apps/nextjs/app/\(protected\)/mood/ apps/nextjs/app/\(protected\)/settings/ apps/nextjs/app/\(protected\)/gallery/
git commit -m "refactor: migrate mood, settings, gallery to React Query"
```

---

### Task 13: Migrate complex components — JournalEntries, KanbanBoardView

**Files:**
- Modify: `apps/nextjs/app/(protected)/journal/_components/journal-entries.tsx`
- Modify: `apps/nextjs/app/(protected)/organization/_components/kanban-board-view.tsx`

**JournalEntries:**
- GET → `useJournalEntriesQuery()`
- PATCH toggle privacy → `useTogglePrivacyMutation()` from use-posts
- PATCH edit → `useEditJournalEntryMutation()`
- Remove `window.addEventListener("journal:post-created")` — replaced by React Query cache invalidation (when createPostAction calls `revalidatePath("/journal")`, the server component re-renders and React Query stale data gets refetched)

**KanbanBoardView:**
- This component already receives board data as props from a server component parent
- Migrate only the mutation calls:
  - `useAddCardMutation(boardId)`
  - `useMoveCardMutation(boardId)`
  - `useAddColumnMutation(boardId)`
  - `useDeleteBoardMutation()`
- Keep the local DnD state management (columns, activeCard) since it's optimistic UI for drag-and-drop

**Step 1:** Apply migrations.

**Step 2: Run format + type-check**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix --filter nextjs && pnpm type-check --filter nextjs`

**Step 3: Commit**

```bash
git add apps/nextjs/app/\(protected\)/journal/ apps/nextjs/app/\(protected\)/organization/
git commit -m "refactor: migrate journal entries and kanban to React Query"
```

---

### Task 14: Migrate JournalWidgetClient — dashboard mutation

**Files:**
- Modify: `apps/nextjs/app/(protected)/dashboard/_components/journal-widget-client.tsx`

**Step 1:** Replace the manual `fetch("/api/v1/posts", { method: "POST" })` in `handleSubmit` with:

```typescript
import { createPostAction } from "@/adapters/actions/post.actions";

async function handleSubmit(data: { html: string; images: string[] }) {
  const result = await createPostAction({
    content: data.html,
    images: data.images,
    isPrivate: false,
  });
  if (!result.success) {
    throw new Error(result.error);
  }
  setOpen(false);
  // No need for router.refresh() — revalidatePath in the action handles it
}
```

**Step 2:** Remove `router.refresh()` call and `useRouter` import if no longer needed.

**Step 3: Run format + type-check**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix --filter nextjs && pnpm type-check --filter nextjs`

**Step 4: Commit**

```bash
git add apps/nextjs/app/\(protected\)/dashboard/
git commit -m "refactor: migrate journal widget to Server Action"
```

---

## Phase 5: Error & Loading Boundaries

### Task 15: Add loading.tsx for all protected routes

**Files to create (one per route group):**
- `apps/nextjs/app/(protected)/dashboard/loading.tsx`
- `apps/nextjs/app/(protected)/feed/loading.tsx`
- `apps/nextjs/app/(protected)/gallery/loading.tsx`
- `apps/nextjs/app/(protected)/journal/loading.tsx`
- `apps/nextjs/app/(protected)/mood/loading.tsx`
- `apps/nextjs/app/(protected)/moodboard/loading.tsx`
- `apps/nextjs/app/(protected)/organization/loading.tsx`
- `apps/nextjs/app/(protected)/posts/loading.tsx`
- `apps/nextjs/app/(protected)/profile/loading.tsx`
- `apps/nextjs/app/(protected)/rewards/loading.tsx`
- `apps/nextjs/app/(protected)/settings/loading.tsx`
- `apps/nextjs/app/(protected)/social/loading.tsx`

**Template for each loading.tsx:**

```typescript
export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Note:** Customize the skeleton shape per route if needed (dashboard = 3-col grid, journal = list, etc.), but a generic skeleton is fine as a starting point.

**Step 1:** Create all loading.tsx files.

**Step 2: Run format**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix --filter nextjs`

**Step 3: Commit**

```bash
git add apps/nextjs/app/\(protected\)/*/loading.tsx
git commit -m "feat: add loading.tsx skeleton for all protected routes"
```

---

### Task 16: Add error.tsx for all protected routes

**Files to create:** Same list as Task 15, but `error.tsx` instead of `loading.tsx`.

**Template for each error.tsx:**

```typescript
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-16">
      <h2 className="mb-4 text-xl font-semibold">
        Une erreur est survenue
      </h2>
      <p className="mb-6 text-muted-foreground">
        {error.message || "Quelque chose s'est mal passé."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-homecafe-pink px-6 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Réessayer
      </button>
    </div>
  );
}
```

**Step 1:** Create all error.tsx files.

**Step 2: Run format**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix --filter nextjs`

**Step 3: Commit**

```bash
git add apps/nextjs/app/\(protected\)/*/error.tsx
git commit -m "feat: add error.tsx boundaries for all protected routes"
```

---

## Phase 6: Verification

### Task 17: Run full verification suite

**Step 1: Run all checks**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm check:all`

**Step 2: Fix any issues**

Common expected issues:
- Unused imports (from removed useState/useEffect/useCallback) → remove them
- Type mismatches in DTO imports → adjust import paths
- Biome formatting → run `pnpm fix`

**Step 3: Run type-check specifically**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm type-check --filter nextjs`

**Step 4: Run tests**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm test`

Expected: All existing tests pass (we haven't changed domain/application layer)

**Step 5: Final commit**

```bash
git add -A
git commit -m "fix: resolve lint and type-check issues from React Query migration"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| **1. Foundation** | 1-3 | Install React Query, providers, shared utilities |
| **2. Hooks** | 4-6 | React Query hooks for all domains |
| **3. Server Actions** | 7-8 | Server Actions for form mutations with revalidation |
| **4. Migration** | 9-14 | Migrate 13 client components |
| **5. Boundaries** | 15-16 | loading.tsx + error.tsx for 12 routes |
| **6. Verification** | 17 | Full lint, type-check, tests |

**Total: 17 tasks, ~10 commits**

**Key files preserved (for Expo):** All 54 API routes under `app/api/v1/` remain untouched.
