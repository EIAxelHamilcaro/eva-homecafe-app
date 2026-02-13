import { Card, CardContent } from "@packages/ui/components/ui/card";
import { Eye } from "lucide-react";
import Link from "next/link";
import { getProfileNames } from "@/adapters/queries/profile-names.query";
import type { IConversationDto } from "@/application/dto/chat/get-conversations.dto";
import { getInjection } from "@/common/di/container";

interface MessagesWidgetProps {
  userId: string;
}

export async function MessagesWidget({ userId }: MessagesWidgetProps) {
  const useCase = getInjection("GetConversationsUseCase");
  let conversations: IConversationDto[] = [];

  try {
    const result = await useCase.execute({
      userId,
      pagination: { page: 1, limit: 10 },
    });
    if (result.isSuccess) {
      conversations = result
        .getValue()
        .conversations.filter((c) => c.unreadCount > 0);
    }
  } catch {
    /* empty */
  }

  if (conversations.length === 0) {
    return (
      <Card className="border-0 relative">
        <Eye className="absolute top-3 right-3 h-5 w-5 text-homecafe-blue" />

        <CardContent className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Messagerie</h3>
              <p className="text-sm text-muted-foreground">
                Ceci est un affichage restreint
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Aucun message non lu
          </p>
          <Link
            href="/messages"
            className="mt-4 inline-block rounded-full bg-homecafe-pink px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            Voir plus
          </Link>
        </CardContent>
      </Card>
    );
  }

  const otherParticipantIds = conversations
    .flatMap((c) => c.participants.filter((p) => p.userId !== userId))
    .map((p) => p.userId);

  let nameMap: Map<string, string>;
  try {
    nameMap = await getProfileNames([...new Set(otherParticipantIds)]);
  } catch {
    nameMap = new Map();
  }

  return (
    <Card className="border-0">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Messagerie</h3>
            <p className="text-sm text-muted-foreground">
              Ceci est un affichage restreint
            </p>
          </div>
          <Eye className="h-5 w-5 text-muted-foreground" />
        </div>
        <ul className="mt-4 space-y-3">
          {conversations.map((convo) => {
            const otherUser = convo.participants.find(
              (p) => p.userId !== userId,
            );
            const displayName = otherUser
              ? (nameMap.get(otherUser.userId) ?? "Inconnu")
              : "Inconnu";

            return (
              <li key={convo.id}>
                <Link
                  href="/messages"
                  className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{displayName}</p>
                    {convo.lastMessage && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {convo.lastMessage.content}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    {convo.unreadCount}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <Link
          href="/messages"
          className="mt-4 inline-block rounded-full bg-homecafe-green px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          Voir plus
        </Link>
      </CardContent>
    </Card>
  );
}
