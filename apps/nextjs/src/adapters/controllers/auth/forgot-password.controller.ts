import { NextResponse } from "next/server";
import { forgotPasswordInputDtoSchema } from "@/application/dto/forgot-password.dto";
import { getInjection } from "@/common/di/container";

export async function forgotPasswordController(request: Request) {
  const json = await request.json();
  const parsed = forgotPasswordInputDtoSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("ForgotPasswordUseCase");
  await useCase.execute(parsed.data);

  return NextResponse.json({ message: "Email sent if account exists" });
}
