import { createModule } from "@evyweb/ioctopus";
import { GetNotificationsUseCase } from "@/application/use-cases/notification/get-notifications.use-case";
import { MarkNotificationReadUseCase } from "@/application/use-cases/notification/mark-notification-read.use-case";
import { DI_SYMBOLS } from "../types";

export const createNotificationModule = () => {
  const notificationModule = createModule();

  notificationModule
    .bind(DI_SYMBOLS.GetNotificationsUseCase)
    .toClass(GetNotificationsUseCase, [DI_SYMBOLS.INotificationRepository]);

  notificationModule
    .bind(DI_SYMBOLS.MarkNotificationReadUseCase)
    .toClass(MarkNotificationReadUseCase, [DI_SYMBOLS.INotificationRepository]);

  return notificationModule;
};
