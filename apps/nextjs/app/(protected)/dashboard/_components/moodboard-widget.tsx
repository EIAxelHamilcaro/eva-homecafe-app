import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { getUserMoodboards } from "@/adapters/queries/moodboard.query";
import { WidgetEmptyState } from "./widget-empty-state";

interface MoodboardWidgetProps {
  userId: string;
}

export async function MoodboardWidget({ userId }: MoodboardWidgetProps) {
  let result: Awaited<ReturnType<typeof getUserMoodboards>>;
  try {
    result = await getUserMoodboards(userId, 1, 1);
  } catch {
    return <WidgetEmptyState type="moodboard" />;
  }

  if (result.moodboards.length === 0) {
    return <WidgetEmptyState type="moodboard" />;
  }

  const board = result.moodboards[0]!;
  const additionalBoards = result.pagination.total - 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link href="/moodboard" className="hover:underline">
            Moodboard
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Link href="/moodboard" className="block">
          <p className="font-medium text-sm">{board.title}</p>
          {board.previewPins.length > 0 ? (
            <div className="mt-2 grid grid-cols-2 gap-1">
              {board.previewPins.map((pin) => (
                <div
                  key={pin.id}
                  className="relative aspect-square rounded-md overflow-hidden"
                  style={pin.color ? { backgroundColor: pin.color } : undefined}
                >
                  {pin.imageUrl && (
                    <Image
                      src={pin.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              {board.pinCount} {board.pinCount === 1 ? "pin" : "pins"}
            </p>
          )}
          {additionalBoards > 0 && (
            <p className="mt-2 text-center text-xs text-muted-foreground hover:underline">
              +{additionalBoards} more{" "}
              {additionalBoards === 1 ? "board" : "boards"}
            </p>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}
