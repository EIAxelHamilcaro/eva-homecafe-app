import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import {
  type RecipientDto,
  searchRecipients,
} from "@/adapters/queries/search-recipients.query";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import { getInjection } from "@/common/di/container";

async function getAuthenticatedUser(
  request: Request,
): Promise<IGetSessionOutputDto | null> {
  const useCase = getInjection("GetSessionUseCase");
  const result = await useCase.execute(request.headers);

  if (result.isFailure) {
    return null;
  }

  return match<IGetSessionOutputDto, IGetSessionOutputDto | null>(
    result.getValue(),
    {
      Some: (session) => session,
      None: () => null,
    },
  );
}

interface SearchRecipientsResponse {
  recipients: RecipientDto[];
}

export async function searchRecipientsController(
  request: Request,
): Promise<NextResponse<SearchRecipientsResponse | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const limit = Math.min(Number(url.searchParams.get("limit")) || 10, 50);

  if (search.length < 2) {
    return NextResponse.json({ recipients: [] });
  }

  const recipients = await searchRecipients(search, session.user.id, limit);

  return NextResponse.json({ recipients });
}
