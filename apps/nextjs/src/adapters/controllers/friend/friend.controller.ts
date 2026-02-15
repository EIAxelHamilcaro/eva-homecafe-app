import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { IAcceptInviteOutputDto } from "@/application/dto/friend/accept-invite.dto";
import type { IGetFriendsOutputDto } from "@/application/dto/friend/get-friends.dto";
import type { IGetInviteLinkOutputDto } from "@/application/dto/friend/get-invite-link.dto";
import type { IGetPendingRequestsOutputDto } from "@/application/dto/friend/get-pending-requests.dto";
import {
  type IRemoveFriendOutputDto,
  removeFriendInputDtoSchema,
} from "@/application/dto/friend/remove-friend.dto";
import {
  type IRespondFriendRequestOutputDto,
  respondFriendRequestInputDtoSchema,
} from "@/application/dto/friend/respond-friend-request.dto";
import {
  type ISendFriendRequestOutputDto,
  sendFriendRequestInputDtoSchema,
} from "@/application/dto/friend/send-friend-request.dto";
import {
  type ISendInviteEmailOutputDto,
  sendInviteEmailInputDtoSchema,
} from "@/application/dto/friend/send-invite-email.dto";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import { getInjection } from "@/common/di/container";

const acceptInviteRequestSchema = z.object({
  token: z.string().min(1),
});

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

export async function sendRequest(
  request: Request,
): Promise<NextResponse<ISendFriendRequestOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = sendFriendRequestInputDtoSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("SendFriendRequestUseCase");
  const result = await useCase.execute({
    ...parseResult.data,
    senderId: session.user.id,
    senderName: session.user.name,
  });

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Cannot send friend request to yourself") {
      return NextResponse.json({ error }, { status: 400 });
    }
    if (error === "User not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    if (
      error === "Friend request already pending" ||
      error === "Already friends"
    ) {
      return NextResponse.json({ error }, { status: 409 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}

export async function respondRequest(
  request: Request,
): Promise<NextResponse<IRespondFriendRequestOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = respondFriendRequestInputDtoSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("RespondFriendRequestUseCase");
  const result = await useCase.execute({
    ...parseResult.data,
    userId: session.user.id,
  });

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Friend request not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    if (error === "You are not authorized to respond to this friend request") {
      return NextResponse.json({ error }, { status: 403 });
    }
    if (
      error === "Can only accept pending friend requests" ||
      error === "Can only reject pending friend requests"
    ) {
      return NextResponse.json({ error }, { status: 409 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function getFriends(
  request: Request,
): Promise<NextResponse<IGetFriendsOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = url.searchParams.get("page");
  const limit = url.searchParams.get("limit");

  const useCase = getInjection("GetFriendsUseCase");
  const result = await useCase.execute({
    userId: session.user.id,
    page: page ? Number.parseInt(page, 10) : undefined,
    limit: limit ? Number.parseInt(limit, 10) : undefined,
  });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function getPendingRequests(
  request: Request,
): Promise<NextResponse<IGetPendingRequestsOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = url.searchParams.get("page");
  const limit = url.searchParams.get("limit");

  const useCase = getInjection("GetPendingRequestsUseCase");
  const result = await useCase.execute({
    userId: session.user.id,
    page: page ? Number.parseInt(page, 10) : undefined,
    limit: limit ? Number.parseInt(limit, 10) : undefined,
  });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function getInviteLink(
  request: Request,
): Promise<NextResponse<IGetInviteLinkOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const useCase = getInjection("GetInviteLinkUseCase");
  const result = await useCase.execute({
    userId: session.user.id,
  });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}

export async function acceptInvite(
  request: Request,
): Promise<NextResponse<IAcceptInviteOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = acceptInviteRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("AcceptInviteLinkUseCase");
  const result = await useCase.execute({
    token: parseResult.data.token,
    userId: session.user.id,
  });

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Invalid or expired invite token") {
      return NextResponse.json({ error }, { status: 404 });
    }
    if (error === "Cannot accept your own invite") {
      return NextResponse.json({ error }, { status: 400 });
    }
    if (error === "Already friends with this user") {
      return NextResponse.json({ error }, { status: 409 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}

export async function sendInviteEmail(
  request: Request,
): Promise<NextResponse<ISendInviteEmailOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = sendInviteEmailInputDtoSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("SendInviteEmailUseCase");
  const result = await useCase.execute({
    ...parseResult.data,
    userId: session.user.id,
    senderName: session.user.name,
  });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}

export async function removeFriend(
  request: Request,
): Promise<NextResponse<IRemoveFriendOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = removeFriendInputDtoSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("RemoveFriendUseCase");
  const result = await useCase.execute({
    ...parseResult.data,
    userId: session.user.id,
  });

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Friendship not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}
