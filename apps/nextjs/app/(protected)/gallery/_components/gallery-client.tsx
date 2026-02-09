"use client";

import { useCallback, useState } from "react";
import { GalleryGrid } from "./gallery-grid";
import { GalleryUpload } from "./gallery-upload";

export function GalleryClient() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-6">
      <GalleryUpload onPhotoUploaded={handleRefresh} />
      <GalleryGrid key={refreshKey} />
    </div>
  );
}
