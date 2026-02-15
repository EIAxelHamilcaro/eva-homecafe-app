import { Aggregate, Result, UUID } from "@packages/ddd-kit";
import { UserPreferenceUpdatedEvent } from "./events/user-preference-updated.event";
import { UserPreferenceId } from "./user-preference-id";
import { Language, type LanguageValue } from "./value-objects/language.vo";
import {
  RewardsVisibility,
  type RewardsVisibilityValue,
} from "./value-objects/rewards-visibility.vo";
import { ThemeMode, type ThemeModeValue } from "./value-objects/theme-mode.vo";
import {
  TimeFormat,
  type TimeFormatValue,
} from "./value-objects/time-format.vo";

export interface IUserPreferenceProps {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyNewMessages: boolean;
  notifyFriendActivity: boolean;
  notifyBadgesEarned: boolean;
  notifyPostActivity: boolean;
  notifyJournalReminder: boolean;
  profileVisibility: boolean;
  rewardsVisibility: RewardsVisibility;
  themeMode: ThemeMode;
  language: Language;
  timeFormat: TimeFormat;
  createdAt: Date;
  updatedAt: Date;
}

export class UserPreference extends Aggregate<IUserPreferenceProps> {
  private constructor(props: IUserPreferenceProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): UserPreferenceId {
    return UserPreferenceId.create(this._id);
  }

  static createDefault(
    userId: string,
    id?: UUID<string | number>,
  ): Result<UserPreference> {
    const languageResult = Language.create("fr" as LanguageValue);
    if (languageResult.isFailure) return Result.fail(languageResult.getError());

    const timeFormatResult = TimeFormat.create("24h" as TimeFormatValue);
    if (timeFormatResult.isFailure)
      return Result.fail(timeFormatResult.getError());

    const themeModeResult = ThemeMode.create("system" as ThemeModeValue);
    if (themeModeResult.isFailure)
      return Result.fail(themeModeResult.getError());

    const rewardsVisibilityResult = RewardsVisibility.create(
      "friends" as RewardsVisibilityValue,
    );
    if (rewardsVisibilityResult.isFailure)
      return Result.fail(rewardsVisibilityResult.getError());

    const now = new Date();
    return Result.ok(
      new UserPreference(
        {
          userId,
          emailNotifications: true,
          pushNotifications: true,
          notifyNewMessages: true,
          notifyFriendActivity: true,
          notifyBadgesEarned: true,
          notifyPostActivity: true,
          notifyJournalReminder: true,
          profileVisibility: true,
          rewardsVisibility: rewardsVisibilityResult.getValue(),
          themeMode: themeModeResult.getValue(),
          language: languageResult.getValue(),
          timeFormat: timeFormatResult.getValue(),
          createdAt: now,
          updatedAt: now,
        },
        id ?? new UUID<string>(),
      ),
    );
  }

  static reconstitute(
    props: IUserPreferenceProps,
    id: UserPreferenceId,
  ): UserPreference {
    return new UserPreference(props, id);
  }

  updatePreferences(updates: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    notifyNewMessages?: boolean;
    notifyFriendActivity?: boolean;
    notifyBadgesEarned?: boolean;
    notifyPostActivity?: boolean;
    notifyJournalReminder?: boolean;
    profileVisibility?: boolean;
    rewardsVisibility?: RewardsVisibility;
    themeMode?: ThemeMode;
    language?: Language;
    timeFormat?: TimeFormat;
  }): Result<void> {
    if (updates.emailNotifications !== undefined)
      this._props.emailNotifications = updates.emailNotifications;
    if (updates.pushNotifications !== undefined)
      this._props.pushNotifications = updates.pushNotifications;
    if (updates.notifyNewMessages !== undefined)
      this._props.notifyNewMessages = updates.notifyNewMessages;
    if (updates.notifyFriendActivity !== undefined)
      this._props.notifyFriendActivity = updates.notifyFriendActivity;
    if (updates.notifyBadgesEarned !== undefined)
      this._props.notifyBadgesEarned = updates.notifyBadgesEarned;
    if (updates.notifyPostActivity !== undefined)
      this._props.notifyPostActivity = updates.notifyPostActivity;
    if (updates.notifyJournalReminder !== undefined)
      this._props.notifyJournalReminder = updates.notifyJournalReminder;
    if (updates.profileVisibility !== undefined)
      this._props.profileVisibility = updates.profileVisibility;
    if (updates.rewardsVisibility !== undefined)
      this._props.rewardsVisibility = updates.rewardsVisibility;
    if (updates.themeMode !== undefined)
      this._props.themeMode = updates.themeMode;
    if (updates.language !== undefined) this._props.language = updates.language;
    if (updates.timeFormat !== undefined)
      this._props.timeFormat = updates.timeFormat;

    this._props.updatedAt = new Date();

    this.addEvent(
      new UserPreferenceUpdatedEvent(
        this.id.value.toString(),
        this._props.userId,
      ),
    );

    return Result.ok();
  }
}
