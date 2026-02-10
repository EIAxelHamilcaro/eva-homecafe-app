import type { BaseRepository, Option, Result } from "@packages/ddd-kit";
import type { UserPreference } from "@/domain/user-preference/user-preference.aggregate";

export interface IUserPreferenceRepository
  extends BaseRepository<UserPreference> {
  findByUserId(userId: string): Promise<Result<Option<UserPreference>>>;
}
