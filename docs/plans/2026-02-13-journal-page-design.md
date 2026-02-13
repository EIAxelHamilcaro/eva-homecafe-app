# Journal Page Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the `/journal` page to match the Figma mockup (node 584-8740) — two-column layout with header, chronological posts, gallery sidebar, and badges section.

**Architecture:** Rewrite `journal/page.tsx` as a server component orchestrating 4 sections: header (client, with create dialog), entries list (client, restyled), gallery (server), badges (server). Reuse existing API routes, queries, and `RichTextEditor` component.

**Tech Stack:** Next.js 16 server/client components, shadcn/ui (Card, Dialog, Button), Tailwind 4, existing homecafe design tokens.

---

## Reference Files

| File | Purpose |
|------|---------|
| `apps/nextjs/app/(protected)/journal/page.tsx` | Current page (MODIFY) |
| `apps/nextjs/app/(protected)/journal/_components/journal-entries.tsx` | Current entries list (MODIFY) |
| `apps/nextjs/app/(protected)/journal/_components/streak-counter.tsx` | Current streak (REMOVE standalone) |
| `apps/nextjs/app/(protected)/dashboard/_components/journal-widget-client.tsx` | Dialog pattern to reuse |
| `apps/nextjs/app/(protected)/dashboard/_components/gallery-widget.tsx` | Gallery pattern to adapt |
| `apps/nextjs/src/adapters/queries/reward-collection.query.ts` | Badge/sticker queries |
| `apps/nextjs/src/adapters/queries/gallery.query.ts` | Gallery query |
| `apps/nextjs/app/_components/rich-text-editor.tsx` | Rich text editor to reuse |
| `packages/ui/src/styles/globals.css` | Design tokens (homecafe-*) |

## Color Reference (from globals.css)

- `homecafe-green`: #04a056 (header date accent, entry card borders)
- `homecafe-pink`: #f691c3 (action buttons "Voir plus", "Voir tout")
- `homecafe-beige`: #fdecce (gallery placeholder bg)
- `homecafe-cream`: #fff8f0

## Existing API Routes

- `GET /api/v1/journal?page=1&limit=20&date=YYYY-MM-DD` → journal entries grouped by date
- `GET /api/v1/journal/streak` → current/longest streak
- `GET /api/v1/rewards/stickers` → user sticker collection
- `GET /api/v1/rewards/badges` → user badge collection
- `POST /api/v1/posts` → create post (with `createdAt`, `isPrivate`, `images`)
- Gallery: `getUserGallery(userId, page, limit)` (server-only query, no API route)

---

### Task 1: Create `journal-gallery.tsx` (Server Component)

**Files:**
- Create: `apps/nextjs/app/(protected)/journal/_components/journal-gallery.tsx`

**Step 1: Write the component**

Adapt `dashboard/_components/gallery-widget.tsx` for the journal page. Show 5 photos in a 2-column grid (2+2+1 layout like Figma). Use shadcn `Card`.

```tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import { Mountain } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getUserGallery } from "@/adapters/queries/gallery.query";

interface JournalGalleryProps {
  userId: string;
}

export async function JournalGallery({ userId }: JournalGalleryProps) {
  let result: Awaited<ReturnType<typeof getUserGallery>>;
  try {
    result = await getUserGallery(userId, 1, 5);
  } catch {
    return <GalleryEmpty />;
  }

  if (result.photos.length === 0) return <GalleryEmpty />;

  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle>Galerie</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tes plus belles photos, c&apos;est ici !
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {result.photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-md bg-muted"
            >
              <Image
                src={photo.url}
                alt={photo.caption ?? photo.filename}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 150px"
              />
            </div>
          ))}
        </div>
        <Link
          href="/gallery"
          className="mt-4 inline-block rounded-full bg-homecafe-pink px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          Voir plus
        </Link>
      </CardContent>
    </Card>
  );
}

function GalleryEmpty() {
  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle>Galerie</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tes plus belles photos, c&apos;est ici !
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {["a", "b", "c", "d", "e"].map((id) => (
            <div
              key={id}
              className="flex aspect-square items-center justify-center rounded-md bg-homecafe-beige"
            >
              <Mountain className="h-8 w-8 text-homecafe-beige/0 stroke-white" />
            </div>
          ))}
        </div>
        <Link
          href="/gallery"
          className="mt-4 inline-block rounded-full bg-homecafe-pink px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          Voir plus
        </Link>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Run format check**

Run: `pnpm fix`

**Step 3: Commit**

```bash
git add apps/nextjs/app/(protected)/journal/_components/journal-gallery.tsx
git commit -m "feat(journal): add gallery sidebar component"
```

---

### Task 2: Create `journal-badges.tsx` (Server Component)

**Files:**
- Create: `apps/nextjs/app/(protected)/journal/_components/journal-badges.tsx`

**Step 1: Write the component**

Fetch badges via `getUserBadgeCollection()` (server-only query). Display earned badges with their icons. Show "Voir tout" button.

```tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { getUserBadgeCollection } from "@/adapters/queries/reward-collection.query";

