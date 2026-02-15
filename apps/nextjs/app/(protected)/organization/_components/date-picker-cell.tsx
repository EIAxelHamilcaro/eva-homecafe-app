"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Calendar } from "@packages/ui/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@packages/ui/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";

interface DatePickerCellProps {
  value: string | null;
  onSave: (date: string | undefined) => void;
}

export function DatePickerCell({ value, onSave }: DatePickerCellProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(`${value}T00:00:00`) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-7 cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-sm transition-colors hover:bg-muted/50"
        >
          {value ? (
            new Date(`${value}T00:00:00`).toLocaleDateString("fr-FR")
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5" />—
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              const yyyy = date.getFullYear();
              const mm = String(date.getMonth() + 1).padStart(2, "0");
              const dd = String(date.getDate()).padStart(2, "0");
              onSave(`${yyyy}-${mm}-${dd}`);
            }
            setOpen(false);
          }}
        />
        {value && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                onSave(undefined);
                setOpen(false);
              }}
            >
              <X className="mr-1 h-3 w-3" /> Retirer la date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
