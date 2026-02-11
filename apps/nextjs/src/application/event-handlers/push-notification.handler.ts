import { type DomainEvent, match } from "@packages/ddd-kit";
import type { IPushNotificationProvider } from "@/application/ports/push-notification-provider.port";
import type { IPushTokenRepository } from "@/application/ports/push-token-repository.port";
import type { IUserPreferenceRepository } from "@/application/ports/user-preference-repository.port";
import type { NotificationCreatedEvent } from "@/domain/notification/events/notification-created.event";

const NOTIFICATION_TYPE_TO_PREFERENCE: Record<string, string> = {
  friend_request: "notifyFriendActivity",
  friend_accepted: "notifyFriendActivity",
  new_message: "notifyNewMessages",
  reward_earned: "notifyBadgesEarned",
};

export class PushNotificationHandler {
  constructor(
    private readonly pushProvider: IPushNotificationProvider,
    private readonly pushTokenRepo: IPushTokenRepository,
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
        if (!prefs.get("pushNotifications")) return false;

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

    const tokensResult = await this.pushTokenRepo.findByUserId(userId);
    if (tokensResult.isFailure) return;

    const tokens = tokensResult.getValue();
    if (tokens.length === 0) return;

    for (const token of tokens) {
      await this.pushProvider.send(token.get("token"), {
        title,
        body: "",
        data: {
          notificationType,
          notificationId: notifEvent.aggregateId,
        },
      });
    }
  }
}
