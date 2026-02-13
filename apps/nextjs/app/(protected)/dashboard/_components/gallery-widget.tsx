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
  let result: Awaited<ReturnType<typeof getUserGallery>>;
  try {
    result = await getUserGallery(userId, 1, 4);
  } catch {
    return <WidgetEmptyState type="gallery" />;
  }

  if (result.photos.length === 0) return <WidgetEmptyState type="gallery" />;

  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle>Galerie</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tes plus belles photos, c'est ici !
        </p>
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
        <Link
          href="/gallery"
          className="mt-4 inline-block rounded-full bg-homecafe-pink px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          Voir plus
        </Link>
      </CardContent>
    </Card>
  );
}
