import { NextResponse } from "next/server";
import { sendContactMessageInputDtoSchema } from "@/application/dto/contact/send-contact-message.dto";
import { getInjection } from "@/common/di/container";

export async function sendContactMessageController(
  request: Request,
): Promise<NextResponse<{ success: true } | { error: string }>> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const parsed = sendContactMessageInputDtoSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("SendContactMessageUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
