"use client";

import { Button } from "@packages/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import { Label } from "@packages/ui/components/ui/label";
import { Switch } from "@packages/ui/components/ui/switch";
import { Globe, Lock } from "lucide-react";
import Image from "next/image";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useUploadPhotoMutation } from "@/app/(protected)/_hooks/use-gallery";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export interface GalleryUploadHandle {
  trigger: () => void;
}

interface GalleryUploadProps {
  onPhotoUploaded?: () => void;
  defaultPublic?: boolean;
}

export const GalleryUpload = forwardRef<
  GalleryUploadHandle,
  GalleryUploadProps
>(function GalleryUpload({ onPhotoUploaded, defaultPublic = false }, ref) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadPhoto = useUploadPhotoMutation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(!defaultPublic);
  const [dialogOpen, setDialogOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    trigger: () => inputRef.current?.click(),
  }));

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_SIZE) {
        return;
      }

      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setIsPrivate(!defaultPublic);
      setDialogOpen(true);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [defaultPublic],
  );

  const handleConfirm = useCallback(() => {
    if (!selectedFile) return;

    uploadPhoto.mutate(
      { file: selectedFile, isPrivate },
      {
        onSuccess: () => {
          onPhotoUploaded?.();
        },
        onSettled: () => {
          setDialogOpen(false);
          setSelectedFile(null);
          if (preview) URL.revokeObjectURL(preview);
          setPreview(null);
        },
      },
    );
  }, [selectedFile, isPrivate, uploadPhoto, onPhotoUploaded, preview]);

  const handleCancel = useCallback(() => {
    setDialogOpen(false);
    setSelectedFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }, [preview]);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={uploadPhoto.isPending}
        className="hidden"
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => !open && handleCancel()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une photo</DialogTitle>
          </DialogHeader>

          {preview && (
            <div className="relative mx-auto max-h-64 w-full overflow-hidden rounded-lg">
              <Image
                src={preview}
                alt="Aperçu"
                width={400}
                height={300}
                className="h-auto max-h-64 w-full object-contain"
                unoptimized
              />
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              {isPrivate ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Globe className="h-4 w-4 text-emerald-500" />
              )}
              <Label htmlFor="photo-visibility" className="cursor-pointer">
                {isPrivate ? "Privée" : "Publique"}
              </Label>
            </div>
            <Switch
              id="photo-visibility"
              checked={!isPrivate}
              onCheckedChange={(checked) => setIsPrivate(!checked)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {isPrivate
              ? "Seul·e toi peux voir cette photo."
              : "Visible par tes amis dans le feed social."}
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button onClick={handleConfirm} disabled={uploadPhoto.isPending}>
              {uploadPhoto.isPending ? "Envoi…" : "Envoyer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {uploadPhoto.isPending && !dialogOpen && (
        <div className="flex items-center gap-3 rounded-xl bg-homecafe-beige/50 px-4 py-3 text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-homecafe-pink border-t-transparent" />
          <span className="text-muted-foreground">Envoi en cours…</span>
        </div>
      )}

      {uploadPhoto.isError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          <span className="flex-1">{uploadPhoto.error.message}</span>
          <Button
            onClick={() => uploadPhoto.reset()}
            className="shrink-0 rounded-full bg-red-600 px-3 py-1 text-white text-xs hover:bg-red-700"
          >
            Fermer
          </Button>
        </div>
      )}
    </>
  );
});
