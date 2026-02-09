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
  AlertDialogTrigger,
} from "@packages/ui/components/ui/alert-dialog";
import { Button } from "@packages/ui/components/ui/button";
import { useCallback, useState } from "react";

interface DeleteMoodboardDialogProps {
  moodboardId: string;
  moodboardTitle: string;
  onDeleted: () => void;
}

export function DeleteMoodboardDialog({
  moodboardId,
  moodboardTitle,
  onDeleted,
}: DeleteMoodboardDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/moodboards/${moodboardId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete moodboard");
      }

      setOpen(false);
      onDeleted();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete moodboard",
      );
    } finally {
      setDeleting(false);
    }
  }, [moodboardId, onDeleted]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600">
          Delete Board
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Moodboard</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete &ldquo;{moodboardTitle}&rdquo; and all
            its pins. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
