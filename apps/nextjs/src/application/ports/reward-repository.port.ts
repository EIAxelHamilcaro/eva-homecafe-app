import type {
  BaseRepository,
  Option,
  PaginatedResult,
  PaginationParams,
  Result,
} from "@packages/ddd-kit";
import type { UserReward } from "@/domain/reward/user-reward.aggregate";

export interface IAchievementDefinitionRecord {
  id: string;
  type: "sticker" | "badge";
  key: string;
  name: string;
  description: string;
  criteria: { eventType: string; threshold: number; field: string };
  iconUrl: string | null;
  createdAt: Date;
}

export interface IRewardRepository extends BaseRepository<UserReward> {
  findByUserId(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<Result<PaginatedResult<UserReward>>>;
  findByUserIdAndDefinitionId(
    userId: string,
    definitionId: string,
  ): Promise<Result<Option<UserReward>>>;
  getAllDefinitions(): Promise<Result<IAchievementDefinitionRecord[]>>;
  getDefinitionsByType(
    type: "sticker" | "badge",
  ): Promise<Result<IAchievementDefinitionRecord[]>>;
  getDefinitionsByEventType(
    eventType: string,
  ): Promise<Result<IAchievementDefinitionRecord[]>>;
}
