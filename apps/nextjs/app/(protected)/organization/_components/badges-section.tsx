"use client";

import { Card, CardContent } from "@packages/ui/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface BadgeItem {
  id: string;
  key: string;
  name: string;
  earned: boolean;
}

const STREAK_BADGE_IMAGE: Record<string, string> = {
  "journal-streak-7": "/badges/7j.png",
  "journal-streak-14": "/badges/14j.png",
  "journal-streak-30": "/badges/1month.png",
};

const EMOJI_BADGES: Record<string, { emoji: string; bg: string }> = {
  "first-post": { emoji: "\u{1F4DD}", bg: "bg-amber-100" },
  "first-mood": { emoji: "\u{1F60A}", bg: "bg-pink-100" },
  "first-photo": { emoji: "\u{1F4F8}", bg: "bg-sky-100" },
  "first-moodboard": { emoji: "\u{1F3A8}", bg: "bg-violet-100" },
  "first-friend": { emoji: "\u{1F91D}", bg: "bg-emerald-100" },
  "posts-10": { emoji: "\u{270D}\u{FE0F}", bg: "bg-amber-200" },
  "photos-10": { emoji: "\u{1F5BC}\u{FE0F}", bg: "bg-sky-200" },
  "posts-50": { emoji: "\u{1F4DA}", bg: "bg-orange-200" },
  "photos-50": { emoji: "\u{1F3C6}", bg: "bg-yellow-200" },
  "friends-5": { emoji: "\u{1F465}", bg: "bg-emerald-200" },
  "friends-10": { emoji: "\u{1F31F}", bg: "bg-teal-200" },
  "all-moods-recorded": { emoji: "\u{1F308}", bg: "bg-fuchsia-100" },
  "kanban-master": { emoji: "\u{2705}", bg: "bg-lime-100" },
};

function BadgePreview({ badge }: { badge: BadgeItem }) {
  const streakImage = STREAK_BADGE_IMAGE[badge.key];
  const emojiBadge = EMOJI_BADGES[badge.key];
  return (
    <div className="flex flex-col items-center gap-1.5">
      {streakImage ? (
        <Image
          src={streakImage}
          alt={badge.name}
          width={72}
          height={72}
          className="object-contain"
        />
      ) : (
        <div
          className={`flex h-[72px] w-[72px] items-center justify-center rounded-2xl ${emojiBadge?.bg ?? "bg-gray-100"}`}
        >
          <span className="text-2xl">{emojiBadge?.emoji ?? "\u{1F3C5}"}</span>
        </div>
      )}
      <span className="max-w-20 text-center text-[10px] font-medium leading-tight text-foreground">
        {badge.name}
      </span>
    </div>
  );
}

export function BadgesSection() {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [stickers, setStickers] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRewards = useCallback(async () => {
    try {
      const [badgeRes, stickerRes] = await Promise.all([
        fetch("/api/v1/rewards/badges"),
        fetch("/api/v1/rewards/stickers"),
      ]);
      if (badgeRes.ok) setBadges(await badgeRes.json());
      if (stickerRes.ok) setStickers(await stickerRes.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const earnedCount =
    badges.filter((b) => b.earned).length +
    stickers.filter((s) => s.earned).length;
  const totalCount = badges.length + stickers.length;
  const earnedItems = [...stickers, ...badges]
    .filter((r) => r.earned)
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <Card className="border-0">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold">Badges</h2>
        <p className="text-xs text-muted-foreground">
          {earnedCount}/{totalCount}
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          {earnedItems.length > 0 ? (
            earnedItems.map((badge) => (
              <BadgePreview key={badge.id} badge={badge} />
            ))
          ) : (
            <div className="flex gap-3">
              {["/badges/7j.png", "/badges/14j.png", "/badges/1month.png"].map(
                (src) => (
                  <Image
                    key={src}
                    src={src}
                    alt="Badge"
                    width={72}
                    height={72}
                    className="object-contain opacity-30 grayscale"
                  />
                ),
              )}
            </div>
          )}
        </div>
        <Link
          href="/profile"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          Voir tout
        </Link>
      </CardContent>
    </Card>
  );
}
