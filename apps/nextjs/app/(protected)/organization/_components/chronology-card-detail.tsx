"use client";

import { Badge } from "@packages/ui/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import { Progress } from "@packages/ui/components/ui/progress";
import { Separator } from "@packages/ui/components/ui/separator";
import type { IChronologyCardDto } from "@/application/dto/board/get-chronology.dto";

interface ChronologyCardDetailProps {
  card: IChronologyCardDto | null;
  onClose: () => void;
}

export function ChronologyCardDetail({
  card,
  onClose,
}: ChronologyCardDetailProps) {
  if (!card) return null;

  const isOverdue = new Date(card.dueDate) < new Date() && card.progress < 100;

  return (
    <Dialog open={!!card} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{card.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {card.description && (
            <p className="text-sm text-muted-foreground">{card.description}</p>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Board</p>
              <p className="font-medium">{card.boardTitle}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Column</p>
              <p className="font-medium">{card.columnTitle}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Type</p>
              <Badge variant="secondary">{card.boardType}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Due Date</p>
              <p
                className={`font-medium ${isOverdue ? "text-destructive" : ""}`}
              >
                {new Date(`${card.dueDate}T00:00:00`).toLocaleDateString()}
                {isOverdue && " (overdue)"}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{card.progress}%</span>
            </div>
            <Progress value={card.progress} className="h-2" />
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={card.isCompleted ? "default" : "outline"}>
              {card.isCompleted ? "Completed" : "In progress"}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