interface JournalBadgesProps {
  userId: string;
}

export async function JournalBadges({ userId }: JournalBadgesProps) {
  let badges: Awaited<ReturnType<typeof getUserBadgeCollection>>;
  try {
    badges = await getUserBadgeCollection(userId);
  } catch {
    return null;
  }

  const earnedBadges = badges.filter((b) => b.earned);

  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle>Badges</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tous les badges que tu as obtenu en tenant un journal régulier
        </p>
      </CardHeader>
      <CardContent>
        {earnedBadges.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Continue d&apos;écrire pour gagner ton premier badge !
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {earnedBadges.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center gap-1">
                {badge.iconUrl ? (
                  <Image
                    src={badge.iconUrl}
                    alt={badge.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-homecafe-yellow/20 text-3xl">
                    🏆
                  </div>
                )}
                <span className="text-xs font-medium">{badge.name}</span>
              </div>
            ))}
          </div>
        )}
        <Link
          href="/rewards"
          className="mt-4 inline-block rounded-full bg-homecafe-pink px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          Voir tout
        </Link>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Run format check**

Run: `pnpm fix`

**Step 3: Commit**

```bash
git add apps/nextjs/app/(protected)/journal/_components/journal-badges.tsx
git commit -m "feat(journal): add badges sidebar component"
```

---

### Task 3: Create `journal-header.tsx` (Client Component)

**Files:**
- Create: `apps/nextjs/app/(protected)/journal/_components/journal-header.tsx`

**Step 1: Write the component**

This is the top section with: big date display (green accent), stickers zone, avatar + "Ajouter un post" button that opens a dialog with `RichTextEditor`. Reuse the dialog pattern from `JournalWidgetClient`.

```tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import { Globe, Lock, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { RichTextEditor } from "@/app/_components/rich-text-editor";
import type { RewardCollectionItemDto } from "@/adapters/queries/reward-collection.query";

interface JournalHeaderProps {
  userName: string;
  userImage: string | null;
  today: string; // YYYY-MM-DD
}

function getLocalDateParts(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString("fr-FR", { month: "long" }),
    dateLabel: date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  };
}

export function JournalHeader({
  userName,
  userImage,
  today,
}: JournalHeaderProps) {
  const [open, setOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);
  const [stickers, setStickers] = useState<RewardCollectionItemDto[]>([]);
  const router = useRouter();
  const { day, month, dateLabel } = getLocalDateParts(today);

  const fetchStickers = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/rewards/stickers");
      if (!res.ok) return;
      const data = (await res.json()) as RewardCollectionItemDto[];
      setStickers(data.filter((s) => s.earned));
    } catch {
      /* empty */
    }
  }, []);

  useEffect(() => {
    fetchStickers();
  }, [fetchStickers]);

  async function handleSubmit(data: { html: string; images: string[] }) {
    const res = await fetch("/api/v1/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: data.html,
        isPrivate,
        images: data.images,
        createdAt: today,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(
        (body as { error?: string } | null)?.error ??
          "Erreur lors de la sauvegarde",
      );
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Date display */}
      <div className="flex h-24 w-28 flex-col items-center justify-center rounded-xl bg-homecafe-green text-white">
        <span className="text-xs font-medium">{month}</span>
        <span className="text-4xl font-bold leading-none">{day}</span>
      </div>

      {/* Stickers zone */}
      {stickers.length > 0 && (
        <div className="flex h-24 items-center gap-2 rounded-xl bg-homecafe-cream px-4">
          {stickers.slice(0, 5).map((sticker) =>
            sticker.iconUrl ? (
              <Image
                key={sticker.id}
                src={sticker.iconUrl}
                alt={sticker.name}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                unoptimized
              />
            ) : (
              <span key={sticker.id} className="text-2xl">
                ⭐
              </span>
            ),
          )}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Avatar + "Ajouter un post" */}
      <div className="flex items-center gap-3">
        {userImage ? (
          <Image
            src={userImage}
            alt={userName}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-homecafe-pink-light">
            <User size={22} className="text-homecafe-pink" />
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-border bg-background px-6 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
        >
          Ajouter un post
        </button>
      </div>

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogTitle className="sr-only">Écrire dans le journal</DialogTitle>
          <div className="flex items-center gap-3">
            {userImage ? (
              <Image
                src={userImage}
                alt={userName}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-homecafe-pink-light">
                <User size={22} className="text-homecafe-pink" />
              </div>
            )}
            <div>
              <p className="font-semibold">{userName}</p>
              <p className="text-sm capitalize text-muted-foreground">
                {dateLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate((v) => !v)}
              title={
                isPrivate
                  ? "Privé — cliquer pour rendre public"
                  : "Public — cliquer pour rendre privé"
              }
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                isPrivate
                  ? "bg-homecafe-blue text-white"
                  : "bg-emerald-500 text-white"
              }`}
            >
              {isPrivate ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
            </button>
          </div>
          <RichTextEditor initialContent="" onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

**Step 2: Run format check**

Run: `pnpm fix`

**Step 3: Commit**

```bash
git add apps/nextjs/app/(protected)/journal/_components/journal-header.tsx
git commit -m "feat(journal): add header with date, stickers, and create dialog"
```

---

### Task 4: Restyle `journal-entries.tsx`

**Files:**
- Modify: `apps/nextjs/app/(protected)/journal/_components/journal-entries.tsx`

**Step 1: Rewrite the component**

Restyle to match Figma: wrap in a Card with "Derniers posts" title, expand icon top-right. Each entry has green dashed border, French date/time, lock/unlock icon, text preview.

Key changes from current:
- Wrap in shadcn `Card` with header
- Entry cards: `border border-dashed border-homecafe-green/40 rounded-xl p-4`
- Date format: "Lundi 11 août 2025" (French locale)
- Time: "20h59" format
- Lock/unlock icon instead of "Journal" badge
- Add `Maximize2` icon in header linking to `/posts`
- Remove `DateNavigator` from inside this component (move to page level if needed)

```tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import { Lock, Maximize2, Unlock } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { IGetJournalEntriesOutputDto } from "@/application/dto/journal/get-journal-entries.dto";
import { stripHtml, truncate } from "@/common/utils/text";

function formatDateHeading(dateStr: string): string {
  const match = /^\d{4}-\d{2}-\d{2}$/.exec(dateStr);
  if (!match) return dateStr;
  const date = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}h${m}`;
}

