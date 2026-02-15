"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Plus } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { GalleryGrid } from "./gallery-grid";
import { GalleryUpload, type GalleryUploadHandle } from "./gallery-upload";

export function GalleryClient() {
  const [refreshKey, setRefreshKey] = useState(0);
  const uploadRef = useRef<GalleryUploadHandle>(null);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-bold text-2xl">Galerie</h1>
          <p className="text-sm text-muted-foreground">
            Tes plus belles photos, c&apos;est ici !
          </p>
        </div>
        <Button
          onClick={() => uploadRef.current?.trigger()}
          className="rounded-full gap-1.5"
        >
          <Plus size={16} />
          Ajouter une photo
        </Button>
      </div>

      <GalleryUpload ref={uploadRef} onPhotoUploaded={handleRefresh} />
      <GalleryGrid key={refreshKey} />
    </div>
  );
}
