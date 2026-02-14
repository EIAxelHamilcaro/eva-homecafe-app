"use client";

import { Badge } from "@packages/ui/components/ui/badge";
import { Button } from "@packages/ui/components/ui/button";
import { Progress } from "@packages/ui/components/ui/progress";
import { useState } from "react";
import type { IChronologyCardDto } from "@/application/dto/board/get-chronology.dto";
import { ChronologyCardDetail } from "./chronology-card-detail";

function isOverdue(card: IChronologyCardDto): boolean {
  return new Date(card.dueDate) < new Date() && card.progress < 100;
}

interface ChronologyEventListProps {
  selectedDate: string | null;
  cards: IChronologyCardDto[];
}

export function ChronologyEventList({
  selectedDate,
  cards,
}: ChronologyEventListProps) {
  const [detailCard, setDetailCard] = useState<IChronologyCardDto | null>(null);

  if (!selectedDate) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
        <p className="text-sm text-muted-foreground">
          Select a date on the calendar to view events
        </p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
        <p className="text-sm text-muted-foreground">
          No events on{" "}
          {new Date(`${selectedDate}T00:00:00`).toLocaleDateString()}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium">
        {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </h3>
      <div className="space-y-2">
        {cards.map((card) => (
          <Button
            key={card.id}
            variant="ghost"
            onClick={() => setDetailCard(card)}
            className="w-full rounded-md border bg-background p-3 text-left shadow-sm transition-colors hover:bg-accent"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{card.title}</p>
              <Badge variant={card.isCompleted ? "default" : "secondary"}>
                {card.isCompleted ? "Done" : card.boardType}
              </Badge>
            </div>
            {card.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {card.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              {card.progress > 0 && (
                <div className="flex flex-1 items-center gap-1.5">
                  <Progress value={card.progress} className="h-1.5" />
                  <span className="text-xs text-muted-foreground">
                    {card.progress}%
                  </span>
                </div>
              )}
              <span className="text-xs text-muted-foreground">
                {card.boardTitle}
              </span>
              {isOverdue(card) && (
                <span className="text-xs font-medium text-destructive">
                  Overdue
                </span>
              )}
            </div>
          </Button>
        ))}
      </div>
      <ChronologyCardDetail
        card={detailCard}
        onClose={() => setDetailCard(null)}
      />
    </div>
  );
}
