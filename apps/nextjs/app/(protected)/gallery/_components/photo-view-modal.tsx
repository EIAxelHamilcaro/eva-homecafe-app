"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@packages/ui/components/ui/alert-dialog";
import { Button } from "@packages/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import { Globe, Lock } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import type { GalleryPhotoDto } from "@/adapters/queries/gallery.query";

interface PhotoViewModalProps {
  photo: GalleryPhotoDto;
  onClose: () => void;
  onDelete: (photoId: string) => Promise<void>;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function PhotoViewModal({
  photo,
  onClose,
  onDelete,
}: PhotoViewModalProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    setError(null);
    try {
      await onDelete(photo.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de supprimer la photo",
      );
      setDeleting(false);
    }
  }, [photo.id, onDelete]);

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-auto">
          <DialogHeader>
            <DialogTitle>{photo.filename}</DialogTitle>
          </DialogHeader>

          <div className="relative flex min-h-[300px] justify-center">
            <Image
              src={photo.url}
              alt={photo.caption || photo.filename}
              fill
              className="rounded-xl object-contain"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                {photo.isPrivate ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : (
                  <Globe className="h-3.5 w-3.5 text-emerald-500" />
                )}
                {photo.isPrivate ? "Privée" : "Publique"}
              </span>
              <span>{formatFileSize(photo.size)}</span>
              <span>
                {new Date(photo.createdAt).toLocaleDateString("fr-FR")}
              </span>
              {photo.caption && <span>{photo.caption}</span>}
            </div>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleting}
              className="rounded-full border border-red-200 px-3 text-red-600 hover:bg-red-50"
            >
              {deleting ? "Suppression…" : "Supprimer"}
            </Button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
              {error}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la photo</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La photo sera définitivement
              supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Suppression…" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
