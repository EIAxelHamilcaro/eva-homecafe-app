import {
  getFriends,
  sendRequest,
} from "@/adapters/controllers/friend/friend.controller";

export const GET = getFriends;
export const POST = sendRequest;
