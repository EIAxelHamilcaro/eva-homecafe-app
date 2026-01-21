import { createModule } from "@evyweb/ioctopus";
import { DrizzleProfileRepository } from "@/adapters/repositories/profile.repository";
import { CreateProfileUseCase } from "@/application/use-cases/profile/create-profile.use-case";
import { GetProfileUseCase } from "@/application/use-cases/profile/get-profile.use-case";
import { UpdateProfileUseCase } from "@/application/use-cases/profile/update-profile.use-case";
import { DI_SYMBOLS } from "../types";

export const createProfileModule = () => {
  const profileModule = createModule();

  profileModule
    .bind(DI_SYMBOLS.IProfileRepository)
    .toClass(DrizzleProfileRepository);

  profileModule
    .bind(DI_SYMBOLS.CreateProfileUseCase)
    .toClass(CreateProfileUseCase, [DI_SYMBOLS.IProfileRepository]);

  profileModule
    .bind(DI_SYMBOLS.GetProfileUseCase)
    .toClass(GetProfileUseCase, [DI_SYMBOLS.IProfileRepository]);

  profileModule
    .bind(DI_SYMBOLS.UpdateProfileUseCase)
    .toClass(UpdateProfileUseCase, [DI_SYMBOLS.IProfileRepository]);

  return profileModule;
};
