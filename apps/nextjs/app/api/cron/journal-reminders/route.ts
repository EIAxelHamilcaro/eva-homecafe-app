import { sendJournalReminders } from "@/adapters/controllers/notification/notification.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = sendJournalReminders;
