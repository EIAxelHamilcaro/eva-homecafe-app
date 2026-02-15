"use client";

import { Badge } from "@packages/ui/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@packages/ui/components/ui/table";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCheck,
  ChevronDown,
  FileText,
  Pencil,
  Plus,
  Text,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  useAddRowMutation,
  useRemoveRowMutation,
  useUpdateRowMutation,
  useUpdateTableauMutation,
} from "@/app/(protected)/_hooks/use-tableaux";
import type {
  ITableauColumnDto,
  ITableauDto,
  ITableauRowDto,
} from "@/application/dto/tableau/common-tableau.dto";
import { AddColumnPopover } from "./add-column-popover";
import { ColumnHeaderMenu } from "./column-header-menu";
import { CustomFieldCell } from "./custom-field-cell";
import { DatePickerCell } from "./date-picker-cell";
import { EditableText } from "./editable-text";
import { FilesDialog } from "./files-dialog";
import { OptionsEditor } from "./options-editor";

interface TableauBoardProps {
  tableau: ITableauDto;
  onDeleteTableau: () => void;
}

const BUILTIN_IDS = [
  "_date",
  "_name",
  "_text",
  "_status",
  "_priority",
  "_files",
] as const;
type BuiltinId = (typeof BUILTIN_IDS)[number];

const BUILTIN_LABELS: Record<
  BuiltinId,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  _date: { label: "Date", icon: Calendar },
  _name: { label: "Nom", icon: Pencil },
  _text: { label: "Texte", icon: Text },
  _status: { label: "État", icon: CheckCheck },
  _priority: { label: "Priorité", icon: Timer },
  _files: { label: "Fichiers", icon: FileText },
};

function isBuiltinId(id: string): id is BuiltinId {
  return BUILTIN_IDS.includes(id as BuiltinId);
}

function StatusBadge({
  status,
  options,
}: {
  status: string;
  options: ITableauDto["statusOptions"];
}) {
  const opt = options.find((s) => s.id === status);
  return (
    <Badge
      variant="secondary"
      className="text-xs"
      style={opt ? { backgroundColor: opt.color, color: "#374151" } : undefined}
    >
      {opt?.label ?? status}
    </Badge>
  );
}

function PriorityBars({
  priority,
  options,
}: {
  priority: string;
  options: ITableauDto["priorityOptions"];
}) {
  const opt = options.find((p) => p.id === priority);
  const level = opt?.level ?? 1;
  const maxLevel = Math.max(...options.map((o) => o.level), 4);
  const colors = ["#22c55e", "#eab308", "#f97316", "#ef4444"];
  const colorIndex = Math.min(level - 1, colors.length - 1);
  return (
    <span
      className="inline-flex items-end gap-0.5"
      title={opt?.label ?? priority}
    >
      {Array.from({ length: maxLevel }, (_, i) => {
        const barKey = `${priority}-${i}`;
        return (
          <span
            key={barKey}
            className="w-1 rounded-sm"
            style={{
              height: `${8 + (i + 1) * 3}px`,
              backgroundColor:
                i < level ? colors[colorIndex] : "hsl(var(--muted))",
            }}
          />
        );
      })}
    </span>
  );
}

