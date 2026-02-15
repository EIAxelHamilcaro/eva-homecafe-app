import { Result, type UseCase } from "@packages/ddd-kit";
import { calendarEventToDto } from "@/application/dto/calendar-event/common-calendar-event.dto";
import type {
  IGetCalendarEventsInputDto,
  IGetCalendarEventsOutputDto,
} from "@/application/dto/calendar-event/get-calendar-events.dto";
import type { ICalendarEventRepository } from "@/application/ports/calendar-event-repository.port";

export class GetUserCalendarEventsUseCase
  implements UseCase<IGetCalendarEventsInputDto, IGetCalendarEventsOutputDto>
{
  constructor(private readonly repo: ICalendarEventRepository) {}

  async execute(
    input: IGetCalendarEventsInputDto,
  ): Promise<Result<IGetCalendarEventsOutputDto>> {
    const result = await this.repo.findByUserIdAndMonth(
      input.userId,
      input.month,
    );
    if (result.isFailure) return Result.fail(result.getError());

    return Result.ok({ events: result.getValue().map(calendarEventToDto) });
  }
}
