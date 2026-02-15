import { Aggregate, Option, UUID } from "@packages/ddd-kit";
import { CalendarEventId } from "./calendar-event-id";
import type { EventColor } from "./value-objects/event-color.vo";
import type { EventTitle } from "./value-objects/event-title.vo";

export interface ICalendarEventProps {
  userId: string;
  title: EventTitle;
  color: EventColor;
  date: string;
  createdAt: Date;
  updatedAt: Option<Date>;
}

export class CalendarEvent extends Aggregate<ICalendarEventProps> {
  private constructor(props: ICalendarEventProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): CalendarEventId {
    return CalendarEventId.create(this._id);
  }

  updateTitle(title: EventTitle): void {
    this._props.title = title;
    this._props.updatedAt = Option.some(new Date());
  }

  updateColor(color: EventColor): void {
    this._props.color = color;
    this._props.updatedAt = Option.some(new Date());
  }

  updateDate(date: string): void {
    this._props.date = date;
    this._props.updatedAt = Option.some(new Date());
  }

  static create(
    props: {
      userId: string;
      title: EventTitle;
      color: EventColor;
      date: string;
    },
    id?: UUID<string | number>,
  ): CalendarEvent {
    return new CalendarEvent(
      { ...props, createdAt: new Date(), updatedAt: Option.none() },
      id ?? new UUID(),
    );
  }

  static reconstitute(
    props: ICalendarEventProps,
    id: CalendarEventId,
  ): CalendarEvent {
    return new CalendarEvent(props, id);
  }
}
