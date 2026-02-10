import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import Link from "next/link";
import { getProfileNames } from "@/adapters/queries/profile-names.query";
import { getInjection } from "@/common/di/container";
import { formatRelativeTime } from "./format-relative-time";
import { WidgetEmptyState } from "./widget-empty-state";

interface MessagesWidgetProps {
  userId: string;
}

export async function MessagesWidget({ userId }: MessagesWidgetProps) {
  const useCase = getInjection("GetConversationsUseCase");
  let result: Awaited<ReturnType<typeof useCase.execute>>;
  try {
    result = await useCase.execute({
      userId,
      pagination: { page: 1, limit: 3 },
    });
  } catch {
    return <WidgetEmptyState type="messages" />;
  }

  if (result.isFailure) {
    return <WidgetEmptyState type="messages" />;
  }

  const data = result.getValue();

  if (data.conversations.length === 0) {
    return <WidgetEmptyState type="messages" />;
  }

  const otherParticipantIds = data.conversations
    .flatMap((c) => c.participants.filter((p) => p.userId !== userId))
    .map((p) => p.userId);

  let nameMap: Map<string, string>;
  try {
    nameMap = await getProfileNames([...new Set(otherParticipantIds)]);
  } catch {
    nameMap = new Map();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link href="/messages" className="hover:underline">
            Messages
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {data.conversations.map((convo) => {
            const otherUser = convo.participants.find(
              (p) => p.userId !== userId,
            );
            const displayName = otherUser
              ? (nameMap.get(otherUser.userId) ?? "Unknown")
              : "Unknown";

            return (
              <li key={convo.id}>
                <Link
                  href="/messages"
                  className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">
                        {displayName}
                      </p>
                      {convo.lastMessage && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatRelativeTime(convo.lastMessage.sentAt)}
                        </span>
                      )}
                    </div>
                    {convo.lastMessage ? (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {convo.lastMessage.content}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        No messages yet
                      </p>
                    )}
                  </div>
                  {convo.unreadCount > 0 && (
                    <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                      {convo.unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
