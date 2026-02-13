import { type DomainEvent, match, UUID } from "@packages/ddd-kit";
import type { IEmailProvider } from "@/application/ports/email.provider.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import type { IUserPreferenceRepository } from "@/application/ports/user-preference-repository.port";
import type { NotificationCreatedEvent } from "@/domain/notification/events/notification-created.event";
import { UserId } from "@/domain/user/user-id";

const NOTIFICATION_TYPE_TO_PREFERENCE: Record<string, string> = {
  friend_request: "notifyFriendActivity",
  friend_accepted: "notifyFriendActivity",
  new_message: "notifyNewMessages",
  reward_earned: "notifyBadgesEarned",
};

const NOTIFICATION_TYPE_TO_SUBJECT: Record<string, string> = {
  friend_request: "Nouvelle demande d'ami",
  friend_accepted: "Demande d'ami acceptée",
  new_message: "Nouveau message",
  reward_earned: "Nouveau badge obtenu",
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

    const subject =
      NOTIFICATION_TYPE_TO_SUBJECT[notificationType] ?? "Nouvelle notification";

    await this.emailProvider.send({
      to: email,
      subject: `HomeCafé — ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #3D2E2E; margin-bottom: 8px;">${subject}</h2>
          <p style="color: #6B5E5E; font-size: 14px;">${title}</p>
          <hr style="border: none; border-top: 1px solid #F3E8E8; margin: 16px 0;" />
          <p style="color: #9B8E8E; font-size: 12px;">
            Vous recevez cet e-mail car les notifications par e-mail sont activées dans vos paramètres.
          </p>
        </div>
      `,
    });
  }
}
