import { match, Option, Result, type UseCase } from "@packages/ddd-kit";
import type {
  IUpdateProfileInputDto,
  IUpdateProfileOutputDto,
} from "@/application/dto/profile/update-profile.dto";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import type { Profile } from "@/domain/profile/profile.aggregate";
import { Bio } from "@/domain/profile/value-objects/bio.vo";
import { DisplayName } from "@/domain/profile/value-objects/display-name.vo";

export class UpdateProfileUseCase
  implements UseCase<IUpdateProfileInputDto, IUpdateProfileOutputDto>
{
  constructor(private readonly profileRepo: IProfileRepository) {}

  async execute(
    input: IUpdateProfileInputDto,
  ): Promise<Result<IUpdateProfileOutputDto>> {
    const findResult = await this.profileRepo.findByUserId(input.userId);
    if (findResult.isFailure) {
      return Result.fail(findResult.getError());
    }

    const profileResult = match<Profile, Result<Profile>>(
      findResult.getValue(),
      {
        Some: (profile) => Result.ok(profile),
        None: () => Result.fail("Profile not found"),
      },
    );

    if (profileResult.isFailure) {
      return Result.fail(profileResult.getError());
    }

    const profile = profileResult.getValue();

    const updateResult = await this.applyUpdates(profile, input);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError());
    }

    const saveResult = await this.profileRepo.update(profile);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    return Result.ok(this.toDto(profile));
  }

  private async applyUpdates(
    profile: Profile,
    input: IUpdateProfileInputDto,
  ): Promise<Result<void>> {
    if (input.displayName !== undefined) {
      const displayNameResult = DisplayName.create(input.displayName);
      if (displayNameResult.isFailure) {
        return Result.fail(displayNameResult.getError());
      }
      const updateResult = profile.updateDisplayName(
        displayNameResult.getValue(),
      );
      if (updateResult.isFailure) {
        return Result.fail(updateResult.getError());
      }
    }

    if (input.bio !== undefined) {
      if (input.bio === null) {
        const updateResult = profile.updateBio(Option.none());
        if (updateResult.isFailure) {
          return Result.fail(updateResult.getError());
        }
      } else {
        const bioResult = Bio.create(input.bio);
        if (bioResult.isFailure) {
          return Result.fail(bioResult.getError());
        }
        const updateResult = profile.updateBio(
          Option.some(bioResult.getValue()),
        );
        if (updateResult.isFailure) {
          return Result.fail(updateResult.getError());
        }
      }
    }

    if (input.avatarUrl !== undefined) {
      const updateResult = profile.updateAvatar(
        Option.fromNullable(input.avatarUrl),
      );
      if (updateResult.isFailure) {
        return Result.fail(updateResult.getError());
      }
    }

    return Result.ok();
  }

  private toDto(profile: Profile): IUpdateProfileOutputDto {
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
