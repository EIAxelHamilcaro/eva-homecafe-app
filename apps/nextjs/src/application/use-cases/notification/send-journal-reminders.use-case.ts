import { Result, type UseCase } from "@packages/ddd-kit";
import type { ISendJournalRemindersOutputDto } from "@/application/dto/notification/send-journal-reminders.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IJournalReminderQueryProvider } from "@/application/ports/journal-reminder-query.provider.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import { Notification } from "@/domain/notification/notification.aggregate";
import { NotificationType } from "@/domain/notification/value-objects/notification-type.vo";

export class SendJournalRemindersUseCase
  implements UseCase<void, ISendJournalRemindersOutputDto>
{
  constructor(
    private readonly notificationRepo: INotificationRepository,
    private readonly eventDispatcher: IEventDispatcher,
    private readonly queryProvider: IJournalReminderQueryProvider,
  ) {}

  async execute(): Promise<Result<ISendJournalRemindersOutputDto>> {
    const eligibleUsers = await this.queryProvider.getEligibleUsers();

    const typeResult = NotificationType.createJournalReminder();
    if (typeResult.isFailure) {
      return Result.fail(typeResult.getError());
    }

    let sent = 0;

    for (const { userId } of eligibleUsers) {
      const notifResult = Notification.create({
        userId,
        type: typeResult.getValue(),
        title: "Rappel journal",
        body: "Tu n'as pas encore écrit dans ton journal aujourd'hui. Prends un moment pour noter tes pensées !",
        data: {},
      });

      if (notifResult.isFailure) continue;

      const notification = notifResult.getValue();
      const saveResult = await this.notificationRepo.create(notification);
      if (saveResult.isFailure) continue;

      await this.eventDispatcher.dispatchAll(notification.domainEvents);
      notification.clearEvents();
      sent++;
    }

    return Result.ok({
      eligibleUsers: eligibleUsers.length,
      notificationsSent: sent,
    });
  }
}
