import type { BaseRepository, Option, Result } from "@packages/ddd-kit";
import type { Profile } from "@/domain/profile/profile.aggregate";
import type { ProfileId } from "@/domain/profile/profile-id";

export interface IProfileRepository extends BaseRepository<Profile> {
  findById(id: ProfileId): Promise<Result<Option<Profile>>>;
  findByUserId(userId: string): Promise<Result<Option<Profile>>>;
  existsByUserId(userId: string): Promise<Result<boolean>>;
}
