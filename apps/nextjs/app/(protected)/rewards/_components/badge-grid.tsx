import { RewardGrid } from "./reward-grid";

export function BadgeGrid() {
  return <RewardGrid type="badge" endpoint="/api/v1/rewards/badges" />;
}
