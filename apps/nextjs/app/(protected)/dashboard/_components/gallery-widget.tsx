import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { getUserGallery } from "@/adapters/queries/gallery.query";
import { WidgetEmptyState } from "./widget-empty-state";

interface GalleryWidgetProps {
  userId: string;
}

export async function GalleryWidget({ userId }: GalleryWidgetProps) {
  const result = await getUserGallery(userId, 1, 4);

  if (result.photos.length === 0) {
    return <WidgetEmptyState type="gallery" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link href="/gallery" className="hover:underline">
            Gallery
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {result.photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-md bg-muted"
            >
              <Image
                src={photo.url}
                alt={photo.caption ?? photo.filename}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 150px"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
