import { Suspense } from "react";
import { requireAuth } from "@/adapters/guards/auth.guard";
import {
  getUserBadgeCollection,
  getUserStickerCollection,
} from "@/adapters/queries/reward-collection.query";
import { getInjection } from "@/common/di/container";
import { ProfileContent } from "./_components/profile-content";

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        <div className="h-32 w-32 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="h-48 animate-pulse rounded-lg bg-muted" />
      <div className="h-48 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

async function ProfileData() {
  const session = await requireAuth();

  const profileUseCase = getInjection("GetProfileUseCase");

  const [badges, stickers, profileResult] = await Promise.all([
    getUserBadgeCollection(session.user.id),
    getUserStickerCollection(session.user.id),
    profileUseCase.execute({ userId: session.user.id }),
  ]);

  const profile = profileResult.isSuccess ? profileResult.getValue() : null;

  const earnedCount =
    badges.filter((b) => b.earned).length +
    stickers.filter((s) => s.earned).length;
  const totalCount = badges.length + stickers.length;

  const allRewards = [...stickers, ...badges];

  return (
    <ProfileContent
      user={session.user}
      profile={profile}
      earnedRewardsCount={earnedCount}
      totalRewardsCount={totalCount}
      earnedBadges={badges.filter((b) => b.earned).slice(0, 3)}
      allRewards={allRewards}
    />
  );
}

export default function ProfilePage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileData />
      </Suspense>
    </div>
  );
}
