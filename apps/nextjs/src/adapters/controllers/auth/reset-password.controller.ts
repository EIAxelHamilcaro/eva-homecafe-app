import { NextResponse } from "next/server";
import { resetPasswordInputDtoSchema } from "@/application/dto/reset-password.dto";
import { getInjection } from "@/common/di/container";

export async function resetPasswordController(request: Request) {
  const json = await request.json();
  const parsed = resetPasswordInputDtoSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("ResetPasswordUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json(
      { error: "Invalid or expired token", code: "INVALID_TOKEN" },
      { status: 400 },
    );
  }

  return NextResponse.json({ message: "Password reset successfully" });
}