export function JournalEntries() {
  const [data, setData] = useState<IGetJournalEntriesOutputDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchEntries = useCallback(async (currentPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", "20");

      const res = await fetch(`/api/v1/journal?${params.toString()}`);
      if (!res.ok) {
        try {
          const err = (await res.json()) as { error?: string };
          setError(err.error ?? "Impossible de charger les entrées");
        } catch {
          setError("Impossible de charger les entrées");
        }
        return;
      }
      const json = (await res.json()) as IGetJournalEntriesOutputDto;
      setData(json);
    } catch {
      setError("Impossible de charger les entrées");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries(page);
  }, [page, fetchEntries]);

  return (
    <Card className="border-0">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Derniers posts</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tes posts sont classés de manière chronologique
          </p>
        </div>
        <Link href="/posts" className="text-muted-foreground hover:text-foreground">
          <Maximize2 className="h-5 w-5" />
        </Link>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && (!data || data.groups.length === 0) && (
          <div className="rounded-xl border border-dashed border-homecafe-green/40 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Aucune entrée pour le moment
            </p>
          </div>
        )}

        {!loading && !error && data && data.groups.length > 0 && (
          <div className="space-y-4">
            {data.groups.map((group) =>
              group.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-xl border border-dashed border-homecafe-green/40 p-4 transition-colors hover:bg-accent/50"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold capitalize">
                        {formatDateHeading(group.date)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(post.createdAt)}
                      </p>
                    </div>
                    {post.isPrivate ? (
                      <Lock className="h-5 w-5 text-homecafe-green" />
                    ) : (
                      <Unlock className="h-5 w-5 text-homecafe-green" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {truncate(stripHtml(post.content), 200)}
                  </p>
                </Link>
              )),
            )}

            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  type="button"
                  disabled={!data.pagination.hasPreviousPage}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Précédent
                </button>
                <span className="text-sm text-muted-foreground">
                  {data.pagination.page} / {data.pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={!data.pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Step 2: Run format check**

Run: `pnpm fix`

**Step 3: Verify build compiles**

Run: `pnpm type-check`

**Step 4: Commit**

```bash
git add apps/nextjs/app/(protected)/journal/_components/journal-entries.tsx
git commit -m "feat(journal): restyle entries to match Figma with green dashed borders"
```

---

### Task 5: Rewrite `journal/page.tsx` — Two-Column Layout

**Files:**
- Modify: `apps/nextjs/app/(protected)/journal/page.tsx`

**Step 1: Rewrite the page**

Server component with two-column responsive grid. Pass session data to header, userId to server components.

```tsx
import { Suspense } from "react";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { JournalBadges } from "./_components/journal-badges";
import { JournalEntries } from "./_components/journal-entries";
import { JournalGallery } from "./_components/journal-gallery";
import { JournalHeader } from "./_components/journal-header";

function getLocalToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function WidgetSkeleton() {
  return <div className="h-48 animate-pulse rounded-xl bg-muted" />;
}

export default async function JournalPage() {
  const session = await requireAuth();
  const userId = session.user.id;
  const today = getLocalToday();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <JournalHeader
        userName={session.user.name}
        userImage={session.user.image}
        today={today}
      />

      {/* Two-column layout */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: Posts (2/3) */}
        <div className="lg:col-span-2">
          <JournalEntries />
        </div>

        {/* Right column: Gallery + Badges (1/3) */}
        <div className="flex flex-col gap-6">
          <Suspense fallback={<WidgetSkeleton />}>
            <JournalGallery userId={userId} />
          </Suspense>
          <Suspense fallback={<WidgetSkeleton />}>
            <JournalBadges userId={userId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Delete `streak-counter.tsx`** (functionality merged into header date display)

The streak counter was a standalone component. The date display in the header now serves as the visual anchor. If streak display is wanted later, it can be added back as part of the header.

**Step 3: Run format check**

Run: `pnpm fix`

**Step 4: Run type check**

Run: `pnpm type-check`

**Step 5: Run full check**

Run: `pnpm check`

**Step 6: Commit**

```bash
git add apps/nextjs/app/(protected)/journal/
git commit -m "feat(journal): redesign page with two-column layout matching Figma"
```

---

### Task 6: Visual QA & Polish

**Step 1: Run dev server and visually compare**

Run: `pnpm dev`

Open `http://localhost:3000/journal` and compare with Figma node 584-8740.

Check:
- [ ] Header: green date box, stickers, avatar, "Ajouter un post" button
- [ ] "Ajouter un post" opens dialog with RichTextEditor
- [ ] Entries list: "Derniers posts" title, expand icon, green dashed border cards
- [ ] Entry cards: French date, time format "20h59", lock/unlock icon
- [ ] Gallery: 2-column photo grid, "Voir plus" pink button
- [ ] Badges: earned badges displayed, "Voir tout" pink button
- [ ] Responsive: mobile collapses to single column
- [ ] Empty states look good

**Step 2: Fix any spacing/styling issues found**

Adjust Tailwind classes as needed to match Figma spacing and proportions.

**Step 3: Final commit**

```bash
git add .
git commit -m "fix(journal): polish spacing and styling to match Figma"
```