function BuiltinCell({
  colId,
  row,
  tableau,
  updateRow,
}: {
  colId: BuiltinId;
  row: ITableauRowDto;
  tableau: ITableauDto;
  updateRow: ReturnType<typeof useUpdateRowMutation>;
}) {
  switch (colId) {
    case "_date":
      return (
        <DatePickerCell
          value={row.date}
          onSave={(date) => updateRow.mutate({ rowId: row.id, date })}
        />
      );
    case "_name":
      return (
        <EditableText
          value={row.name}
          onSave={(name) => updateRow.mutate({ rowId: row.id, name })}
          placeholder="Sans nom"
          className="font-medium"
        />
      );
    case "_text":
      return (
        <EditableText
          value={row.text ?? ""}
          onSave={(text) => updateRow.mutate({ rowId: row.id, text })}
          placeholder="—"
          className="truncate text-muted-foreground"
        />
      );
    case "_status":
      return (
        <Select
          value={row.status}
          onValueChange={(value) =>
            updateRow.mutate({ rowId: row.id, status: value })
          }
        >
          <SelectTrigger className="h-7 w-[130px] border-0 bg-transparent p-0 shadow-none">
            <SelectValue>
              <StatusBadge
                status={row.status}
                options={tableau.statusOptions}
              />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {tableau.statusOptions.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: opt.color }}
                  />
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "_priority":
      return (
        <Select
          value={row.priority}
          onValueChange={(value) =>
            updateRow.mutate({ rowId: row.id, priority: value })
          }
        >
          <SelectTrigger className="h-7 w-[100px] border-0 bg-transparent p-0 shadow-none">
            <SelectValue>
              <PriorityBars
                priority={row.priority}
                options={tableau.priorityOptions}
              />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {tableau.priorityOptions.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                <span className="flex items-center gap-2">
                  <PriorityBars
                    priority={opt.id}
                    options={tableau.priorityOptions}
                  />
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "_files":
      return (
        <FilesDialog
          files={row.files}
          onUpdate={(files) => updateRow.mutate({ rowId: row.id, files })}
        />
      );
  }
}

function RowItem({
  row,
  tableau,
}: {
  row: ITableauRowDto;
  tableau: ITableauDto;
}) {
  const updateRow = useUpdateRowMutation(tableau.id);
  const removeRow = useRemoveRowMutation(tableau.id);

  return (
    <TableRow className="group/row border-blue-50 last:border-b-0">
      {tableau.columnOrder.map((colId) => {
        if (isBuiltinId(colId)) {
          return (
            <TableCell
              key={colId}
              className={colId === "_text" ? "max-w-[200px]" : undefined}
            >
              <BuiltinCell
                colId={colId}
                row={row}
                tableau={tableau}
                updateRow={updateRow}
              />
            </TableCell>
          );
        }
        const col = tableau.columns.find((c) => c.id === colId);
        if (!col) return null;
        return (
          <TableCell key={col.id}>
            <CustomFieldCell
              column={col}
              value={row.customFields[col.id]}
              onSave={(value) =>
                updateRow.mutate({
                  rowId: row.id,
                  customFields: { [col.id]: value },
                })
              }
            />
          </TableCell>
        );
      })}
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100 hover:text-destructive"
          onClick={() => removeRow.mutate({ rowId: row.id })}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function BuiltinHeaderMenu({
  colId,
  tableau,
  updateTableau,
  onMoveColumn,
  onHideColumn,
  isFirst,
  isLast,
}: {
  colId: BuiltinId;
  tableau: ITableauDto;
  updateTableau: ReturnType<typeof useUpdateTableauMutation>;
  onMoveColumn: (direction: "left" | "right") => void;
  onHideColumn: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const config = BUILTIN_LABELS[colId];
  const Icon = config.icon;

  const showOptionsEditor = colId === "_status" || colId === "_priority";

  return (
    <div className="flex items-center gap-0.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="text-xs">{config.label}</span>

      {showOptionsEditor && colId === "_status" && (
        <OptionsEditor
          options={tableau.statusOptions}
          onSave={(opts) =>
            updateTableau.mutate({
              statusOptions: opts.map((o) => ({
                id: o.id,
                label: o.label,
                color: o.color ?? "#f1f5f9",
              })),
            })
          }
        />
      )}
      {showOptionsEditor && colId === "_priority" && (
        <OptionsEditor
          options={tableau.priorityOptions.map((o) => ({
            id: o.id,
            label: o.label,
          }))}
          onSave={(opts) =>
            updateTableau.mutate({
              priorityOptions: opts.map((o, i) => ({
                id: o.id,
                label: o.label,
                level: i + 1,
              })),
            })
          }
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="ml-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover/header:opacity-100 hover:bg-muted"
          >
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuItem
            onClick={() => onMoveColumn("left")}
            disabled={isFirst}
          >
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            Déplacer à gauche
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onMoveColumn("right")}
            disabled={isLast}
          >
            <ArrowRight className="mr-2 h-3.5 w-3.5" />
            Déplacer à droite
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onHideColumn}
            className="text-destructive focus:text-destructive"
          >
            <X className="mr-2 h-3.5 w-3.5" />
            Masquer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function TableauBoard({ tableau, onDeleteTableau }: TableauBoardProps) {
  const [newRowName, setNewRowName] = useState("");
  const addRow = useAddRowMutation(tableau.id);
  const updateTableau = useUpdateTableauMutation(tableau.id);

  const order = tableau.columnOrder;
  const totalColumns = order.length + 1;

  const handleAddRow = () => {
    if (!newRowName.trim()) return;
    addRow.mutate(
      { name: newRowName.trim() },
      { onSuccess: () => setNewRowName("") },
    );
  };

  const handleAddColumn = (column: ITableauColumnDto) => {
    updateTableau.mutate({
      columns: [...tableau.columns, column],
      columnOrder: [...order, column.id],
    });
  };

  const handleRemoveColumn = (columnId: string) => {
    updateTableau.mutate({
      columns: tableau.columns.filter((c) => c.id !== columnId),
      columnOrder: order.filter((id) => id !== columnId),
    });
  };

  const handleHideBuiltinColumn = (colId: string) => {
    updateTableau.mutate({
      columnOrder: order.filter((id) => id !== colId),
    });
  };

  const handleRenameColumn = (columnId: string, name: string) => {
    updateTableau.mutate({
      columns: tableau.columns.map((c) =>
        c.id === columnId ? { ...c, name } : c,
      ),
    });
  };

  const handleChangeColumnType = (
    columnId: string,
    type: ITableauColumnDto["type"],
  ) => {
    const needsOptions =
      type === "select" || type === "status" || type === "priority";
    updateTableau.mutate({
      columns: tableau.columns.map((c) =>
        c.id === columnId
          ? {
              ...c,
              type,
              options:
                needsOptions && !c.options?.length
                  ? type === "status"
                    ? [
                        { id: "todo", label: "À faire", color: "#dbeafe" },
                        {
                          id: "in_progress",
                          label: "En cours",
                          color: "#ffedd5",
                        },
                        { id: "done", label: "Terminé", color: "#dcfce7" },
                      ]
                    : type === "priority"
                      ? [
                          { id: "low", label: "Basse", color: "#dcfce7" },
                          { id: "medium", label: "Moyenne", color: "#fef3c7" },
                          { id: "high", label: "Haute", color: "#ffedd5" },
                          {
                            id: "critical",
                            label: "Critique",
                            color: "#fce7f3",
                          },
                        ]
                      : [
                          { id: "opt_1", label: "Option 1", color: "#dbeafe" },
                          { id: "opt_2", label: "Option 2", color: "#ffedd5" },
                        ]
                  : needsOptions
                    ? c.options
                    : undefined,
            }
          : c,
      ),
    });
  };

  const handleUpdateColumnOptions = (
    columnId: string,
    options: { id: string; label: string; color?: string }[],
  ) => {
    updateTableau.mutate({
      columns: tableau.columns.map((c) =>
        c.id === columnId ? { ...c, options } : c,
      ),
    });
  };

  const handleMoveInOrder = (colId: string, direction: "left" | "right") => {
    const idx = order.indexOf(colId);
    if (idx === -1) return;
    const swapIdx = direction === "left" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= order.length) return;
    const next = [...order];
    const a = next[idx];
    const b = next[swapIdx];
    if (!a || !b) return;
    next[idx] = b;
    next[swapIdx] = a;
    updateTableau.mutate({ columnOrder: next });
  };

  const hiddenBuiltinColumns = BUILTIN_IDS.filter((id) => !order.includes(id));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <EditableText
          value={tableau.title}
          onSave={(title) => updateTableau.mutate({ title })}
          className="text-sm font-semibold"
        />
        <div className="flex items-center gap-1">
          {hiddenBuiltinColumns.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Colonnes ({hiddenBuiltinColumns.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {hiddenBuiltinColumns.map((id) => {
                  const cfg = BUILTIN_LABELS[id];
                  const Ico = cfg.icon;
                  return (
                    <DropdownMenuItem
                      key={id}
                      onClick={() =>
                        updateTableau.mutate({ columnOrder: [...order, id] })
                      }
                    >
                      <Ico className="mr-2 h-3.5 w-3.5" />
                      {cfg.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onDeleteTableau}
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex">
        <div className="min-w-0 flex-1 overflow-auto rounded-l-lg border border-blue-100 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="text-xs text-muted-foreground hover:bg-blue-50/60">
                {order.map((colId, idx) => {
                  if (isBuiltinId(colId)) {
                    return (
                      <TableHead
                        key={colId}
                        className="group/header font-medium"
                      >
                        <BuiltinHeaderMenu
                          colId={colId}
                          tableau={tableau}
                          updateTableau={updateTableau}
                          onMoveColumn={(dir) => handleMoveInOrder(colId, dir)}
                          onHideColumn={() => handleHideBuiltinColumn(colId)}
                          isFirst={idx === 0}
                          isLast={idx === order.length - 1}
                        />
                      </TableHead>
                    );
                  }
                  const col = tableau.columns.find((c) => c.id === colId);
                  if (!col) return null;
                  return (
                    <TableHead
                      key={col.id}
                      className="group/header font-medium"
                    >
                      <ColumnHeaderMenu
                        column={col}
                        onRename={(name) => handleRenameColumn(col.id, name)}
                        onChangeType={(type) =>
                          handleChangeColumnType(col.id, type)
                        }
                        onUpdateOptions={(opts) =>
                          handleUpdateColumnOptions(col.id, opts)
                        }
                        onMoveLeft={() => handleMoveInOrder(col.id, "left")}
                        onMoveRight={() => handleMoveInOrder(col.id, "right")}
                        onDelete={() => handleRemoveColumn(col.id)}
                        isFirst={idx === 0}
                        isLast={idx === order.length - 1}
                      />
                    </TableHead>
                  );
                })}
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableau.rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={totalColumns}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Aucune ligne
                  </TableCell>
                </TableRow>
              )}
              {tableau.rows.map((row) => (
                <RowItem key={row.id} row={row} tableau={tableau} />
              ))}
              <TableRow className="bg-blue-50/30 hover:bg-blue-50/50">
                <TableCell colSpan={totalColumns} className="p-0">
                  <div className="flex items-center gap-2 px-2">
                    <Plus className="h-4 w-4 shrink-0" />
                    <Input
                      placeholder="Ajouter une ligne..."
                      value={newRowName}
                      onChange={(e) => setNewRowName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddRow();
                      }}
                      className="h-9 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
                    />
                    {newRowName.trim() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAddRow}
                        disabled={addRow.isPending}
                        className="shrink-0"
                      >
                        {addRow.isPending ? "..." : "Ajouter"}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <AddColumnPopover
          onAdd={handleAddColumn}
          nextPosition={tableau.columns.length}
        />
      </div>
    </div>
  );
}
