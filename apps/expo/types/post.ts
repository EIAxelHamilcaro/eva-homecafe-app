import type { Pagination } from "./pagination";

export interface Post {
  id: string;
  content: string;
  isPrivate: boolean;
  images: string[];
  userId: string;
  createdAt: string;
  updatedAt: string | null;
  reactionCount: number;
  hasReacted: boolean;
  commentCount: number;
}

export interface PostGroup {
  date: string;
  posts: Post[];
}

export interface JournalResponse {
  groups: PostGroup[];
  pagination: Pagination;
}

export interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
  lastPostDate: string | null;
}

export interface CreatePostInput {
  content: string;
  isPrivate: boolean;
  images?: string[];
  createdAt?: string;
}

export interface UpdatePostInput {
  content?: string;
  isPrivate?: boolean;
  images?: string[];
}

export interface PostReaction {
  userId: string;
  userName: string;
  displayName: string | null;
  emoji: string;
  createdAt: string;
}

export interface PostReactionsResponse {
  reactions: PostReaction[];
  totalCount: number;
}

export interface ToggleReactionResponse {
  postId: string;
  userId: string;
  emoji: string;
  action: "added" | "removed";
}

export interface PostComment {
  id: string;
  content: string;
  userId: string;
  userName: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface PostCommentsResponse {
  comments: PostComment[];
}

export interface FeedPostAuthor {
  id: string;
  name: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface FeedPost {
  id: string;
  content: string;
  images: string[];
  createdAt: string;
  updatedAt: string | null;
  author: FeedPostAuthor;
  reactionCount: number;
  hasReacted: boolean;
  commentCount: number;
}

export interface FeedResponse {
  data: FeedPost[];
  hasFriends: boolean;
  pagination: Pagination;
}
