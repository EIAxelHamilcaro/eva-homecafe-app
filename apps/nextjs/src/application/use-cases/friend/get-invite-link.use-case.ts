import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IGetInviteLinkInputDto,
  IGetInviteLinkOutputDto,
} from "@/application/dto/friend/get-invite-link.dto";
import type { IInviteTokenRepository } from "@/application/ports/invite-token-repository.port";

const INVITE_EXPIRY_HOURS = 24;

export class GetInviteLinkUseCase
  implements UseCase<IGetInviteLinkInputDto, IGetInviteLinkOutputDto>
{
  constructor(
    private readonly inviteTokenRepo: IInviteTokenRepository,
    private readonly inviteBaseUrl: string,
  ) {}

  async execute(
    input: IGetInviteLinkInputDto,
  ): Promise<Result<IGetInviteLinkOutputDto>> {
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

    return Result.ok({
      inviteUrl,
      token,
      expiresAt: expiresAt.toISOString(),
    });
  }
}
