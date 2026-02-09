import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import Link from "next/link";
import { getJournalEntries } from "@/adapters/queries/journal.query";
import { WidgetEmptyState } from "./widget-empty-state";

interface PostsWidgetProps {
  userId: string;
}

export async function PostsWidget({ userId }: PostsWidgetProps) {
  const result = await getJournalEntries(userId, undefined, 1, 3);

  const allPosts = result.groups.flatMap((g) => g.posts);

  if (allPosts.length === 0) {
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
          {allPosts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.id}`}
                className="block rounded-md p-2 hover:bg-muted/50"
              >
                <p className="line-clamp-2 text-sm">{post.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
