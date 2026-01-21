import { Option, Result, UUID } from "@packages/ddd-kit";
import type { profile as profileTable } from "@packages/drizzle/schema";
import { Profile } from "@/domain/profile/profile.aggregate";
import { ProfileId } from "@/domain/profile/profile-id";
import { Bio } from "@/domain/profile/value-objects/bio.vo";
import { DisplayName } from "@/domain/profile/value-objects/display-name.vo";

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

  return Result.ok(
    Profile.reconstitute(
      {
        userId: record.userId,
        displayName: displayNameResult.getValue(),
        bio: bioOption,
        avatarUrl: Option.fromNullable(record.avatarUrl),
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
    createdAt: profile.get("createdAt"),
    updatedAt: profile.get("updatedAt"),
  };
}
