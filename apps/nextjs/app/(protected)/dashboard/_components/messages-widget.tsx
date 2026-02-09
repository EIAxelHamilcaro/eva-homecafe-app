import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import Link from "next/link";
import { getInjection } from "@/common/di/container";
import { WidgetEmptyState } from "./widget-empty-state";

interface MessagesWidgetProps {
  userId: string;
}

export async function MessagesWidget({ userId }: MessagesWidgetProps) {
  const useCase = getInjection("GetConversationsUseCase");
  const result = await useCase.execute({
    userId,
    pagination: { page: 1, limit: 3 },
  });

  if (result.isFailure) {
    return <WidgetEmptyState type="messages" />;
  }

  const data = result.getValue();

  if (data.conversations.length === 0) {
    return <WidgetEmptyState type="messages" />;
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
          {data.conversations.map((convo) => (
            <li key={convo.id}>
              <Link
                href="/messages"
                className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  {convo.lastMessage ? (
                    <p className="text-sm truncate">
                      {convo.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
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
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
