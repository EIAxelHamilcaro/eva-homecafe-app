import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import { LockKeyhole } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getUserRecentPosts } from "@/adapters/queries/user-posts.query";
import { WidgetEmptyState } from "./widget-empty-state";

interface PostsWidgetProps {
  userId: string;
}

export async function PostsWidget({ userId }: PostsWidgetProps) {
  let posts: Awaited<ReturnType<typeof getUserRecentPosts>>;
  try {
    posts = await getUserRecentPosts(userId, 5);
  } catch {
    return <WidgetEmptyState type="posts" />;
  }

  if (posts.length === 0) {
    return <WidgetEmptyState type="posts" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link href="/posts" className="hover:underline">
            Recent Posts
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.id}`}
                className="flex gap-3 rounded-md p-2 hover:bg-muted/50"
              >
                {post.images.length > 0 && post.images[0] && (
                  <Image
                    src={post.images[0]}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 shrink-0 rounded-md object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    {post.isPrivate && (
                      <LockKeyhole className="size-3 shrink-0 text-muted-foreground" />
                    )}
                    <p className="line-clamp-2 text-sm">{post.content}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
