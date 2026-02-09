interface RewardEmptyStateProps {
  type: "sticker" | "badge";
}

export function RewardEmptyState({ type }: RewardEmptyStateProps) {
  return (
    <div className="rounded-lg border-2 border-dashed p-12 text-center text-gray-500">
      <p className="text-lg">
        {type === "sticker"
          ? "No stickers available yet"
          : "No badges available yet"}
      </p>
      <p className="mt-2 text-sm">
        Complete activities and reach milestones to start earning{" "}
        {type === "sticker" ? "stickers" : "badges"}!
      </p>
    </div>
  );
}
