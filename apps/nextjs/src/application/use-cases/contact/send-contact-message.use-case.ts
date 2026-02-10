import { Result, type UseCase } from "@packages/ddd-kit";
import type { ISendContactMessageInputDto } from "@/application/dto/contact/send-contact-message.dto";
import type { IEmailProvider } from "@/application/ports/email.provider.port";
import { EmailTemplates } from "@/application/services/email/templates";

export class SendContactMessageUseCase
  implements UseCase<ISendContactMessageInputDto, void>
{
  constructor(
    private readonly emailProvider: IEmailProvider,
    private readonly supportEmail: string,
  ) {}

  async execute(input: ISendContactMessageInputDto): Promise<Result<void>> {
    const { name, email, subject, message } = input;

    const supportTemplate = EmailTemplates.contactForm({
      name: this.escapeHtml(name),
      email: this.escapeHtml(email),
      subject: this.escapeHtml(subject),
      message: this.escapeHtml(message),
    });

    const supportResult = await this.emailProvider.send({
      to: this.supportEmail,
      subject: supportTemplate.subject,
      html: supportTemplate.html,
    });

    if (supportResult.isFailure) {
      return Result.fail(supportResult.getError());
    }

    const confirmationTemplate = EmailTemplates.contactConfirmation(
      this.escapeHtml(name),
    );

    try {
      await this.emailProvider.send({
        to: email,
        subject: confirmationTemplate.subject,
        html: confirmationTemplate.html,
      });
    } catch {
      // Confirmation email failure is non-critical
    }

    return Result.ok();
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}
