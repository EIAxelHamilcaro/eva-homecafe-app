"use client";

import { Plus } from "lucide-react";
import { useRef } from "react";
import {
  GalleryUpload,
  type GalleryUploadHandle,
} from "@/app/(protected)/gallery/_components/gallery-upload";

export function PublicGalleryHeader() {
  const uploadRef = useRef<GalleryUploadHandle>(null);

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Galerie publique</h1>
        <p className="text-sm text-muted-foreground">
          Toutes les photos publiques de toi et tes amis
        </p>
      </div>
      <button
        type="button"
        onClick={() => uploadRef.current?.trigger()}
        className="flex items-center gap-2 rounded-full bg-homecafe-pink px-4 py-2 text-sm font-medium text-white hover:bg-homecafe-pink/90"
      >
        <Plus className="h-4 w-4" />
        Ajouter une photo
      </button>
      <GalleryUpload ref={uploadRef} defaultPublic />
    </div>
  );
}
