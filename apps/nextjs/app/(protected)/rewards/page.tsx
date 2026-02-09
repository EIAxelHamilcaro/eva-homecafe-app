import { requireAuth } from "@/adapters/guards/auth.guard";
import { RewardTabs } from "./_components/reward-tabs";

export default async function RewardsPage() {
  await requireAuth();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 font-bold text-2xl">Rewards</h1>
      <RewardTabs />
    </div>
  );
}
