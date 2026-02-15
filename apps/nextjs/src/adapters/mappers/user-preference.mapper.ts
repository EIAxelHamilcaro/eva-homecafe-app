import { Result, UUID } from "@packages/ddd-kit";
import type { userPreference as userPreferenceTable } from "@packages/drizzle/schema";
import { UserPreference } from "@/domain/user-preference/user-preference.aggregate";
import { UserPreferenceId } from "@/domain/user-preference/user-preference-id";
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

type UserPreferenceRecord = typeof userPreferenceTable.$inferSelect;

type UserPreferencePersistence = Omit<
  UserPreferenceRecord,
  "createdAt" | "updatedAt"
> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export function userPreferenceToDomain(
  record: UserPreferenceRecord,
): Result<UserPreference> {
  const languageResult = Language.create(record.language as LanguageValue);
  if (languageResult.isFailure) return Result.fail(languageResult.getError());

  const timeFormatResult = TimeFormat.create(
    record.timeFormat as TimeFormatValue,
  );
  if (timeFormatResult.isFailure)
    return Result.fail(timeFormatResult.getError());

  const themeModeResult = ThemeMode.create(record.themeMode as ThemeModeValue);
  if (themeModeResult.isFailure) return Result.fail(themeModeResult.getError());

  const rewardsVisibilityResult = RewardsVisibility.create(
    record.rewardsVisibility as RewardsVisibilityValue,
  );
  if (rewardsVisibilityResult.isFailure)
    return Result.fail(rewardsVisibilityResult.getError());

  const preference = UserPreference.reconstitute(
    {
      userId: record.userId,
      emailNotifications: record.emailNotifications,
      pushNotifications: record.pushNotifications,
      notifyNewMessages: record.notifyNewMessages,
      notifyFriendActivity: record.notifyFriendActivity,
      notifyBadgesEarned: record.notifyBadgesEarned,
      notifyPostActivity: record.notifyPostActivity,
      notifyJournalReminder: record.notifyJournalReminder,
      profileVisibility: record.profileVisibility,
      rewardsVisibility: rewardsVisibilityResult.getValue(),
      themeMode: themeModeResult.getValue(),
      language: languageResult.getValue(),
      timeFormat: timeFormatResult.getValue(),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    },
    UserPreferenceId.create(new UUID(record.id)),
  );

  return Result.ok(preference);
}

export function userPreferenceToPersistence(
  preference: UserPreference,
): UserPreferencePersistence {
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
    createdAt: preference.get("createdAt"),
    updatedAt: preference.get("updatedAt"),
  };
}
