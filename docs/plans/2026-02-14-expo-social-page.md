# Expo Social Page — Exact Web Parity

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reproduce the web social page (`apps/nextjs/app/(protected)/social/`) identically in the Expo mobile app — same features, same data, same interactions.

**Architecture:** ScrollView with two stacked sections (feed + gallery) matching the web's mobile responsive layout (1 column). New React Query hooks call the existing API endpoints (`/api/v1/feed/unified`, `/api/v1/feed/gallery`, `/api/v1/gallery/:photoId`). New components replicate the web's visual design using NativeWind.

**Tech Stack:** React Native, Expo Router, NativeWind, React Query, Lucide React Native

---

## Existing Resources

**API endpoints (already exist — DO NOT MODIFY):**
- `GET /api/v1/feed/unified?page=N&limit=N` → `FeedResponse` (data[], hasFriends, pagination)
- `GET /api/v1/feed/gallery?page=N&limit=N` → `{ photos: FeedGalleryPhotoDto[], pagination }`
- `PATCH /api/v1/posts/:postId` with `{ isPrivate: boolean }` → toggle post privacy
- `POST /api/v1/posts/:postId/reactions` with `{ emoji: "heart" }` → toggle reaction
- `PATCH /api/v1/gallery/:photoId` with `{ isPrivate: boolean }` → toggle photo privacy

**Existing Expo code to reuse:**
- `types/post.ts` — `FeedPost`, `FeedResponse`, `FeedPostAuthor` types ✅
- `lib/api/hooks/use-posts.ts` — `useTogglePostReaction`, `useUpdatePost` ✅
- `lib/api/hooks/query-keys.ts` — `feedKeys`, `postKeys`, `galleryKeys` ✅
- `lib/api/client.ts` — `api.get()`, `api.patch()`, `api.post()` ✅
- `lib/utils/post-format.ts` — `formatPostDate`, `formatPostTime`, `stripHtml`, `truncate` ✅
- `components/shared/action-bar.tsx` — NOT used in web social (web has simpler inline reactions)
- `src/config/colors.ts` — all brand colors ✅

**Web source files (READ ONLY — do not modify):**
- `apps/nextjs/app/(protected)/social/page.tsx` — 2 sections: SocialFeed + SocialGallery
- `apps/nextjs/app/(protected)/social/_components/social-feed.tsx` — feed unified + FeedPostCard
- `apps/nextjs/app/(protected)/social/_components/social-gallery.tsx` — masonry gallery
- `apps/nextjs/app/(protected)/social/gallery/page.tsx` — full gallery page
- `apps/nextjs/app/(protected)/social/gallery/_components/public-gallery-grid.tsx` — grid layout
- `apps/nextjs/app/(protected)/social/gallery/_components/public-gallery-header.tsx` — header + upload

---

### Task 1: Add feed gallery types

**Files:**
- Modify: `apps/expo/types/gallery.ts`

**Step 1: Add FeedGalleryPhotoDto and FeedGalleryResponse types**

Add at the end of `apps/expo/types/gallery.ts`:

```typescript
export interface FeedGalleryPhotoDto {
  photoId: string | null;
  postId: string | null;
  url: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  createdAt: string;
}

export interface FeedGalleryResponse {
  photos: FeedGalleryPhotoDto[];
  pagination: {
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}
```

**Step 2: Run type-check**

Run: `cd apps/expo && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No new errors

**Step 3: Commit**

```bash
git add apps/expo/types/gallery.ts
git commit -m "feat(expo): add feed gallery types for social page"
```

---

### Task 2: Add query keys for unified feed and feed gallery

**Files:**
- Modify: `apps/expo/lib/api/hooks/query-keys.ts`

**Step 1: Add feedGalleryKeys to query-keys.ts**

Add after the existing `feedKeys` block:

```typescript
export const feedGalleryKeys = {
  all: ["feed-gallery"] as const,
  list: (page?: number, limit?: number) =>
    [...feedGalleryKeys.all, "list", { page, limit }] as const,
};
```

Also add a `unified` entry to the existing `feedKeys`:

```typescript
export const feedKeys = {
  all: ["feed"] as const,
  list: (page?: number, limit?: number) =>
    [...feedKeys.all, "list", { page, limit }] as const,
  unified: (page?: number, limit?: number) =>
    [...feedKeys.all, "unified", { page, limit }] as const,
};
```

**Step 2: Run type-check**

Run: `cd apps/expo && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No new errors

**Step 3: Commit**

