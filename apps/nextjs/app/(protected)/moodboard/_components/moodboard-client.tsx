"use client";

import { useCallback, useState } from "react";
import { CreateMoodboardDialog } from "./create-moodboard-dialog";
import { MoodboardGrid } from "./moodboard-grid";

export function MoodboardClient() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CreateMoodboardDialog onCreated={handleRefresh} />
      </div>
      <MoodboardGrid key={refreshKey} />
    </div>
  );
}
