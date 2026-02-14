"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@packages/ui/components/ui/popover";
import { type ReactNode, useState } from "react";
import { recordEmotionAction } from "@/adapters/actions/emotion.actions";
import { MOOD_CATEGORIES } from "@/app/(protected)/mood/_components/mood-config";

interface MoodCellPopoverProps {
  date: string;
  children: ReactNode;
  onMoodSelected: (date: string, category: string) => void;
}

export function MoodCellPopover({
  date,
  children,
  onMoodSelected,
}: MoodCellPopoverProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSelect(category: string) {
    if (submitting) return;
    setSubmitting(true);
    onMoodSelected(date, category);
    setOpen(false);
    await recordEmotionAction({ category, emotionDate: date });
    setSubmitting(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-2" side="right" align="center">
        <div className="grid grid-cols-3 gap-1.5">
          {MOOD_CATEGORIES.map((mood) => (
            <button
              key={mood.value}
              type="button"
              title={mood.label}
              disabled={submitting}
              onClick={() => handleSelect(mood.value)}
              className="h-7 w-7 rounded-full transition-transform hover:scale-110 disabled:opacity-50"
              style={{ backgroundColor: mood.color }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
