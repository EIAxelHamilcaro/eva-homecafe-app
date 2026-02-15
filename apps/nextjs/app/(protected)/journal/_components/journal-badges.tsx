import { Card, CardContent } from "@packages/ui/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import type { RewardCollectionItemDto } from "@/adapters/queries/reward-collection.query";
import {
  getUserBadgeCollection,
  getUserStickerCollection,
} from "@/adapters/queries/reward-collection.query";

interface JournalBadgesProps {
  userId: string;
}

const STREAK_BADGE_IMAGE: Record<string, string> = {
  "journal-streak-7": "/badges/7j.png",
  "journal-streak-14": "/badges/14j.png",
  "journal-streak-30": "/badges/1month.png",
};

const EMOJI_BADGES: Record<string, { emoji: string; bg: string }> = {
  "first-post": { emoji: "📝", bg: "bg-amber-100" },
  "first-mood": { emoji: "😊", bg: "bg-pink-100" },
  "first-photo": { emoji: "📸", bg: "bg-sky-100" },
  "first-moodboard": { emoji: "🎨", bg: "bg-violet-100" },
  "first-friend": { emoji: "🤝", bg: "bg-emerald-100" },
  "posts-10": { emoji: "✍️", bg: "bg-amber-200" },
  "photos-10": { emoji: "🖼️", bg: "bg-sky-200" },
  "posts-50": { emoji: "📚", bg: "bg-orange-200" },
  "photos-50": { emoji: "🏆", bg: "bg-yellow-200" },
  "friends-5": { emoji: "👥", bg: "bg-emerald-200" },
  "friends-10": { emoji: "🌟", bg: "bg-teal-200" },
  "all-moods-recorded": { emoji: "🌈", bg: "bg-fuchsia-100" },
  "kanban-master": { emoji: "✅", bg: "bg-lime-100" },
};

function BadgePreview({ badge }: { badge: RewardCollectionItemDto }) {
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
          <span className="text-2xl">{emojiBadge?.emoji ?? "🏅"}</span>
        </div>
      )}
      <span className="max-w-20 text-center text-[10px] font-medium leading-tight text-foreground">
        {badge.name}
      </span>
    </div>
  );
}

export async function JournalBadges({ userId }: JournalBadgesProps) {
  let badges: Awaited<ReturnType<typeof getUserBadgeCollection>>;
  let stickers: Awaited<ReturnType<typeof getUserStickerCollection>>;
  try {
    [badges, stickers] = await Promise.all([
      getUserBadgeCollection(userId),
      getUserStickerCollection(userId),
    ]);
  } catch {
    return null;
  }

  const earnedCount =
    badges.filter((b) => b.earned).length +
    stickers.filter((s) => s.earned).length;
  const totalCount = badges.length + stickers.length;
  const earnedBadges = [...stickers, ...badges]
    .filter((r) => r.earned)
    .slice(0, 3);

  return (
    <Card className="border-0">
      <CardContent className="p-6">
        <h2 className="font-semibold text-lg">Récompenses</h2>
        <p className="text-xs text-muted-foreground">
          {earnedCount}/{totalCount}
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          {earnedBadges.length > 0 ? (
            earnedBadges.map((badge) => (
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
