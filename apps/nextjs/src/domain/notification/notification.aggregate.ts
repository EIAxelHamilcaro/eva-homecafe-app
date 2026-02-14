import {
  Aggregate,
  type Option,
  Option as OptionClass,
  Result,
  UUID,
} from "@packages/ddd-kit";
import { NotificationCreatedEvent } from "./events/notification-created.event";
import { NotificationReadEvent } from "./events/notification-read.event";
import { NotificationId } from "./notification-id";
import type { NotificationType } from "./value-objects/notification-type.vo";

export interface INotificationProps {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  readAt: Option<Date>;
  createdAt: Date;
}

export class Notification extends Aggregate<INotificationProps> {
  private constructor(props: INotificationProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): NotificationId {
    return NotificationId.create(this._id);
  }

  static create(
    props: Omit<INotificationProps, "readAt" | "createdAt"> & {
      readAt?: Option<Date>;
    },
    id?: UUID<string | number>,
  ): Result<Notification> {
    const newId = id ?? new UUID<string>();

    const notification = new Notification(
      {
        userId: props.userId,
        type: props.type,
        title: props.title,
        body: props.body,
        data: props.data,
        readAt: props.readAt ?? OptionClass.none(),
        createdAt: new Date(),
      },
      newId,
    );

    notification.addEvent(
      new NotificationCreatedEvent(
        newId.value.toString(),
        props.userId,
        props.type.value,
        props.title,
        props.body,
      ),
    );

    return Result.ok(notification);
  }

  static reconstitute(
    props: INotificationProps,
    id: NotificationId,
  ): Notification {
    return new Notification(props, id);
  }

  markAsRead(): Result<void> {
    if (this._props.readAt.isSome()) {
      return Result.fail("Notification is already read");
    }

    this._props.readAt = OptionClass.some(new Date());

    this.addEvent(
      new NotificationReadEvent(this.id.value.toString(), this.get("userId")),
    );

    return Result.ok();
  }

  get isRead(): boolean {
    return this._props.readAt.isSome();
  }
}
