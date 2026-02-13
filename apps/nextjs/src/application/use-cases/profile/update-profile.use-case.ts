import { match, Option, Result, type UseCase } from "@packages/ddd-kit";
import type {
  IUpdateProfileInputDto,
  IUpdateProfileOutputDto,
} from "@/application/dto/profile/update-profile.dto";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import type { Profile } from "@/domain/profile/profile.aggregate";
import { Address } from "@/domain/profile/value-objects/address.vo";
import { Bio } from "@/domain/profile/value-objects/bio.vo";
import { DisplayName } from "@/domain/profile/value-objects/display-name.vo";
import { Phone } from "@/domain/profile/value-objects/phone.vo";
import { Profession } from "@/domain/profile/value-objects/profession.vo";

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

    if (input.phone !== undefined) {
      if (input.phone === null) {
        const updateResult = profile.updatePhone(Option.none());
        if (updateResult.isFailure) return Result.fail(updateResult.getError());
      } else {
        const phoneResult = Phone.create(input.phone);
        if (phoneResult.isFailure) return Result.fail(phoneResult.getError());
        const updateResult = profile.updatePhone(
          Option.some(phoneResult.getValue()),
        );
        if (updateResult.isFailure) return Result.fail(updateResult.getError());
      }
    }

    if (input.birthday !== undefined) {
      const updateResult = profile.updateBirthday(
        Option.fromNullable(input.birthday ? new Date(input.birthday) : null),
      );
      if (updateResult.isFailure) return Result.fail(updateResult.getError());
    }

    if (input.profession !== undefined) {
      if (input.profession === null) {
        const updateResult = profile.updateProfession(Option.none());
        if (updateResult.isFailure) return Result.fail(updateResult.getError());
      } else {
        const professionResult = Profession.create(input.profession);
        if (professionResult.isFailure)
          return Result.fail(professionResult.getError());
        const updateResult = profile.updateProfession(
          Option.some(professionResult.getValue()),
        );
        if (updateResult.isFailure) return Result.fail(updateResult.getError());
      }
    }

    if (input.address !== undefined) {
      if (input.address === null) {
        const updateResult = profile.updateAddress(Option.none());
        if (updateResult.isFailure) return Result.fail(updateResult.getError());
      } else {
        const addressResult = Address.create(input.address);
        if (addressResult.isFailure)
          return Result.fail(addressResult.getError());
        const updateResult = profile.updateAddress(
          Option.some(addressResult.getValue()),
        );
        if (updateResult.isFailure) return Result.fail(updateResult.getError());
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
      phone: profile.get("phone").toNull()?.value ?? null,
      birthday: profile.get("birthday").toNull()?.toISOString() ?? null,
      profession: profile.get("profession").toNull()?.value ?? null,
      address: profile.get("address").toNull()?.value ?? null,
      createdAt: profile.get("createdAt").toISOString(),
      updatedAt: profile.get("updatedAt").toISOString(),
    };
  }
}
