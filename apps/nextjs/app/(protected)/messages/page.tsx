import { requireAuth } from "@/adapters/guards/auth.guard";
import { MessagesPageClient } from "./_components/messages-page-client";

export default async function MessagesPage() {
  const session = await requireAuth();
  return (
    <MessagesPageClient
      userId={session.user.id}
      userName={session.user.name}
      userImage={session.user.image}
    />
  );
}