```bash
git add apps/expo/lib/api/hooks/query-keys.ts
git commit -m "feat(expo): add unified feed and feed gallery query keys"
```

---

### Task 3: Create useUnifiedFeed hook

**Files:**
- Create: `apps/expo/lib/api/hooks/use-unified-feed.ts`

**Step 1: Write the hook**

```typescript
import { useQuery } from "@tanstack/react-query";
import type { FeedResponse } from "@/types/post";
import { api } from "../client";
import { feedKeys } from "./query-keys";

export function useUnifiedFeed(page = 1, limit = 10) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return useQuery({
    queryKey: feedKeys.unified(page, limit),
    queryFn: () => api.get<FeedResponse>(`/api/v1/feed/unified?${params}`),
    staleTime: 1000 * 30,
  });
}
```

**Why `useQuery` not `useInfiniteQuery`:** The web version uses page-based pagination with Prev/Next buttons (not infinite scroll). Match that behavior.

**Step 2: Run type-check**

Run: `cd apps/expo && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No new errors

**Step 3: Commit**

```bash
git add apps/expo/lib/api/hooks/use-unified-feed.ts
git commit -m "feat(expo): add useUnifiedFeed hook"
```

---

### Task 4: Create useFeedGallery hook

**Files:**
- Create: `apps/expo/lib/api/hooks/use-feed-gallery.ts`

**Step 1: Write the hook**

```typescript
import { useQuery } from "@tanstack/react-query";
import type { FeedGalleryResponse } from "@/types/gallery";
import { api } from "../client";
import { feedGalleryKeys } from "./query-keys";

export function useFeedGallery(page = 1, limit = 10) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return useQuery({
    queryKey: feedGalleryKeys.list(page, limit),
    queryFn: () =>
      api.get<FeedGalleryResponse>(`/api/v1/feed/gallery?${params}`),
    staleTime: 1000 * 60,
  });
}
```

**Step 2: Run type-check**

Run: `cd apps/expo && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No new errors

**Step 3: Commit**

```bash
git add apps/expo/lib/api/hooks/use-feed-gallery.ts
git commit -m "feat(expo): add useFeedGallery hook"
```

---

### Task 5: Create useTogglePhotoPrivacy hook

**Files:**
- Create: `apps/expo/lib/api/hooks/use-toggle-photo-privacy.ts`

**Step 1: Write the hook**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { feedGalleryKeys, feedKeys, galleryKeys } from "./query-keys";

export function useTogglePhotoPrivacy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ photoId, isPrivate }: { photoId: string; isPrivate: boolean }) =>
      api.patch<{ id: string; isPrivate: boolean }>(
        `/api/v1/gallery/${photoId}`,
        { isPrivate },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      queryClient.invalidateQueries({ queryKey: feedGalleryKeys.all });
    },
  });
}
```

**Step 2: Run type-check**

Run: `cd apps/expo && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No new errors

**Step 3: Commit**

```bash
git add apps/expo/lib/api/hooks/use-toggle-photo-privacy.ts
git commit -m "feat(expo): add useTogglePhotoPrivacy hook"
```

---

### Task 6: Create useTogglePostPrivacy hook

**Files:**
- Create: `apps/expo/lib/api/hooks/use-toggle-post-privacy.ts`

**Step 1: Write the hook**

The web uses `useTogglePrivacyMutation` which does `PATCH /api/v1/posts/:postId` with `{ isPrivate: true }`. Expo already has `useUpdatePost` in `use-posts.ts` but it doesn't invalidate `feedGalleryKeys`. Create a dedicated hook:

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Post } from "@/types/post";
import { api } from "../client";
import {
  feedGalleryKeys,
  feedKeys,
  journalKeys,
  postKeys,
} from "./query-keys";

