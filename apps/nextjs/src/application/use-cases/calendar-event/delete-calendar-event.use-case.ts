import { match, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IDeleteCalendarEventInputDto,
  IDeleteCalendarEventOutputDto,
} from "@/application/dto/calendar-event/delete-calendar-event.dto";
import type { ICalendarEventRepository } from "@/application/ports/calendar-event-repository.port";
import { CalendarEventId } from "@/domain/calendar-event/calendar-event-id";

export class DeleteCalendarEventUseCase
  implements
    UseCase<IDeleteCalendarEventInputDto, IDeleteCalendarEventOutputDto>
{
  constructor(private readonly repo: ICalendarEventRepository) {}

  async execute(
    input: IDeleteCalendarEventInputDto,
  ): Promise<Result<IDeleteCalendarEventOutputDto>> {
    const id = CalendarEventId.create(new UUID(input.eventId));
    const findResult = await this.repo.findById(id);
    if (findResult.isFailure) return Result.fail(findResult.getError());

    const event = match(findResult.getValue(), {
      Some: (e) => e,
      None: () => null,
    });
    if (!event) return Result.fail("Event not found");
    if (event.get("userId") !== input.userId) return Result.fail("Forbidden");

    const deleteResult = await this.repo.delete(id);
    if (deleteResult.isFailure) return Result.fail(deleteResult.getError());

    return Result.ok({ deleted: true });
  }
}
