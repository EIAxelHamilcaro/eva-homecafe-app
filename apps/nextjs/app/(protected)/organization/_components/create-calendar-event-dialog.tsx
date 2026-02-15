"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Checkbox } from "@packages/ui/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import { Input } from "@packages/ui/components/ui/input";
import { Label } from "@packages/ui/components/ui/label";
import { useState } from "react";
import { EVENT_COLORS } from "@/domain/calendar-event/value-objects/event-color.vo";
import { useCreateCalendarEventMutation } from "../../_hooks/use-calendar-events";

const COLOR_MAP: Record<string, string> = {
  pink: "bg-pink-400",
  green: "bg-green-400",
  orange: "bg-orange-400",
  blue: "bg-blue-400",
  purple: "bg-purple-400",
  amber: "bg-amber-400",
  red: "bg-red-400",
  teal: "bg-teal-400",
};

interface CreateCalendarEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  googleConnected: boolean;
}

export function CreateCalendarEventDialog({
  open,
  onOpenChange,
  date,
  googleConnected,
}: CreateCalendarEventDialogProps) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<string>("blue");
  const [addToGoogle, setAddToGoogle] = useState(false);
  const createMutation = useCreateCalendarEventMutation();

  function handleClose() {
    setTitle("");
    setColor("blue");
    setAddToGoogle(false);
    onOpenChange(false);
  }

  async function handleCreate() {
    if (!title.trim()) return;
    await createMutation.mutateAsync({
      title: title.trim(),
      color,
      date,
      addToGoogle: googleConnected && addToGoogle,
    });
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvel événement — {date}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="event-title">Titre</Label>
            <Input
              id="event-title"
              placeholder="Nom de l'événement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full ${COLOR_MAP[c]} transition-all ${
                    color === c
                      ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                      : "hover:scale-105"
                  }`}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          {googleConnected && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="add-google"
                checked={addToGoogle}
                onCheckedChange={(checked) => setAddToGoogle(checked === true)}
              />
              <Label htmlFor="add-google" className="text-sm font-normal">
                Ajouter aussi à Google Calendar
              </Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? "Création..." : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