export function useTogglePostPrivacy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, isPrivate }: { postId: string; isPrivate: boolean }) =>
      api.patch<Post>(`/api/v1/posts/${postId}`, { isPrivate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      queryClient.invalidateQueries({ queryKey: journalKeys.all });
      queryClient.invalidateQueries({ queryKey: feedGalleryKeys.all });
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}
```

**Step 2: Run type-check**

Run: `cd apps/expo && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No new errors

**Step 3: Commit**

```bash
git add apps/expo/lib/api/hooks/use-toggle-post-privacy.ts
git commit -m "feat(expo): add useTogglePostPrivacy hook"
```

---

### Task 7: Create SocialFeedCard component

**Files:**
- Create: `apps/expo/components/social/social-feed-card.tsx`

**Step 1: Write the component**

This replicates the web's `FeedPostCard` from `social-feed.tsx`. Key features:
- Date heading (formatted French: "vendredi 14 février 2026")
- Author avatar + name + time + reaction count
- Post content truncated to 150 chars (HTML stripped)
- Thumbnail image (first image, 64x64)
- Globe toggle privacy button (emerald-500, owner only)
- Heart reaction button (red when active)

```typescript
import { Globe, Heart, User } from "lucide-react-native";
import { Image, Pressable, Text, View, type ViewProps } from "react-native";
import { cn } from "@/src/libs/utils";

interface SocialFeedCardProps extends ViewProps {
  dateHeading: string;
  authorName: string;
  authorAvatar: string | null;
  time: string;
  content: string;
  thumbnailUrl: string | null;
  reactionCount: number;
  hasReacted: boolean;
  isOwn: boolean;
  isBouncing: boolean;
  onPress: () => void;
  onTogglePrivacy: () => void;
  onToggleReaction: () => void;
}

export function SocialFeedCard({
  dateHeading,
  authorName,
  authorAvatar,
  time,
  content,
  thumbnailUrl,
  reactionCount,
  hasReacted,
  isOwn,
  isBouncing,
  onPress,
  onTogglePrivacy,
  onToggleReaction,
  className,
  ...props
}: SocialFeedCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "rounded-xl border-4 border-homecafe-green/20 bg-card p-4",
        className,
      )}
      {...props}
    >
      {/* Date heading + actions */}
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-base font-semibold capitalize text-foreground">
          {dateHeading}
        </Text>
        <View className="flex-row items-center gap-1.5">
          {isOwn && (
            <Pressable
              onPress={onTogglePrivacy}
              className="h-8 w-8 items-center justify-center rounded-full bg-emerald-500"
              style={isBouncing ? { transform: [{ scale: 1.25 }] } : undefined}
            >
              <Globe size={16} color="#fff" />
            </Pressable>
          )}
          <Pressable
            onPress={onToggleReaction}
            className={cn(
              "h-8 w-8 items-center justify-center rounded-full",
              hasReacted ? "bg-red-50" : "bg-muted",
            )}
          >
            <Heart
              size={16}
              color={hasReacted ? "#EF4444" : "#9CA3AF"}
              fill={hasReacted ? "#EF4444" : "transparent"}
            />
          </Pressable>
        </View>
      </View>

      {/* Author info line */}
      <View className="mb-2 flex-row items-center gap-2">
        {authorAvatar ? (
          <Image
            source={{ uri: authorAvatar }}
            className="h-5 w-5 rounded-full bg-muted"
          />
        ) : (
          <View className="h-5 w-5 items-center justify-center rounded-full bg-homecafe-pink/20">
            <User size={12} color="#F691C3" />
          </View>
        )}
        <Text className="text-xs text-muted-foreground">{authorName}</Text>
        <Text className="text-xs text-muted-foreground">·</Text>
        <Text className="text-xs text-muted-foreground">{time}</Text>
        {reactionCount > 0 && (
          <>
            <Text className="text-xs text-muted-foreground">·</Text>
            <Text className="text-xs text-muted-foreground">
              {reactionCount} ❤️
            </Text>
          </>
        )}
      </View>

      {/* Content + thumbnail */}
      <View className="flex-row gap-3">
        <Text className="flex-1 text-sm leading-6 text-foreground">
          {content}
        </Text>
        {thumbnailUrl && (
          <Image
            source={{ uri: thumbnailUrl }}
            className="h-16 w-16 shrink-0 rounded-lg bg-muted"
            resizeMode="cover"
          />
        )}
      </View>
    </Pressable>
  );
}
```

**Step 2: Run type-check**

Run: `cd apps/expo && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No new errors

**Step 3: Format**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix`

**Step 4: Commit**

```bash
git add apps/expo/components/social/social-feed-card.tsx
git commit -m "feat(expo): add SocialFeedCard component matching web design"
```

---

### Task 8: Create SocialFeed component

**Files:**
- Create: `apps/expo/components/social/social-feed.tsx`

**Step 1: Write the component**

This replicates the web's `SocialFeed` component from `social-feed.tsx`. Features:
- Card with header "Derniers posts publics" / "Tes posts et ceux de tes amis"
- Expand icon linking to /feed (on web — skip on mobile or link to friend feed tab)
- List of FeedPostCard with toggle privacy + reactions
- Pagination (Précédent / Suivant) buttons
- Loading skeletons
- Error state
- Empty states (no friends / no posts)

```typescript
import { type Href, useRouter } from "expo-router";
import { Maximize2 } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAuth } from "@/src/providers/auth-provider";
import { useUnifiedFeed } from "@/lib/api/hooks/use-unified-feed";
import { useTogglePostReaction } from "@/lib/api/hooks/use-posts";
import { useTogglePostPrivacy } from "@/lib/api/hooks/use-toggle-post-privacy";
import {
  formatPostDate,
  formatPostTime,
  stripHtml,
  truncate,
} from "@/lib/utils/post-format";
import { SocialFeedCard } from "./social-feed-card";
import { colors } from "@/src/config/colors";

export function SocialFeed() {
  const router = useRouter();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useUnifiedFeed(page);
  const togglePrivacy = useTogglePostPrivacy();
  const toggleReaction = useTogglePostReaction();
  const [bouncingIds, setBouncingIds] = useState<Set<string>>(new Set());
  const [localLikes, setLocalLikes] = useState<Record<string, boolean>>({});
  const [localCounts, setLocalCounts] = useState<Record<string, number>>({});

  function bounce(postId: string) {
    setBouncingIds((prev) => new Set(prev).add(postId));
    setTimeout(() => {
      setBouncingIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }, 400);
  }

  function handleTogglePrivacy(postId: string) {
    bounce(postId);
    togglePrivacy.mutate({ postId, isPrivate: true });
  }

  function handleToggleReaction(
    postId: string,
    currentlyReacted: boolean,
    currentCount: number,
  ) {
    setLocalLikes((prev) => ({ ...prev, [postId]: !currentlyReacted }));
    setLocalCounts((prev) => ({
      ...prev,
      [postId]: currentlyReacted ? currentCount - 1 : currentCount + 1,
    }));
    toggleReaction.mutate({ postId, emoji: "heart" });
  }

  const isLiked = (postId: string, serverReacted: boolean) =>
    localLikes[postId] ?? serverReacted;

  const likesCount = (postId: string, serverCount: number) =>
    localCounts[postId] ?? serverCount;

  return (
    <View className="rounded-lg border border-border/60 bg-card">
      {/* Header */}
      <View className="flex-row items-start justify-between p-4 pb-2">
        <View>
          <Text className="text-xl font-semibold text-foreground">
            Derniers posts publics
          </Text>
          <Text className="text-sm text-muted-foreground">
            Tes posts et ceux de tes amis
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="px-4 pb-4">
        {isLoading && (
          <View className="gap-4">
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                className="h-32 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </View>
        )}

        {error && (
          <View className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
            <Text className="text-center text-destructive">
              {error.message}
            </Text>
          </View>
        )}

        {!isLoading && !error && data && data.data.length === 0 && (
          <View className="rounded-xl border-4 border-homecafe-green/20 p-8">
            <Text className="text-center text-sm text-muted-foreground">
              {data.hasFriends
                ? "Aucun post public pour le moment"
                : "Ajoute des amis pour voir leurs posts ici !"}
            </Text>
            {!data.hasFriends && (
              <Pressable
                onPress={() =>
                  router.push("/(protected)/friends" as Href)
                }
                className="mt-3 self-center rounded-full bg-homecafe-pink px-4 py-1.5"
              >
                <Text className="text-sm font-medium text-white">
                  Mon profil
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {!isLoading && !error && data && data.data.length > 0 && (
          <View className="gap-3">
            {data.data.map((post) => {
              const reacted = isLiked(post.id, post.hasReacted);
              const count = likesCount(post.id, post.reactionCount);
              return (
                <SocialFeedCard
                  key={post.id}
                  dateHeading={formatPostDate(post.createdAt)}
                  authorName={
                    post.author.displayName ?? post.author.name
                  }
                  authorAvatar={post.author.avatarUrl}
                  time={formatPostTime(post.createdAt)}
                  content={truncate(stripHtml(post.content), 150)}
                  thumbnailUrl={
                    post.images.length > 0
                      ? (post.images[0] as string)
                      : null
                  }
                  reactionCount={count}
                  hasReacted={reacted}
                  isOwn={post.author.id === user?.id}
                  isBouncing={bouncingIds.has(post.id)}
                  onPress={() =>
                    router.push(
                      `/(protected)/(tabs)/journal/post/${post.id}` as Href,
                    )
                  }
                  onTogglePrivacy={() =>
                    handleTogglePrivacy(post.id)
                  }
                  onToggleReaction={() =>
                    handleToggleReaction(post.id, reacted, count)
                  }
                />
              );
            })}

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <View className="flex-row items-center justify-center gap-4 pt-4">
                <Pressable
                  onPress={() => setPage((p) => p - 1)}
                  disabled={!data.pagination.hasPreviousPage}
                  className={cn(
                    "rounded-lg border border-border px-3 py-1.5",
                    !data.pagination.hasPreviousPage && "opacity-40",
                  )}
                >
                  <Text className="text-sm text-foreground">
                    Précédent
                  </Text>
                </Pressable>
                <Text className="text-sm text-muted-foreground">
                  {data.pagination.page} / {data.pagination.totalPages}
                </Text>
                <Pressable
                  onPress={() => setPage((p) => p + 1)}
                  disabled={!data.pagination.hasNextPage}
                  className={cn(
                    "rounded-lg border border-border px-3 py-1.5",
                    !data.pagination.hasNextPage && "opacity-40",
                  )}
                >
                  <Text className="text-sm text-foreground">
                    Suivant
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
```

**Note:** Remove the local `cn` if `@/src/libs/utils` already exports it (it does — use that import instead).

**Step 2: Run type-check**

Run: `cd apps/expo && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No new errors

**Step 3: Format**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix`

**Step 4: Commit**

```bash
git add apps/expo/components/social/social-feed.tsx
git commit -m "feat(expo): add SocialFeed component with unified feed, reactions, privacy toggle"
```

---

### Task 9: Create SocialGallery component

**Files:**
- Create: `apps/expo/components/social/social-gallery.tsx`

**Step 1: Write the component**

Replicates the web's `SocialGallery`. Features:
- Card with header "Galerie" / "Les photos publiques de toi et tes amis"
- Masonry-like grid (2 columns using FlatList with numColumns)
- Toggle privacy (Globe button, emerald-500) for own photos
- "Voir plus" button linking to gallery page
- Placeholder cells with Mountain icon while loading / empty

```typescript
import { type Href, useRouter } from "expo-router";
import { Globe, Mountain } from "lucide-react-native";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { useAuth } from "@/src/providers/auth-provider";
import { useFeedGallery } from "@/lib/api/hooks/use-feed-gallery";
import { useTogglePostPrivacy } from "@/lib/api/hooks/use-toggle-post-privacy";
import { useTogglePhotoPrivacy } from "@/lib/api/hooks/use-toggle-photo-privacy";
import { colors } from "@/src/config/colors";

const COLUMN_GAP = 8;
const PADDING = 16;
const screenWidth = Dimensions.get("window").width;
const columnWidth = (screenWidth - PADDING * 2 - COLUMN_GAP) / 2;

function PlaceholderCell() {
  return (
    <View
      className="items-center justify-center rounded-md bg-homecafe-beige"
      style={{ width: columnWidth, height: columnWidth * 0.75 }}
    >
      <Mountain size={24} color={colors.mutedForeground} />
    </View>
  );
}

export function SocialGallery() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading } = useFeedGallery(1, 10);
  const togglePostPrivacy = useTogglePostPrivacy();
  const togglePhotoPrivacy = useTogglePhotoPrivacy();
  const [bouncingIds, setBouncingIds] = useState<Set<string>>(new Set());
  const photos = data?.photos ?? [];

  function bounce(id: string) {
    setBouncingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setBouncingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 400);
  }

  function handleTogglePostPrivacy(postId: string) {
    bounce(postId);
    togglePostPrivacy.mutate({ postId, isPrivate: true });
  }

  function handleTogglePhotoPrivacy(photoId: string) {
    bounce(photoId);
    togglePhotoPrivacy.mutate({ photoId, isPrivate: true });
  }

  return (
    <View className="rounded-lg border border-border/60 bg-card">
      {/* Header */}
      <View className="p-4 pb-2">
        <Text className="text-xl font-semibold text-foreground">Galerie</Text>
        <Text className="text-sm text-muted-foreground">
          Les photos publiques de toi et tes amis
        </Text>
      </View>

      {/* Content */}
      <View className="px-4 pb-4">
        {(isLoading || photos.length === 0) && (
          <View className="flex-row flex-wrap gap-2">
            <PlaceholderCell />
            <PlaceholderCell />
            <PlaceholderCell />
            <PlaceholderCell />
          </View>
        )}

        {!isLoading && photos.length > 0 && (
          <View className="flex-row flex-wrap gap-2">
            {photos.map((photo, index) => {
              const isOwn = photo.authorId === user?.id;
              const bounceKey = photo.postId ?? photo.photoId ?? "";
              const isBouncing = bouncingIds.has(bounceKey);

              return (
                <Pressable
                  key={`${photo.postId ?? photo.photoId ?? index}-${photo.url}`}
                  onPress={() => {
                    if (photo.postId) {
                      router.push(
                        `/(protected)/(tabs)/journal/post/${photo.postId}` as Href,
                      );
                    }
                  }}
                  style={{ width: columnWidth }}
                  className="relative overflow-hidden rounded-md bg-muted"
                >
                  <Image
                    source={{ uri: photo.url }}
                    style={{ width: columnWidth, height: columnWidth * 0.75 }}
                    resizeMode="cover"
                  />
                  {isOwn && (
                    <Pressable
                      onPress={() => {
                        if (photo.postId) {
                          handleTogglePostPrivacy(photo.postId);
                        } else if (photo.photoId) {
                          handleTogglePhotoPrivacy(photo.photoId);
                        }
                      }}
                      className="absolute top-1.5 right-1.5 h-8 w-8 items-center justify-center rounded-full bg-emerald-500"
                      style={
                        isBouncing
                          ? { transform: [{ scale: 1.25 }] }
                          : undefined
                      }
                    >
                      <Globe size={16} color="#fff" />
                    </Pressable>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* "Voir plus" link */}
        {photos.length > 0 && (
          <Pressable
            onPress={() =>
              router.push("/(protected)/(tabs)/social/gallery" as Href)
            }
            className="mt-4 self-start rounded-full bg-homecafe-pink px-4 py-1.5"
          >
            <Text className="text-sm font-medium text-white">Voir plus</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
```

**Step 2: Run type-check**

Run: `cd apps/expo && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No new errors

**Step 3: Format**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix`

**Step 4: Commit**

```bash
git add apps/expo/components/social/social-gallery.tsx
git commit -m "feat(expo): add SocialGallery component with masonry grid and privacy toggle"
```

---

### Task 10: Rewrite social page (index.tsx)

**Files:**
- Modify: `apps/expo/app/(protected)/(tabs)/social/index.tsx`

**Step 1: Replace the entire file**

The new page is a simple ScrollView that stacks SocialFeed + SocialGallery, matching the web's mobile responsive layout:

```typescript
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { SocialFeed } from "@/components/social/social-feed";
import { SocialGallery } from "@/components/social/social-gallery";
import { useQueryClient } from "@tanstack/react-query";
import { feedKeys } from "@/lib/api/hooks/query-keys";

export default function SocialScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: feedKeys.all });
    await queryClient.invalidateQueries({ queryKey: ["feed-gallery"] });
    setRefreshing(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 px-4">
        <Text className="mb-4 text-2xl font-bold text-foreground">Social</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24, gap: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#F691C3"
              colors={["#F691C3"]}
            />
          }
        >
          <SocialFeed />
          <SocialGallery />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
```

**Step 2: Run type-check**

Run: `cd apps/expo && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No new errors

**Step 3: Format**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix`

**Step 4: Commit**

```bash
git add apps/expo/app/(protected)/(tabs)/social/index.tsx
git commit -m "feat(expo): rewrite social page with unified feed + gallery (web parity)"
```

---

### Task 11: Create gallery page

**Files:**
- Create: `apps/expo/app/(protected)/(tabs)/social/gallery.tsx`
- Modify: `apps/expo/app/(protected)/(tabs)/social/_layout.tsx`

**Step 1: Update the layout to register the gallery screen**

```typescript
import { Stack } from "expo-router";

export default function SocialLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="gallery" />
    </Stack>
  );
}
```

**Step 2: Create the gallery page**

Replicates `PublicGalleryHeader` + `PublicGalleryGrid` from web. Features:
- Header: "Galerie publique" + subtitle + back button
- Grid: 2 columns, paginated, with author overlay on photos
- Toggle privacy for own photos
- Prev/Next pagination

```typescript
import { type Href, useRouter } from "expo-router";
import { ArrowLeft, Globe, Mountain, User } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/providers/auth-provider";
import { useFeedGallery } from "@/lib/api/hooks/use-feed-gallery";
import { useTogglePostPrivacy } from "@/lib/api/hooks/use-toggle-post-privacy";
import { useTogglePhotoPrivacy } from "@/lib/api/hooks/use-toggle-photo-privacy";
import { colors } from "@/src/config/colors";

const COLUMN_GAP = 12;
const PADDING = 16;
const screenWidth = Dimensions.get("window").width;
const columnWidth = (screenWidth - PADDING * 2 - COLUMN_GAP) / 2;
const ROW_HEIGHT = 128;

const TALL_POSITIONS = new Set([0, 5]);
function isTall(index: number): boolean {
  return TALL_POSITIONS.has(index % 6);
}

export default function PublicGalleryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useFeedGallery(page, 20);
  const togglePostPrivacy = useTogglePostPrivacy();
  const togglePhotoPrivacy = useTogglePhotoPrivacy();
  const [bouncingIds, setBouncingIds] = useState<Set<string>>(new Set());
  const photos = data?.photos ?? [];

  function bounce(id: string) {
    setBouncingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setBouncingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 400);
  }

  function handleTogglePostPrivacy(postId: string) {
    bounce(postId);
    togglePostPrivacy.mutate({ postId, isPrivate: true });
  }

  function handleTogglePhotoPrivacy(photoId: string) {
    bounce(photoId);
    togglePhotoPrivacy.mutate({ photoId, isPrivate: true });
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: PADDING, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-muted"
            >
              <ArrowLeft size={20} color={colors.foreground} />
            </Pressable>
            <View>
              <Text className="text-2xl font-semibold text-foreground">
                Galerie publique
              </Text>
              <Text className="text-sm text-muted-foreground">
                Toutes les photos publiques de toi et tes amis
              </Text>
            </View>
          </View>
        </View>

        {/* Loading */}
        {isLoading && !data && (
          <View className="flex-row flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View
                key={i}
                className="animate-pulse rounded-xl bg-muted"
                style={{
                  width: columnWidth,
                  height: isTall(i - 1) ? ROW_HEIGHT * 2 : ROW_HEIGHT,
                }}
              />
            ))}
          </View>
        )}

        {/* Error */}
        {error && (
          <View className="rounded-xl border border-red-200 bg-red-50 p-6">
            <Text className="text-center text-sm text-red-700">
              {error.message}
            </Text>
          </View>
        )}

        {/* Empty */}
        {!isLoading && !error && photos.length === 0 && (
          <View className="items-center rounded-xl bg-homecafe-beige/30 p-12">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-homecafe-beige">
              <Mountain size={32} color={colors.mutedForeground} />
            </View>
            <Text className="font-medium text-foreground">
              Aucune photo publique pour le moment
            </Text>
            <Text className="mt-1 text-center text-sm text-muted-foreground">
              Les photos des posts publics de toi et tes amis apparaîtront ici
            </Text>
          </View>
        )}

        {/* Gallery Grid */}
        {!isLoading && photos.length > 0 && (
          <View className="flex-row flex-wrap gap-3">
            {photos.map((photo, index) => {
              const isOwn = photo.authorId === user?.id;
              const bounceKey = photo.postId ?? photo.photoId ?? "";
              const isBouncing = bouncingIds.has(bounceKey);
              const tall = isTall(index);

              return (
                <Pressable
                  key={`${photo.postId ?? photo.photoId ?? index}-${photo.url}`}
                  onPress={() => {
                    if (photo.postId) {
                      router.push(
                        `/(protected)/(tabs)/journal/post/${photo.postId}` as Href,
                      );
                    }
                  }}
                  style={{
                    width: columnWidth,
                    height: tall ? ROW_HEIGHT * 2 + COLUMN_GAP : ROW_HEIGHT,
                  }}
                  className="relative overflow-hidden rounded-xl bg-muted"
                >
                  <Image
                    source={{ uri: photo.url }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />

                  {/* Author overlay (always visible on mobile — no hover) */}
                  <View className="absolute inset-x-0 bottom-0 flex-row items-center gap-1.5 bg-black/40 p-2">
                    {photo.authorAvatar ? (
                      <Image
                        source={{ uri: photo.authorAvatar }}
                        className="h-[18px] w-[18px] rounded-full"
                      />
                    ) : (
                      <View className="h-[18px] w-[18px] items-center justify-center rounded-full bg-white/30">
                        <User size={10} color="#fff" />
                      </View>
                    )}
                    <Text className="text-xs font-medium text-white">
                      {photo.authorName}
                    </Text>
                  </View>

                  {/* Privacy toggle */}
                  {isOwn && (
                    <Pressable
                      onPress={() => {
                        if (photo.postId) {
                          handleTogglePostPrivacy(photo.postId);
                        } else if (photo.photoId) {
                          handleTogglePhotoPrivacy(photo.photoId);
                        }
                      }}
                      className="absolute top-2 right-2 h-8 w-8 items-center justify-center rounded-full bg-emerald-500"
                      style={
                        isBouncing
                          ? { transform: [{ scale: 1.25 }] }
                          : undefined
                      }
                    >
                      <Globe size={16} color="#fff" />
                    </Pressable>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* "Voir plus" button */}
        {data?.pagination.hasNextPage && (
          <Pressable
            onPress={() => setPage((p) => p + 1)}
            disabled={isLoading}
            className="mt-6 self-center rounded-lg border border-border px-4 py-2"
          >
            <Text className="text-sm text-foreground">
              Voir plus de photos
            </Text>
          </Pressable>
        )}

        {/* Prev/Next pagination */}
        {page > 1 && (
          <View className="mt-4 flex-row items-center justify-center gap-4">
            <Pressable
              onPress={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-border px-3 py-1.5"
              style={page <= 1 ? { opacity: 0.4 } : undefined}
            >
              <Text className="text-sm text-foreground">Précédent</Text>
            </Pressable>
            <Text className="text-sm text-muted-foreground">Page {page}</Text>
            <Pressable
              onPress={() => setPage((p) => p + 1)}
              disabled={!data?.pagination.hasNextPage}
              className="rounded-lg border border-border px-3 py-1.5"
              style={
                !data?.pagination.hasNextPage ? { opacity: 0.4 } : undefined
              }
            >
              <Text className="text-sm text-foreground">Suivant</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
```

**Step 3: Run type-check**

Run: `cd apps/expo && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No new errors

**Step 4: Format**

Run: `cd /home/axel/DEV/eva-homecafe-app && pnpm fix`

**Step 5: Commit**

```bash
git add apps/expo/app/(protected)/(tabs)/social/_layout.tsx apps/expo/app/(protected)/(tabs)/social/gallery.tsx
git commit -m "feat(expo): add public gallery page with grid, privacy toggle, pagination"
```

---

### Task 12: Test on device and fix issues

**Step 1: Start the dev server**

Run: `cd apps/expo && npx expo start`

**Step 2: Manual testing checklist**

- [ ] Social tab shows "Social" title
- [ ] Pull-to-refresh works
- [ ] SocialFeed card shows: date heading, avatar, author name, time, reaction count, truncated content, thumbnail
- [ ] Reaction ❤️ toggle works (optimistic update)
- [ ] Globe privacy toggle works on own posts (bounces)
- [ ] Pagination Prev/Next works
- [ ] Empty state shows when no friends / no posts
- [ ] SocialGallery shows 2-column grid of photos
- [ ] Globe privacy toggle works on own photos
- [ ] "Voir plus" navigates to gallery page
- [ ] Gallery page shows header with back button
- [ ] Gallery grid shows author overlay
- [ ] Gallery pagination works
- [ ] Pressing a post photo navigates to post detail

**Step 3: Fix any issues found**

**Step 4: Final commit**

```bash
git add -A
git commit -m "fix(expo): address social page testing feedback"
```

---

## Feature Parity Checklist (Web vs Expo)

| Feature | Web | Expo |
|---------|-----|------|
| Unified feed (user + friends) | ✅ `/api/v1/feed/unified` | ✅ Task 3+8 |
| Feed post card (date, author, content, image) | ✅ FeedPostCard | ✅ Task 7 |
| Heart reaction toggle (optimistic) | ✅ | ✅ Task 8 |
| Globe privacy toggle (bounce) | ✅ | ✅ Task 7+8 |
| Feed pagination (Prev/Next) | ✅ | ✅ Task 8 |
| Empty states (no friends / no posts) | ✅ | ✅ Task 8 |
| Gallery masonry grid | ✅ columns-2 | ✅ Task 9 (flex-wrap 2col) |
| Gallery photo privacy toggle | ✅ | ✅ Task 9 |
| "Voir plus" link to full gallery | ✅ | ✅ Task 9 |
| Full gallery page | ✅ /social/gallery | ✅ Task 11 |
| Gallery tall/short positions | ✅ isTall(index%6) | ✅ Task 11 |
| Gallery author overlay | ✅ hover effect | ✅ Task 11 (always visible) |
| Gallery "Voir plus de photos" + pagination | ✅ | ✅ Task 11 |
| Loading skeletons | ✅ | ✅ Tasks 8+9+11 |
| Error states | ✅ | ✅ Tasks 8+11 |
| Pull-to-refresh | N/A (web) | ✅ Task 10 |
