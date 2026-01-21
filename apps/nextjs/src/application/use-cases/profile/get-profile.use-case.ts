import { match, type Option, Result, type UseCase } from "@packages/ddd-kit";
import type {
  IGetProfileInputDto,
  IGetProfileOutputDto,
} from "@/application/dto/profile/get-profile.dto";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import type { Profile } from "@/domain/profile/profile.aggregate";

export class GetProfileUseCase
  implements UseCase<IGetProfileInputDto, IGetProfileOutputDto>
{
  constructor(private readonly profileRepo: IProfileRepository) {}

  async execute(
    input: IGetProfileInputDto,
  ): Promise<Result<IGetProfileOutputDto>> {
    const result = await this.profileRepo.findByUserId(input.userId);

    if (result.isFailure) {
      return Result.fail(result.getError());
    }

    return Result.ok(this.toDto(result.getValue()));
  }

  private toDto(profileOption: Option<Profile>): IGetProfileOutputDto {
    return match(profileOption, {
      Some: (profile) => ({
        id: profile.id.value.toString(),
        userId: profile.get("userId"),
        displayName: profile.get("displayName").value,
        bio: profile.get("bio").toNull()?.value ?? null,
        avatarUrl: profile.get("avatarUrl").toNull(),
        createdAt: profile.get("createdAt").toISOString(),
        updatedAt: profile.get("updatedAt").toISOString(),
      }),
      None: () => null,
    });
  }
}
