import { Option, Result, type UseCase } from "@packages/ddd-kit";
import type {
  ICreateProfileInputDto,
  ICreateProfileOutputDto,
} from "@/application/dto/profile/create-profile.dto";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import { Profile } from "@/domain/profile/profile.aggregate";
import { Bio } from "@/domain/profile/value-objects/bio.vo";
import { DisplayName } from "@/domain/profile/value-objects/display-name.vo";

export class CreateProfileUseCase
  implements UseCase<ICreateProfileInputDto, ICreateProfileOutputDto>
{
  constructor(private readonly profileRepo: IProfileRepository) {}

  async execute(
    input: ICreateProfileInputDto,
  ): Promise<Result<ICreateProfileOutputDto>> {
    const existsResult = await this.profileRepo.existsByUserId(input.userId);
    if (existsResult.isFailure) {
      return Result.fail(existsResult.getError());
    }

    if (existsResult.getValue()) {
      return Result.fail("Profile already exists for this user");
    }

    const displayNameResult = DisplayName.create(input.displayName);
    if (displayNameResult.isFailure) {
      return Result.fail(displayNameResult.getError());
    }

    let bioOption: Option<Bio> = Option.none();
    if (input.bio) {
      const bioResult = Bio.create(input.bio);
      if (bioResult.isFailure) {
        return Result.fail(bioResult.getError());
      }
      bioOption = Option.some(bioResult.getValue());
    }

    const avatarUrlOption: Option<string> = Option.fromNullable(
      input.avatarUrl ?? null,
    );

    const profile = Profile.create({
      userId: input.userId,
      displayName: displayNameResult.getValue(),
      bio: bioOption,
      avatarUrl: avatarUrlOption,
    });

    const saveResult = await this.profileRepo.create(profile);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    return Result.ok(this.toDto(profile));
  }

  private toDto(profile: Profile): ICreateProfileOutputDto {
    return {
      id: profile.id.value.toString(),
      userId: profile.get("userId"),
      displayName: profile.get("displayName").value,
      bio: profile.get("bio").toNull()?.value ?? null,
      avatarUrl: profile.get("avatarUrl").toNull(),
      createdAt: profile.get("createdAt").toISOString(),
      updatedAt: profile.get("updatedAt").toISOString(),
    };
  }
}
