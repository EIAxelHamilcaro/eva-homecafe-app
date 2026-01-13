import type { Result } from "@packages/ddd-kit";

export type EmailType = "PASSWORD_RESET" | "WELCOME" | "EMAIL_VERIFICATION";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface IEmailProvider {
  send(payload: EmailPayload): Promise<Result<void>>;
}
