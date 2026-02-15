"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Input } from "@packages/ui/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@packages/ui/components/ui/popover";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface OptionItem {
  id: string;
  label: string;
  color?: string;
}

interface OptionsEditorProps {
  options: OptionItem[];
  onSave: (options: OptionItem[]) => void;
  colors?: string[];
}

const DEFAULT_COLORS = [
  "#dbeafe",
  "#ffedd5",
  "#fef3c7",
  "#dcfce7",
  "#fce7f3",
  "#ede9fe",
  "#e0e7ff",
  "#f1f5f9",
];

export function OptionsEditor({
  options,
  onSave,
  colors = DEFAULT_COLORS,
}: OptionsEditorProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(options);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setDraft(options);
    }
    setOpen(isOpen);
  };

  const updateLabel = (index: number, label: string) => {
    setDraft(draft.map((o, i) => (i === index ? { ...o, label } : o)));
  };

  const updateColor = (index: number, color: string) => {
    setDraft(draft.map((o, i) => (i === index ? { ...o, color } : o)));
  };

  const addOption = () => {
    setDraft([
      ...draft,
      {
        id: `opt_${crypto.randomUUID().slice(0, 8)}`,
        label: "Nouveau",
        color: colors[draft.length % colors.length],
      },
    ]);
  };

  const removeOption = (index: number) => {
    if (draft.length <= 1) return;
    setDraft(draft.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const cleaned = draft.filter((o) => o.label.trim());
    if (cleaned.length > 0) {
      onSave(cleaned);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover/header:opacity-100 hover:bg-muted"
        >
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-2">
          {draft.map((opt, i) => (
            <div key={opt.id} className="flex items-center gap-2">
              {opt.color !== undefined && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="h-5 w-5 shrink-0 rounded border"
                      style={{ backgroundColor: opt.color }}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="start">
                    <div className="grid grid-cols-4 gap-1">
                      {colors.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className="h-6 w-6 rounded border"
                          style={{ backgroundColor: c }}
                          onClick={() => updateColor(i, c)}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              <Input
                value={opt.label}
                onChange={(e) => updateLabel(i, e.target.value)}
                className="h-7 text-xs"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => removeOption(i)}
                disabled={draft.length <= 1}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={addOption}
          >
            <Plus className="mr-1 h-3 w-3" /> Ajouter
          </Button>
          <Button size="sm" className="w-full text-xs" onClick={handleSave}>
            Enregistrer
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
