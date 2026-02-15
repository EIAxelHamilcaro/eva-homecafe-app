import {
  deleteCalendarEventController,
  updateCalendarEventController,
} from "@/adapters/controllers/calendar-event/calendar-event.controller";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  return updateCalendarEventController(request, eventId);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  return deleteCalendarEventController(request, eventId);
}
