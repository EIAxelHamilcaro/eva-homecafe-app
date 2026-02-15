import { createModule } from "@evyweb/ioctopus";
import { DrizzleCalendarEventRepository } from "@/adapters/repositories/calendar-event.repository";
import { CreateCalendarEventUseCase } from "@/application/use-cases/calendar-event/create-calendar-event.use-case";
import { DeleteCalendarEventUseCase } from "@/application/use-cases/calendar-event/delete-calendar-event.use-case";
import { GetUserCalendarEventsUseCase } from "@/application/use-cases/calendar-event/get-user-calendar-events.use-case";
import { UpdateCalendarEventUseCase } from "@/application/use-cases/calendar-event/update-calendar-event.use-case";
import { DI_SYMBOLS } from "../types";

export const createCalendarEventModule = () => {
  const m = createModule();
  m.bind(DI_SYMBOLS.ICalendarEventRepository).toClass(
    DrizzleCalendarEventRepository,
  );
  m.bind(DI_SYMBOLS.CreateCalendarEventUseCase).toClass(
    CreateCalendarEventUseCase,
    [DI_SYMBOLS.ICalendarEventRepository],
  );
  m.bind(DI_SYMBOLS.DeleteCalendarEventUseCase).toClass(
    DeleteCalendarEventUseCase,
    [DI_SYMBOLS.ICalendarEventRepository],
  );
  m.bind(DI_SYMBOLS.GetUserCalendarEventsUseCase).toClass(
    GetUserCalendarEventsUseCase,
    [DI_SYMBOLS.ICalendarEventRepository],
  );
  m.bind(DI_SYMBOLS.UpdateCalendarEventUseCase).toClass(
    UpdateCalendarEventUseCase,
    [DI_SYMBOLS.ICalendarEventRepository],
  );
  return m;
};
