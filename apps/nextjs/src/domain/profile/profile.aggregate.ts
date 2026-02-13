import { Aggregate, Option, Result, UUID } from "@packages/ddd-kit";
import { ProfileCreatedEvent } from "./events/profile-created.event";
import { ProfileUpdatedEvent } from "./events/profile-updated.event";
import { ProfileId } from "./profile-id";
import type { Address } from "./value-objects/address.vo";
import type { Bio } from "./value-objects/bio.vo";
import type { DisplayName } from "./value-objects/display-name.vo";
import type { Phone } from "./value-objects/phone.vo";
import type { Profession } from "./value-objects/profession.vo";

export interface IProfileProps {
  userId: string;
  displayName: DisplayName;
  bio: Option<Bio>;
  avatarUrl: Option<string>;
  phone: Option<Phone>;
  birthday: Option<Date>;
  profession: Option<Profession>;
  address: Option<Address>;
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
    props: Omit<
      IProfileProps,
      | "createdAt"
      | "updatedAt"
      | "phone"
      | "birthday"
      | "profession"
      | "address"
    > & {
      phone?: Option<Phone>;
      birthday?: Option<Date>;
      profession?: Option<Profession>;
      address?: Option<Address>;
    },
    id?: UUID<string | number>,
  ): Profile {
    const newId = id ?? new UUID<string>();
    const now = new Date();

    const profile = new Profile(
      {
        ...props,
        phone: props.phone ?? Option.none(),
        birthday: props.birthday ?? Option.none(),
        profession: props.profession ?? Option.none(),
        address: props.address ?? Option.none(),
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

  updatePhone(phone: Option<Phone>): Result<void> {
    this._props.phone = phone;
    this._props.updatedAt = new Date();
    this.addEvent(
      new ProfileUpdatedEvent(this.id.value.toString(), this.get("userId")),
    );
    return Result.ok();
  }

  updateBirthday(birthday: Option<Date>): Result<void> {
    this._props.birthday = birthday;
    this._props.updatedAt = new Date();
    this.addEvent(
      new ProfileUpdatedEvent(this.id.value.toString(), this.get("userId")),
    );
    return Result.ok();
  }

  updateProfession(profession: Option<Profession>): Result<void> {
    this._props.profession = profession;
    this._props.updatedAt = new Date();
    this.addEvent(
      new ProfileUpdatedEvent(this.id.value.toString(), this.get("userId")),
    );
    return Result.ok();
  }

  updateAddress(address: Option<Address>): Result<void> {
    this._props.address = address;
    this._props.updatedAt = new Date();
    this.addEvent(
      new ProfileUpdatedEvent(this.id.value.toString(), this.get("userId")),
    );
    return Result.ok();
  }
}
