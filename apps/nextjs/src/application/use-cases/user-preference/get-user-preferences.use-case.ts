import { match, Result, type UseCase } from "@packages/ddd-kit";
import type {
  IGetUserPreferencesInputDto,
  IGetUserPreferencesOutputDto,
} from "@/application/dto/user-preference/get-user-preferences.dto";
import type { IUserPreferenceRepository } from "@/application/ports/user-preference-repository.port";
import type { UserPreference } from "@/domain/user-preference/user-preference.aggregate";

export class GetUserPreferencesUseCase
  implements UseCase<IGetUserPreferencesInputDto, IGetUserPreferencesOutputDto>
{
  constructor(private readonly userPreferenceRepo: IUserPreferenceRepository) {}

  async execute(
    input: IGetUserPreferencesInputDto,
  ): Promise<Result<IGetUserPreferencesOutputDto>> {
    const findResult = await this.userPreferenceRepo.findByUserId(input.userId);
    if (findResult.isFailure) {
      return Result.fail(findResult.getError());
    }

    return match<UserPreference, Promise<Result<IGetUserPreferencesOutputDto>>>(
      findResult.getValue(),
      {
        Some: async (preference) => Result.ok(this.toDto(preference)),
        None: async () => {
          const createResult = await this.createDefaultPreferences(
            input.userId,
          );
          if (createResult.isFailure) {
            return Result.fail(createResult.getError());
          }
          return Result.ok(this.toDto(createResult.getValue()));
        },
      },
    );
  }

  private async createDefaultPreferences(
    userId: string,
  ): Promise<Result<UserPreference>> {
    const { UserPreference } = await import(
      "@/domain/user-preference/user-preference.aggregate"
    );
    const createResult = UserPreference.createDefault(userId);
    if (createResult.isFailure) {
      return Result.fail(createResult.getError());
    }

    const preference = createResult.getValue();
    const saveResult = await this.userPreferenceRepo.create(preference);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    return Result.ok(preference);
  }

  private toDto(preference: UserPreference): IGetUserPreferencesOutputDto {
    return {
      id: preference.id.value.toString(),
      userId: preference.get("userId"),
      emailNotifications: preference.get("emailNotifications"),
      pushNotifications: preference.get("pushNotifications"),
      notifyNewMessages: preference.get("notifyNewMessages"),
      notifyFriendActivity: preference.get("notifyFriendActivity"),
      notifyBadgesEarned: preference.get("notifyBadgesEarned"),
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
