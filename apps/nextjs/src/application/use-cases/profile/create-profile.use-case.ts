import { Option, Result, type UseCase } from "@packages/ddd-kit";
import type {
  ICreateProfileInputDto,
  ICreateProfileOutputDto,
} from "@/application/dto/profile/create-profile.dto";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import { Profile } from "@/domain/profile/profile.aggregate";
import { Address } from "@/domain/profile/value-objects/address.vo";
import { Bio } from "@/domain/profile/value-objects/bio.vo";
import { DisplayName } from "@/domain/profile/value-objects/display-name.vo";
import { Phone } from "@/domain/profile/value-objects/phone.vo";
import { Profession } from "@/domain/profile/value-objects/profession.vo";

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

    let phoneOption: Option<Phone> | undefined;
    if (input.phone) {
      const phoneResult = Phone.create(input.phone);
      if (phoneResult.isFailure) {
        return Result.fail(phoneResult.getError());
      }
      phoneOption = Option.some(phoneResult.getValue());
    }

    const birthdayOption: Option<Date> | undefined = input.birthday
      ? Option.some(new Date(input.birthday))
      : undefined;

    let professionOption: Option<Profession> | undefined;
    if (input.profession) {
      const professionResult = Profession.create(input.profession);
      if (professionResult.isFailure) {
        return Result.fail(professionResult.getError());
      }
      professionOption = Option.some(professionResult.getValue());
    }

    let addressOption: Option<Address> | undefined;
    if (input.address) {
      const addressResult = Address.create(input.address);
      if (addressResult.isFailure) {
        return Result.fail(addressResult.getError());
      }
      addressOption = Option.some(addressResult.getValue());
    }

    const profile = Profile.create({
      userId: input.userId,
      displayName: displayNameResult.getValue(),
      bio: bioOption,
      avatarUrl: avatarUrlOption,
      phone: phoneOption,
      birthday: birthdayOption,
      profession: professionOption,
      address: addressOption,
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
      phone: profile.get("phone").toNull()?.value ?? null,
      birthday: profile.get("birthday").toNull()?.toISOString() ?? null,
      profession: profile.get("profession").toNull()?.value ?? null,
      address: profile.get("address").toNull()?.value ?? null,
      createdAt: profile.get("createdAt").toISOString(),
      updatedAt: profile.get("updatedAt").toISOString(),
    };
  }
}
