import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type { ISendInviteEmailOutputDto } from "@/application/dto/friend/send-invite-email.dto";
import type { IEmailProvider } from "@/application/ports/email.provider.port";
import type { IInviteTokenRepository } from "@/application/ports/invite-token-repository.port";
import { EmailTemplates } from "@/application/services/email/templates";

interface ISendInviteEmailInput {
  recipientEmail: string;
  userId: string;
  senderName: string;
}

const INVITE_EXPIRY_HOURS = 24;

export class SendInviteEmailUseCase
  implements UseCase<ISendInviteEmailInput, ISendInviteEmailOutputDto>
{
  constructor(
    private readonly inviteTokenRepo: IInviteTokenRepository,
    private readonly emailProvider: IEmailProvider,
    private readonly inviteBaseUrl: string,
  ) {}

  async execute(
    input: ISendInviteEmailInput,
  ): Promise<Result<ISendInviteEmailOutputDto>> {
    const token = new UUID<string>().value.toString();

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + INVITE_EXPIRY_HOURS);

    const createResult = await this.inviteTokenRepo.create(
      input.userId,
      token,
      expiresAt,
    );
    if (createResult.isFailure) {
      return Result.fail(createResult.getError());
    }

    const inviteUrl = `${this.inviteBaseUrl}/${token}`;

    const template = EmailTemplates.friendInvite(input.senderName, inviteUrl);
    const emailResult = await this.emailProvider.send({
      to: input.recipientEmail,
      subject: template.subject,
      html: template.html,
    });

    if (emailResult.isFailure) {
      return Result.fail(emailResult.getError());
    }

    return Result.ok({
      success: true,
      message: `Invitation envoyee a ${input.recipientEmail}`,
    });
  }
}
