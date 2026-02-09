import { RewardGrid } from "./reward-grid";

export function StickerGrid() {
  return <RewardGrid type="sticker" endpoint="/api/v1/rewards/stickers" />;
}
