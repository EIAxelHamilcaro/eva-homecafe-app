import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import { Mountain } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getUserGallery } from "@/adapters/queries/gallery.query";

interface JournalGalleryProps {
  userId: string;
}

function GalleryEmpty() {
  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle>Galerie</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tes plus belles photos, c&apos;est ici !
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {["a", "b", "c", "d"].map((key) => (
            <div
              key={key}
              className="flex aspect-square items-center justify-center rounded-md bg-homecafe-beige"
            >
              <Mountain className="h-6 w-6 text-muted-foreground/50" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export async function JournalGallery({ userId }: JournalGalleryProps) {
  let result: Awaited<ReturnType<typeof getUserGallery>>;
  try {
    result = await getUserGallery(userId, 1, 4);
  } catch {
    return <GalleryEmpty />;
  }

  if (result.photos.length === 0) return <GalleryEmpty />;

  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle>Galerie</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tes plus belles photos, c&apos;est ici !
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
                sizes="(max-width: 768px) 33vw, 150px"
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
