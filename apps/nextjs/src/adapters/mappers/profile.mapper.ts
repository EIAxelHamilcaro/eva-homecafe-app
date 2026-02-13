import { Option, Result, UUID } from "@packages/ddd-kit";
import type { profile as profileTable } from "@packages/drizzle/schema";
import { Profile } from "@/domain/profile/profile.aggregate";
import { ProfileId } from "@/domain/profile/profile-id";
import { Address } from "@/domain/profile/value-objects/address.vo";
import { Bio } from "@/domain/profile/value-objects/bio.vo";
import { DisplayName } from "@/domain/profile/value-objects/display-name.vo";
import { Phone } from "@/domain/profile/value-objects/phone.vo";
import { Profession } from "@/domain/profile/value-objects/profession.vo";

type ProfileRecord = typeof profileTable.$inferSelect;

type ProfilePersistence = Omit<ProfileRecord, "createdAt" | "updatedAt"> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export function profileToDomain(record: ProfileRecord): Result<Profile> {
  const displayNameResult = DisplayName.create(record.displayName);
  if (displayNameResult.isFailure) {
    return Result.fail(`Invalid profile data: ${displayNameResult.getError()}`);
  }

  let bioOption: Option<Bio> = Option.none();
  if (record.bio !== null) {
    const bioResult = Bio.create(record.bio);
    if (bioResult.isFailure) {
      return Result.fail(`Invalid profile data: ${bioResult.getError()}`);
    }
    bioOption = Option.some(bioResult.getValue());
  }

  let phoneOption: Option<Phone> = Option.none();
  if (record.phone !== null) {
    const phoneResult = Phone.create(record.phone);
    if (phoneResult.isFailure) {
      return Result.fail(`Invalid profile data: ${phoneResult.getError()}`);
    }
    phoneOption = Option.some(phoneResult.getValue());
  }

  let professionOption: Option<Profession> = Option.none();
  if (record.profession !== null) {
    const professionResult = Profession.create(record.profession);
    if (professionResult.isFailure) {
      return Result.fail(
        `Invalid profile data: ${professionResult.getError()}`,
      );
    }
    professionOption = Option.some(professionResult.getValue());
  }

  let addressOption: Option<Address> = Option.none();
  if (
    record.addressStreet !== null &&
    record.addressZipCode !== null &&
    record.addressCity !== null &&
    record.addressCountry !== null
  ) {
    const addressResult = Address.create({
      street: record.addressStreet,
      zipCode: record.addressZipCode,
      city: record.addressCity,
      country: record.addressCountry,
    });
    if (addressResult.isFailure) {
      return Result.fail(`Invalid profile data: ${addressResult.getError()}`);
    }
    addressOption = Option.some(addressResult.getValue());
  }

  return Result.ok(
    Profile.reconstitute(
      {
        userId: record.userId,
        displayName: displayNameResult.getValue(),
        bio: bioOption,
        avatarUrl: Option.fromNullable(record.avatarUrl),
        phone: phoneOption,
        birthday: Option.fromNullable(record.birthday),
        profession: professionOption,
        address: addressOption,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
      ProfileId.create(new UUID(record.id)),
    ),
  );
}

export function profileToPersistence(profile: Profile): ProfilePersistence {
  return {
    id: String(profile.id.value),
    userId: profile.get("userId"),
    displayName: profile.get("displayName").value,
    bio: profile.get("bio").toNull()?.value ?? null,
    avatarUrl: profile.get("avatarUrl").toNull(),
    phone: profile.get("phone").toNull()?.value ?? null,
    birthday: profile.get("birthday").toNull() ?? null,
    profession: profile.get("profession").toNull()?.value ?? null,
    addressStreet: profile.get("address").toNull()?.value.street ?? null,
    addressZipCode: profile.get("address").toNull()?.value.zipCode ?? null,
    addressCity: profile.get("address").toNull()?.value.city ?? null,
    addressCountry: profile.get("address").toNull()?.value.country ?? null,
    createdAt: profile.get("createdAt"),
    updatedAt: profile.get("updatedAt"),
  };
}
