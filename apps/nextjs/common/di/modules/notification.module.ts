import { createModule } from "@evyweb/ioctopus";
import { getJournalReminderEligibleUsers } from "@/adapters/queries/journal-reminder-eligible-users.query";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IJournalReminderQueryProvider } from "@/application/ports/journal-reminder-query.provider.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import { GetNotificationsUseCase } from "@/application/use-cases/notification/get-notifications.use-case";
import { MarkNotificationReadUseCase } from "@/application/use-cases/notification/mark-notification-read.use-case";
import { SendJournalRemindersUseCase } from "@/application/use-cases/notification/send-journal-reminders.use-case";
import { DI_SYMBOLS } from "../types";

const journalReminderQueryProvider: IJournalReminderQueryProvider = {
  getEligibleUsers: getJournalReminderEligibleUsers,
};

export const createNotificationModule = () => {
  const notificationModule = createModule();

  notificationModule
    .bind(DI_SYMBOLS.GetNotificationsUseCase)
    .toClass(GetNotificationsUseCase, [DI_SYMBOLS.INotificationRepository]);

  notificationModule
    .bind(DI_SYMBOLS.MarkNotificationReadUseCase)
    .toClass(MarkNotificationReadUseCase, [DI_SYMBOLS.INotificationRepository]);

  notificationModule
    .bind(DI_SYMBOLS.SendJournalRemindersUseCase)
    .toHigherOrderFunction(
      (
        notificationRepo: INotificationRepository,
        eventDispatcher: IEventDispatcher,
      ) => {
        return new SendJournalRemindersUseCase(
          notificationRepo,
          eventDispatcher,
          journalReminderQueryProvider,
        );
      },
      [DI_SYMBOLS.INotificationRepository, DI_SYMBOLS.IEventDispatcher],
    );

  return notificationModule;
};
