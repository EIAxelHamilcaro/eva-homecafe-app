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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import Image from "next/image";
import { useCallback, useState } from "react";
import type { GalleryPhotoDto } from "@/adapters/queries/gallery.query";

interface PhotoViewModalProps {
  photo: GalleryPhotoDto;
  onClose: () => void;
  onDelete: (photoId: string) => Promise<void>;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      setError(err instanceof Error ? err.message : "Failed to delete photo");
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
              className="rounded-lg object-contain"
              unoptimized
            />
          </div>

          <div className="flex items-center justify-between text-gray-500 text-sm">
            <div className="flex gap-4">
              <span>{formatFileSize(photo.size)}</span>
              <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
              {photo.caption && <span>{photo.caption}</span>}
            </div>
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleting}
              className="rounded-lg border border-red-200 px-3 py-1 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
              {error}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The photo will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
