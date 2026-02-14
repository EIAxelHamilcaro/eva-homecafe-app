import {
  type FriendsPreviewData,
  getFriendsPreview,
} from "@/adapters/queries/friends-preview.query";
import { FriendsCard } from "./friends-card";

interface FriendsCardServerProps {
  userId: string;
}

const EMPTY_DATA: FriendsPreviewData = { count: 0, friends: [] };

export async function FriendsCardServer({ userId }: FriendsCardServerProps) {
  let data: FriendsPreviewData = EMPTY_DATA;

  try {
    data = await getFriendsPreview(userId);
  } catch {
    /* empty */
  }

  return <FriendsCard data={data} />;
}
