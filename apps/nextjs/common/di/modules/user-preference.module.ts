import { createModule } from "@evyweb/ioctopus";
import { DrizzleUserPreferenceRepository } from "@/adapters/repositories/user-preference.repository";
import { GetUserPreferencesUseCase } from "@/application/use-cases/user-preference/get-user-preferences.use-case";
import { UpdateUserPreferencesUseCase } from "@/application/use-cases/user-preference/update-user-preferences.use-case";
import { DI_SYMBOLS } from "../types";

export const createUserPreferenceModule = () => {
  const userPreferenceModule = createModule();

  userPreferenceModule
    .bind(DI_SYMBOLS.IUserPreferenceRepository)
    .toClass(DrizzleUserPreferenceRepository);

  userPreferenceModule
    .bind(DI_SYMBOLS.GetUserPreferencesUseCase)
    .toClass(GetUserPreferencesUseCase, [DI_SYMBOLS.IUserPreferenceRepository]);

  userPreferenceModule
    .bind(DI_SYMBOLS.UpdateUserPreferencesUseCase)
    .toClass(UpdateUserPreferencesUseCase, [
      DI_SYMBOLS.IUserPreferenceRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  return userPreferenceModule;
};
