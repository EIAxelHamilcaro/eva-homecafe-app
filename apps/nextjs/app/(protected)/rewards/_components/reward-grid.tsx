"use client";

import { Button } from "@packages/ui/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import type { RewardCollectionItemDto } from "@/adapters/queries/reward-collection.query";
import { RewardCard } from "./reward-card";
import { RewardEmptyState } from "./reward-empty-state";

interface RewardGridProps {
  type: "sticker" | "badge";
  endpoint: string;
}

export function RewardGrid({ type, endpoint }: RewardGridProps) {
  const [items, setItems] = useState<RewardCollectionItemDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) {
        setError(`Failed to load ${type}s`);
        return;
      }
      const json: RewardCollectionItemDto[] = await res.json();
      setItems(json);
    } catch {
      setError(`Failed to load ${type}s`);
    }
  }, [endpoint, type]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700 text-sm">
        <p>{error}</p>
        <Button
          onClick={load}
          className="mt-2 rounded bg-red-600 px-3 py-1 text-white text-xs hover:bg-red-700"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (items === null) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"].map((id) => (
          <div key={id} className="h-40 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <RewardEmptyState type={type} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <RewardCard key={item.id} reward={item} />
      ))}
    </div>
  );
}
