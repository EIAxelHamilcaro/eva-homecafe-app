import { Aggregate, type Option, Result, UUID } from "@packages/ddd-kit";
import { ProfileCreatedEvent } from "./events/profile-created.event";
import { ProfileUpdatedEvent } from "./events/profile-updated.event";
import { ProfileId } from "./profile-id";
import type { Bio } from "./value-objects/bio.vo";
import type { DisplayName } from "./value-objects/display-name.vo";

export interface IProfileProps {
  userId: string;
  displayName: DisplayName;
  bio: Option<Bio>;
  avatarUrl: Option<string>;
  createdAt: Date;
  updatedAt: Date;
}

export class Profile extends Aggregate<IProfileProps> {
  private constructor(props: IProfileProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): ProfileId {
    return ProfileId.create(this._id);
  }

  static create(
    props: Omit<IProfileProps, "createdAt" | "updatedAt">,
    id?: UUID<string | number>,
  ): Profile {
    const newId = id ?? new UUID<string>();
    const now = new Date();

    const profile = new Profile(
      {
        ...props,
        createdAt: now,
        updatedAt: now,
      },
      newId,
    );

    profile.addEvent(
      new ProfileCreatedEvent(
        newId.value.toString(),
        props.userId,
        props.displayName.value,
      ),
    );

    return profile;
  }

  static reconstitute(props: IProfileProps, id: ProfileId): Profile {
    return new Profile(props, id);
  }

  updateDisplayName(displayName: DisplayName): Result<void> {
    this._props.displayName = displayName;
    this._props.updatedAt = new Date();
    this.addEvent(
      new ProfileUpdatedEvent(this.id.value.toString(), this.get("userId")),
    );
    return Result.ok();
  }

  updateBio(bio: Option<Bio>): Result<void> {
    this._props.bio = bio;
    this._props.updatedAt = new Date();
    this.addEvent(
      new ProfileUpdatedEvent(this.id.value.toString(), this.get("userId")),
    );
    return Result.ok();
  }

  updateAvatar(avatarUrl: Option<string>): Result<void> {
    this._props.avatarUrl = avatarUrl;
    this._props.updatedAt = new Date();
    this.addEvent(
      new ProfileUpdatedEvent(this.id.value.toString(), this.get("userId")),
    );
    return Result.ok();
  }
}
