import { match } from "@packages/ddd-kit";
import { db, post, postComment } from "@packages/drizzle";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { canUserAccessPost } from "@/adapters/queries/post-access.query";
import type { IGetPostCommentsOutputDto } from "@/adapters/queries/post-comments.query";
import { getPostComments } from "@/adapters/queries/post-comments.query";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import { getInjection } from "@/common/di/container";
import { Notification } from "@/domain/notification/notification.aggregate";
import { NotificationType } from "@/domain/notification/value-objects/notification-type.vo";

const createCommentSchema = z.object({
  content: z.string().min(1, "Le commentaire ne peut pas être vide").max(2000),
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

export async function createPostCommentController(
  request: Request,
  postId: string,
): Promise<NextResponse<{ id: string } | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await canUserAccessPost(session.user.id, postId);
  if (!access.canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createCommentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const id = crypto.randomUUID();
  await db.insert(postComment).values({
    id,
    postId,
    userId: session.user.id,
    content: parsed.data.content,
  });

  const [postRow] = await db
    .select({ userId: post.userId })
    .from(post)
    .where(eq(post.id, postId))
    .limit(1);

  if (postRow && postRow.userId !== session.user.id) {
    const typeResult = NotificationType.createPostComment();
    if (typeResult.isSuccess) {
      const notifResult = Notification.create({
        userId: postRow.userId,
        type: typeResult.getValue(),
        title: "Nouveau commentaire",
        body: `${session.user.name} a commenté votre publication`,
        data: { postId, commentId: id, commenterId: session.user.id },
      });
      if (notifResult.isSuccess) {
        const notification = notifResult.getValue();
        const notificationRepo = getInjection("INotificationRepository");
        const saveResult = await notificationRepo.create(notification);
        if (saveResult.isSuccess) {
          const eventDispatcher = getInjection("IEventDispatcher");
          await eventDispatcher.dispatchAll(notification.domainEvents);
          notification.clearEvents();
        }
      }
    }
  }

  return NextResponse.json({ id }, { status: 201 });
}

export async function getPostCommentsController(
  request: Request,
  postId: string,
): Promise<NextResponse<IGetPostCommentsOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await canUserAccessPost(session.user.id, postId);
  if (!access.canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comments = await getPostComments(postId);
  return NextResponse.json(comments);
}

export async function updatePostCommentController(
  request: Request,
  postId: string,
  commentId: string,
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createCommentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const result = await db
    .update(postComment)
    .set({ content: parsed.data.content })
    .where(
      and(
        eq(postComment.id, commentId),
        eq(postComment.postId, postId),
        eq(postComment.userId, session.user.id),
      ),
    )
    .returning({ id: postComment.id });

  if (result.length === 0) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function deletePostCommentController(
  request: Request,
  postId: string,
  commentId: string,
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db
    .delete(postComment)
    .where(
      and(
        eq(postComment.id, commentId),
        eq(postComment.postId, postId),
        eq(postComment.userId, session.user.id),
      ),
    )
    .returning({ id: postComment.id });

  if (result.length === 0) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
