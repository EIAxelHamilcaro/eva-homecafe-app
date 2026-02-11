import {
  registerPushToken,
  unregisterPushToken,
} from "@/adapters/controllers/push-token/push-token.controller";

export const POST = registerPushToken;
export const DELETE = unregisterPushToken;
