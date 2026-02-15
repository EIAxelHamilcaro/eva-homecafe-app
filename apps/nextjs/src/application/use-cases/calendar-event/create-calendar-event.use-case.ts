import { Result, type UseCase } from "@packages/ddd-kit";
import { calendarEventToDto } from "@/application/dto/calendar-event/common-calendar-event.dto";
import type {
  ICreateCalendarEventInputDto,
  ICreateCalendarEventOutputDto,
} from "@/application/dto/calendar-event/create-calendar-event.dto";
import type { ICalendarEventRepository } from "@/application/ports/calendar-event-repository.port";
import { CalendarEvent } from "@/domain/calendar-event/calendar-event.aggregate";
import { EventColor } from "@/domain/calendar-event/value-objects/event-color.vo";
import { EventTitle } from "@/domain/calendar-event/value-objects/event-title.vo";

export class CreateCalendarEventUseCase
  implements
    UseCase<ICreateCalendarEventInputDto, ICreateCalendarEventOutputDto>
{
  constructor(private readonly repo: ICalendarEventRepository) {}

  async execute(
    input: ICreateCalendarEventInputDto,
  ): Promise<Result<ICreateCalendarEventOutputDto>> {
    const titleResult = EventTitle.create(input.title);
    if (titleResult.isFailure) return Result.fail(titleResult.getError());

    const colorResult = EventColor.create(input.color);
    if (colorResult.isFailure) return Result.fail(colorResult.getError());

    const event = CalendarEvent.create({
      userId: input.userId,
      title: titleResult.getValue(),
      color: colorResult.getValue(),
      date: input.date,
    });

    const saveResult = await this.repo.create(event);
    if (saveResult.isFailure) return Result.fail(saveResult.getError());

    return Result.ok(calendarEventToDto(event));
  }
}
