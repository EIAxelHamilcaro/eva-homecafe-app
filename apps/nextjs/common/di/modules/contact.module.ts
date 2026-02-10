import { createModule } from "@evyweb/ioctopus";
import type { IEmailProvider } from "@/application/ports/email.provider.port";
import { SendContactMessageUseCase } from "@/application/use-cases/contact/send-contact-message.use-case";
import { DI_SYMBOLS } from "../types";

const supportEmail =
  process.env.CONTACT_EMAIL ??
  process.env.RESEND_FROM_EMAIL ??
  "support@homecafe.app";

export const createContactModule = () => {
  const contactModule = createModule();

  contactModule
    .bind(DI_SYMBOLS.SendContactMessageUseCase)
    .toHigherOrderFunction(
      (emailProvider: IEmailProvider) => {
        return new SendContactMessageUseCase(emailProvider, supportEmail);
      },
      [DI_SYMBOLS.IEmailProvider],
    );

  return contactModule;
};
