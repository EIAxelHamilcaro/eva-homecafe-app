"use client";

import { Badge } from "@packages/ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import type { RewardCollectionItemDto } from "@/adapters/queries/reward-collection.query";

interface RewardCardProps {
  reward: RewardCollectionItemDto;
}

const CRITERIA_LABELS: Record<string, string> = {
  journalStreak: "day journal streak",
  moodStreak: "day mood streak",
  count: "",
  uniqueMoodCategories: "unique mood categories",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  PostCreated: "posts",
  MoodRecorded: "mood entries",
  PhotoUploaded: "photos",
  MoodboardCreated: "moodboards",
  FriendRequestAccepted: "friends",
  CardCompleted: "completed cards",
};

function formatCriteria(criteria: RewardCollectionItemDto["criteria"]): string {
  if (criteria.threshold === 1) {
    const eventLabel = EVENT_TYPE_LABELS[criteria.eventType];
    if (eventLabel) return `First ${eventLabel.replace(/s$/, "")}`;
  }

  const fieldLabel = CRITERIA_LABELS[criteria.field];
  if (fieldLabel) return `${criteria.threshold} ${fieldLabel}`;

  const eventLabel = EVENT_TYPE_LABELS[criteria.eventType];
  if (eventLabel) return `${criteria.threshold} ${eventLabel}`;

  return `${criteria.threshold} ${criteria.field}`;
}

export function RewardCard({ reward }: RewardCardProps) {
  return (
    <Card
      className={
        reward.earned
          ? "border-primary/50 bg-primary/5"
          : "opacity-60 grayscale"
      }
    >
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm">{reward.name}</CardTitle>
          {reward.earned ? (
            <Badge variant="default" className="shrink-0 text-[10px]">
              Earned
            </Badge>
          ) : (
            <Badge variant="outline" className="shrink-0 text-[10px]">
              Locked
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <p className="text-muted-foreground text-xs">{reward.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-medium text-muted-foreground text-[10px]">
            {formatCriteria(reward.criteria)}
          </span>
          {reward.earned && reward.earnedAt && (
            <span className="text-muted-foreground text-[10px]">
              {new Date(reward.earnedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
