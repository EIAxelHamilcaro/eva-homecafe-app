import { match, Result, type UseCase, UUID } from "@packages/ddd-kit";
import { calendarEventToDto } from "@/application/dto/calendar-event/common-calendar-event.dto";
import type {
  IUpdateCalendarEventInputDto,
  IUpdateCalendarEventOutputDto,
} from "@/application/dto/calendar-event/update-calendar-event.dto";
import type { ICalendarEventRepository } from "@/application/ports/calendar-event-repository.port";
import { CalendarEventId } from "@/domain/calendar-event/calendar-event-id";
import { EventColor } from "@/domain/calendar-event/value-objects/event-color.vo";
import { EventTitle } from "@/domain/calendar-event/value-objects/event-title.vo";

export class UpdateCalendarEventUseCase
  implements
    UseCase<IUpdateCalendarEventInputDto, IUpdateCalendarEventOutputDto>
{
  constructor(private readonly repo: ICalendarEventRepository) {}

  async execute(
    input: IUpdateCalendarEventInputDto,
  ): Promise<Result<IUpdateCalendarEventOutputDto>> {
    const id = CalendarEventId.create(new UUID(input.eventId));
    const findResult = await this.repo.findById(id);
    if (findResult.isFailure) return Result.fail(findResult.getError());

    const event = match(findResult.getValue(), {
      Some: (e) => e,
      None: () => null,
    });
    if (!event) return Result.fail("Event not found");
    if (event.get("userId") !== input.userId) return Result.fail("Forbidden");

    if (input.title !== undefined) {
      const titleResult = EventTitle.create(input.title);
      if (titleResult.isFailure) return Result.fail(titleResult.getError());
      event.updateTitle(titleResult.getValue());
    }

    if (input.color !== undefined) {
      const colorResult = EventColor.create(input.color);
      if (colorResult.isFailure) return Result.fail(colorResult.getError());
      event.updateColor(colorResult.getValue());
    }

    if (input.date !== undefined) {
      event.updateDate(input.date);
    }

    const updateResult = await this.repo.update(event);
    if (updateResult.isFailure) return Result.fail(updateResult.getError());

    return Result.ok(calendarEventToDto(event));
  }
}
