import { type DomainEvent, match, UUID } from "@packages/ddd-kit";
import type { IEmailProvider } from "@/application/ports/email.provider.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import type { IUserPreferenceRepository } from "@/application/ports/user-preference-repository.port";
import { EmailTemplates } from "@/application/services/email/templates";
import type { NotificationCreatedEvent } from "@/domain/notification/events/notification-created.event";
import { UserId } from "@/domain/user/user-id";

const NOTIFICATION_TYPE_TO_PREFERENCE: Record<string, string> = {
  friend_request: "notifyFriendActivity",
  friend_accepted: "notifyFriendActivity",
  new_message: "notifyNewMessages",
  reward_earned: "notifyBadgesEarned",
};

export class EmailNotificationHandler {
  constructor(
    private readonly emailProvider: IEmailProvider,
    private readonly userRepo: IUserRepository,
    private readonly userPrefRepo: IUserPreferenceRepository,
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    if (event.type !== "NotificationCreated") return;

    const notifEvent = event as NotificationCreatedEvent;
    const { userId, notificationType, title } = notifEvent;

    const prefsResult = await this.userPrefRepo.findByUserId(userId);
    if (prefsResult.isFailure) return;

    const shouldSend = match(prefsResult.getValue(), {
      Some: (prefs) => {
        if (!prefs.get("emailNotifications")) return false;

        const prefField = NOTIFICATION_TYPE_TO_PREFERENCE[notificationType];
        if (prefField) {
          const prefValue = prefs.get(
            prefField as keyof typeof prefs._props,
          ) as boolean;
          if (!prefValue) return false;
        }

        return true;
      },
      None: () => true,
    });

    if (!shouldSend) return;

    const userIdVO = UserId.create(new UUID(userId));
    const userResult = await this.userRepo.findById(userIdVO);
    if (userResult.isFailure) return;

    const email = match(userResult.getValue(), {
      Some: (user) => user.get("email").value,
      None: () => null,
    });

    if (!email) return;

    const template = EmailTemplates.notification({
      type: notificationType,
      title,
      body: notifEvent.body,
    });

    await this.emailProvider.send({
      to: email,
      subject: template.subject,
      html: template.html,
    });
  }
}
