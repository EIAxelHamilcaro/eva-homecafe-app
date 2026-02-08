"use client";

import { Button } from "@packages/ui/components/ui/button";

interface OrganizationEmptyStateProps {
  onCreateClick: () => void;
}

export function OrganizationEmptyState({
  onCreateClick,
}: OrganizationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <p className="mb-2 text-lg font-medium">No to-do lists yet</p>
      <p className="mb-6 text-sm text-muted-foreground">
        Create your first to-do list to start tracking tasks and daily goals.
      </p>
      <Button onClick={onCreateClick}>Create your first list</Button>
    </div>
  );
}
