import { sseController } from "@/adapters/controllers/chat/sse.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = sseController;
