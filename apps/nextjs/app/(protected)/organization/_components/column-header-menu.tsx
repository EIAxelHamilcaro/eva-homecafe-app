"use client";

import { Button } from "@packages/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@packages/ui/components/ui/dropdown-menu";
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
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronDown,
  Hash,
  List,
  Pencil,
  Plus,
  SquareCheck,
  Trash2,
  Type,
} from "lucide-react";
import { useState } from "react";
import type { ITableauColumnDto } from "@/application/dto/tableau/common-tableau.dto";

type ColumnType = ITableauColumnDto["type"];

const COLUMN_TYPE_CONFIG: Record<
  ColumnType,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  text: { icon: Type, label: "Texte" },
  number: { icon: Hash, label: "Nombre" },
  checkbox: { icon: SquareCheck, label: "Case à cocher" },
  date: { icon: Calendar, label: "Date" },
  select: { icon: List, label: "Liste déroulante" },
};

const COLUMN_TYPES: { value: ColumnType; label: string }[] = [
  { value: "text", label: "Texte" },
  { value: "number", label: "Nombre" },
  { value: "checkbox", label: "Case à cocher" },
  { value: "date", label: "Date" },
  { value: "select", label: "Liste déroulante" },
];

interface ColumnHeaderMenuProps {
  column: ITableauColumnDto;
  onRename: (name: string) => void;
  onChangeType: (type: ColumnType) => void;
  onUpdateOptions: (
    options: { id: string; label: string; color?: string }[],
  ) => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function ColumnHeaderMenu({
  column,
  onRename,
  onChangeType,
  onUpdateOptions,
  onMoveLeft,
  onMoveRight,
  onDelete,
  isFirst,
  isLast,
}: ColumnHeaderMenuProps) {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(column.name);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const config = COLUMN_TYPE_CONFIG[column.type];
  const Icon = config.icon;

  const handleRename = () => {
    if (renameValue.trim() && renameValue.trim() !== column.name) {
      onRename(renameValue.trim());
    }
    setRenaming(false);
  };

  if (renaming) {
    return (
      <Input
        value={renameValue}
        onChange={(e) => setRenameValue(e.target.value)}
        onBlur={handleRename}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleRename();
          if (e.key === "Escape") {
            setRenameValue(column.name);
            setRenaming(false);
          }
        }}
        autoFocus
        className="h-6 w-[100px] text-xs"
      />
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate text-xs">{column.name}</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="ml-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover/header:opacity-100 hover:bg-muted"
          >
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem
            onClick={() => {
              setRenameValue(column.name);
              setRenaming(true);
            }}
          >
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Renommer
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <div className="px-2 py-1.5">
            <p className="mb-1 text-xs text-muted-foreground">Type</p>
            <Select
              value={column.type}
              onValueChange={(v) => onChangeType(v as ColumnType)}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLUMN_TYPES.map((ct) => {
                  const TypeIcon = COLUMN_TYPE_CONFIG[ct.value].icon;
                  return (
                    <SelectItem key={ct.value} value={ct.value}>
                      <span className="flex items-center gap-2">
                        <TypeIcon className="h-3.5 w-3.5" />
                        {ct.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {column.type === "select" && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <Popover open={optionsOpen} onOpenChange={setOptionsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-full justify-start text-xs"
                    >
                      <List className="mr-2 h-3.5 w-3.5" />
                      Gérer les options ({column.options?.length ?? 0})
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="start">
                    <SelectOptionsEditor
                      options={column.options ?? []}
                      onSave={(opts) => {
                        onUpdateOptions(opts);
                        setOptionsOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onMoveLeft} disabled={isFirst}>
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            Déplacer à gauche
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMoveRight} disabled={isLast}>
            <ArrowRight className="mr-2 h-3.5 w-3.5" />
            Déplacer à droite
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function SelectOptionsEditor({
  options,
  onSave,
}: {
  options: { id: string; label: string; color?: string }[];
  onSave: (options: { id: string; label: string; color?: string }[]) => void;
}) {
  const [draft, setDraft] = useState(options);

  const COLORS = [
    "#dbeafe",
    "#ffedd5",
    "#fef3c7",
    "#dcfce7",
    "#fce7f3",
    "#ede9fe",
    "#e0e7ff",
    "#f1f5f9",
  ];

  return (
    <div className="space-y-2">
      {draft.map((opt, i) => (
        <div key={opt.id} className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="h-5 w-5 shrink-0 rounded border"
                style={{
                  backgroundColor: opt.color ?? COLORS[i % COLORS.length],
                }}
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <div className="grid grid-cols-4 gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="h-6 w-6 rounded border"
                    style={{ backgroundColor: c }}
                    onClick={() =>
                      setDraft(
                        draft.map((o, j) =>
                          j === i ? { ...o, color: c } : o,
                        ),
                      )
                    }
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Input
            value={opt.label}
            onChange={(e) =>
              setDraft(
                draft.map((o, j) =>
                  j === i ? { ...o, label: e.target.value } : o,
                ),
              )
            }
            className="h-7 text-xs"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => {
              if (draft.length > 1)
                setDraft(draft.filter((_, j) => j !== i));
            }}
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
        onClick={() =>
          setDraft([
            ...draft,
            {
              id: `opt_${crypto.randomUUID().slice(0, 8)}`,
              label: "Nouveau",
              color: COLORS[draft.length % COLORS.length],
            },
          ])
        }
      >
        <Plus className="mr-1 h-3 w-3" /> Ajouter
      </Button>
      <Button
        size="sm"
        className="w-full text-xs"
        onClick={() => {
          const cleaned = draft.filter((o) => o.label.trim());
          if (cleaned.length > 0) onSave(cleaned);
        }}
      >
        Enregistrer
      </Button>
    </div>
  );
}
