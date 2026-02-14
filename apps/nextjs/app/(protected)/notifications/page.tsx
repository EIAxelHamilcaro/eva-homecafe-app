import { requireAuth } from "@/adapters/guards/auth.guard";
import { NotificationsList } from "./_components/notifications-list";

export default async function NotificationsPage() {
  await requireAuth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <NotificationsList />
    </div>
  );
}
