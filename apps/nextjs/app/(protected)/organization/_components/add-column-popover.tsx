"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Input } from "@packages/ui/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@packages/ui/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { ITableauColumnDto } from "@/application/dto/tableau/common-tableau.dto";

type ColumnType = ITableauColumnDto["type"];

const COLUMN_TYPES: { value: ColumnType; label: string }[] = [
  { value: "text", label: "Texte" },
  { value: "number", label: "Nombre" },
  { value: "checkbox", label: "Case à cocher" },
  { value: "date", label: "Date" },
  { value: "select", label: "Liste déroulante" },
];

interface AddColumnPopoverProps {
  onAdd: (column: ITableauColumnDto) => void;
  nextPosition: number;
}

export function AddColumnPopover({
  onAdd,
  nextPosition,
}: AddColumnPopoverProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<ColumnType>("text");

  const handleAdd = () => {
    if (!name.trim()) return;
    const column: ITableauColumnDto = {
      id: `col_${crypto.randomUUID().slice(0, 8)}`,
      name: name.trim(),
      type,
      position: nextPosition,
      ...(type === "select"
        ? {
            options: [
              { id: "opt_1", label: "Option 1" },
              { id: "opt_2", label: "Option 2" },
            ],
          }
        : {}),
    };
    onAdd(column);
    setName("");
    setType("text");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-9 shrink-0 cursor-pointer items-center justify-center rounded-r-lg border border-l-0 border-blue-100 bg-white transition-colors hover:bg-blue-50"
          title="Ajouter une colonne"
        >
          <Plus className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start">
        <div className="space-y-3">
          <Input
            placeholder="Nom de la colonne"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            autoFocus
            className="h-8 text-sm"
          />
          <Select value={type} onValueChange={(v) => setType(v as ColumnType)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLUMN_TYPES.map((ct) => (
                <SelectItem key={ct.value} value={ct.value}>
                  {ct.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="w-full"
            onClick={handleAdd}
            disabled={!name.trim()}
          >
            Ajouter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
