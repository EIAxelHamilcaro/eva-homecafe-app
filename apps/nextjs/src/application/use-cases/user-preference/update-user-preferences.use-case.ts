import { match, Result, type UseCase } from "@packages/ddd-kit";
import type {
  IUpdateUserPreferencesInputDto,
  IUpdateUserPreferencesOutputDto,
} from "@/application/dto/user-preference/update-user-preferences.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IUserPreferenceRepository } from "@/application/ports/user-preference-repository.port";
import type { UserPreference } from "@/domain/user-preference/user-preference.aggregate";
import {
  Language,
  type LanguageValue,
} from "@/domain/user-preference/value-objects/language.vo";
import {
  RewardsVisibility,
  type RewardsVisibilityValue,
} from "@/domain/user-preference/value-objects/rewards-visibility.vo";
import {
  ThemeMode,
  type ThemeModeValue,
} from "@/domain/user-preference/value-objects/theme-mode.vo";
import {
  TimeFormat,
  type TimeFormatValue,
} from "@/domain/user-preference/value-objects/time-format.vo";

export class UpdateUserPreferencesUseCase
  implements
    UseCase<IUpdateUserPreferencesInputDto, IUpdateUserPreferencesOutputDto>
{
  constructor(
    private readonly userPreferenceRepo: IUserPreferenceRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: IUpdateUserPreferencesInputDto,
  ): Promise<Result<IUpdateUserPreferencesOutputDto>> {
    const findResult = await this.userPreferenceRepo.findByUserId(input.userId);
    if (findResult.isFailure) {
      return Result.fail(findResult.getError());
    }

    const preference = await match<
      UserPreference,
      Promise<Result<UserPreference>>
    >(findResult.getValue(), {
      Some: async (pref) => Result.ok(pref),
      None: async () => {
        const { UserPreference } = await import(
          "@/domain/user-preference/user-preference.aggregate"
        );
        return UserPreference.createDefault(input.userId);
      },
    });

    if (preference.isFailure) {
      return Result.fail(preference.getError());
    }

    const pref = preference.getValue();

    const updatesResult = await this.buildUpdates(input);
    if (updatesResult.isFailure) {
      return Result.fail(updatesResult.getError());
    }

    const updateResult = pref.updatePreferences(updatesResult.getValue());
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError());
    }

    const isNew = findResult.getValue().isNone();
    const saveResult = isNew
      ? await this.userPreferenceRepo.create(pref)
      : await this.userPreferenceRepo.update(pref);

    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    await this.eventDispatcher.dispatchAll(pref.domainEvents);
    pref.clearEvents();

    return Result.ok(this.toDto(pref));
  }

  private async buildUpdates(input: IUpdateUserPreferencesInputDto): Promise<
    Result<{
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
    }>
  > {
    const updates: {
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
    } = {};

    if (input.emailNotifications !== undefined)
      updates.emailNotifications = input.emailNotifications;
    if (input.pushNotifications !== undefined)
      updates.pushNotifications = input.pushNotifications;
    if (input.notifyNewMessages !== undefined)
      updates.notifyNewMessages = input.notifyNewMessages;
    if (input.notifyFriendActivity !== undefined)
      updates.notifyFriendActivity = input.notifyFriendActivity;
    if (input.notifyBadgesEarned !== undefined)
      updates.notifyBadgesEarned = input.notifyBadgesEarned;
    if (input.notifyPostActivity !== undefined)
      updates.notifyPostActivity = input.notifyPostActivity;
    if (input.notifyJournalReminder !== undefined)
      updates.notifyJournalReminder = input.notifyJournalReminder;
    if (input.profileVisibility !== undefined)
      updates.profileVisibility = input.profileVisibility;

    if (input.rewardsVisibility !== undefined) {
      const result = RewardsVisibility.create(
        input.rewardsVisibility as RewardsVisibilityValue,
      );
      if (result.isFailure) return Result.fail(result.getError());
      updates.rewardsVisibility = result.getValue();
    }

    if (input.themeMode !== undefined) {
      const result = ThemeMode.create(input.themeMode as ThemeModeValue);
      if (result.isFailure) return Result.fail(result.getError());
      updates.themeMode = result.getValue();
    }

    if (input.language !== undefined) {
      const result = Language.create(input.language as LanguageValue);
      if (result.isFailure) return Result.fail(result.getError());
      updates.language = result.getValue();
    }

    if (input.timeFormat !== undefined) {
      const result = TimeFormat.create(input.timeFormat as TimeFormatValue);
      if (result.isFailure) return Result.fail(result.getError());
      updates.timeFormat = result.getValue();
    }

    return Result.ok(updates);
  }

  private toDto(preference: UserPreference): IUpdateUserPreferencesOutputDto {
    return {
      id: preference.id.value.toString(),
      userId: preference.get("userId"),
      emailNotifications: preference.get("emailNotifications"),
      pushNotifications: preference.get("pushNotifications"),
      notifyNewMessages: preference.get("notifyNewMessages"),
      notifyFriendActivity: preference.get("notifyFriendActivity"),
      notifyBadgesEarned: preference.get("notifyBadgesEarned"),
      notifyPostActivity: preference.get("notifyPostActivity"),
      notifyJournalReminder: preference.get("notifyJournalReminder"),
      profileVisibility: preference.get("profileVisibility"),
      rewardsVisibility: preference.get("rewardsVisibility").value,
      themeMode: preference.get("themeMode").value,
      language: preference.get("language").value,
      timeFormat: preference.get("timeFormat").value,
      createdAt: preference.get("createdAt").toISOString(),
      updatedAt: preference.get("updatedAt").toISOString(),
    };
  }
}
