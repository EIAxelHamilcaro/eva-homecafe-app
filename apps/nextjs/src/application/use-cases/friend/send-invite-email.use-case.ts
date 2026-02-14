import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type { ISendInviteEmailOutputDto } from "@/application/dto/friend/send-invite-email.dto";
import type { IEmailProvider } from "@/application/ports/email.provider.port";
import type { IInviteTokenRepository } from "@/application/ports/invite-token-repository.port";

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

    const emailResult = await this.emailProvider.send({
      to: input.recipientEmail,
      subject: `${input.senderName} t'invite sur HomeCafe`,
      html: this.buildEmailHtml(input.senderName, inviteUrl),
    });

    if (emailResult.isFailure) {
      return Result.fail(emailResult.getError());
    }

    return Result.ok({
      success: true,
      message: `Invitation envoyee a ${input.recipientEmail}`,
    });
  }

  private buildEmailHtml(senderName: string, inviteUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #fdf2f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fdf2f8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899, #f472b6); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">HomeCafe</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              <p style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 600;">
                Salut !
              </p>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                <strong>${senderName}</strong> t'invite a rejoindre <strong>HomeCafe</strong>, l'application pour partager tes moments cafe preferes avec tes proches.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="${inviteUrl}" style="display: inline-block; padding: 14px 32px; background-color: #ec4899; color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 16px; font-weight: 600;">
                      Rejoindre HomeCafe
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 13px; line-height: 1.5;">
                Ce lien est valide pendant 24 heures. Si tu ne peux pas cliquer sur le bouton, copie ce lien dans ton navigateur :
              </p>
              <p style="margin: 0; color: #ec4899; font-size: 13px; word-break: break-all;">
                ${inviteUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 24px; background-color: #fdf2f8; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                HomeCafe &mdash; Partage tes moments cafe
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
