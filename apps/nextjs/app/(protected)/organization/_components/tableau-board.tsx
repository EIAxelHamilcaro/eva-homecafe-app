"use client";

import { Badge } from "@packages/ui/components/ui/badge";
import { Button } from "@packages/ui/components/ui/button";
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
  Calendar,
  CheckCheck,
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
      <TableCell>
        <DatePickerCell
          value={row.date}
          onSave={(date) => updateRow.mutate({ rowId: row.id, date })}
        />
      </TableCell>
      <TableCell className="font-medium">
        <EditableText
          value={row.name}
          onSave={(name) => updateRow.mutate({ rowId: row.id, name })}
          placeholder="Sans nom"
        />
      </TableCell>
      <TableCell className="max-w-[200px]">
        <EditableText
          value={row.text ?? ""}
          onSave={(text) => updateRow.mutate({ rowId: row.id, text })}
          placeholder="—"
          className="truncate text-muted-foreground"
        />
      </TableCell>
      <TableCell>
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
      </TableCell>
      <TableCell>
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
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <FilesDialog
            files={row.files}
            onUpdate={(files) => updateRow.mutate({ rowId: row.id, files })}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100 hover:text-destructive"
            onClick={() => removeRow.mutate({ rowId: row.id })}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
      {tableau.columns.map((col) => (
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
      ))}
    </TableRow>
  );
}

export function TableauBoard({ tableau, onDeleteTableau }: TableauBoardProps) {
  const [newRowName, setNewRowName] = useState("");
  const addRow = useAddRowMutation(tableau.id);
  const updateTableau = useUpdateTableauMutation(tableau.id);

  const totalColumns = 6 + tableau.columns.length;

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
    });
  };

  const handleRemoveColumn = (columnId: string) => {
    updateTableau.mutate({
      columns: tableau.columns.filter((c) => c.id !== columnId),
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
    updateTableau.mutate({
      columns: tableau.columns.map((c) =>
        c.id === columnId
          ? {
              ...c,
              type,
              options:
                type === "select" && !c.options?.length
                  ? [
                      { id: "opt_1", label: "Option 1" },
                      { id: "opt_2", label: "Option 2" },
                    ]
                  : type === "select"
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

  const handleMoveColumn = (columnId: string, direction: "left" | "right") => {
    const idx = tableau.columns.findIndex((c) => c.id === columnId);
    if (idx === -1) return;
    const swapIdx = direction === "left" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= tableau.columns.length) return;
    const next = [...tableau.columns];
    const a = next[idx];
    const b = next[swapIdx];
    if (!a || !b) return;
    next[idx] = b;
    next[swapIdx] = a;
    updateTableau.mutate({
      columns: next.map((c, i) => ({ ...c, position: i })),
    });
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <EditableText
          value={tableau.title}
          onSave={(title) => updateTableau.mutate({ title })}
          className="text-sm font-semibold"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onDeleteTableau}
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex">
        <div className="min-w-0 flex-1 overflow-auto rounded-l-lg border border-blue-100 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="group/header text-xs text-muted-foreground hover:bg-blue-50/60">
                <TableHead className="font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Date
                  </span>
                </TableHead>
                <TableHead className="font-medium">
                  <span className="flex items-center gap-1.5">
                    <Pencil className="h-3.5 w-3.5" />
                    Nom
                  </span>
                </TableHead>
                <TableHead className="font-medium">
                  <span className="flex items-center gap-1.5">
                    <Text className="h-3.5 w-3.5" />
                    Texte
                  </span>
                </TableHead>
                <TableHead className="font-medium">
                  <span className="group/header flex items-center gap-1.5">
                    <CheckCheck className="h-3.5 w-3.5" />
                    État
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
                  </span>
                </TableHead>
                <TableHead className="font-medium">
                  <span className="group/header flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5" />
                    Priorité
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
                  </span>
                </TableHead>
                <TableHead className="font-medium">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Fichiers
                  </span>
                </TableHead>
                {tableau.columns.map((col, colIdx) => (
                  <TableHead key={col.id} className="group/header font-medium">
                    <ColumnHeaderMenu
                      column={col}
                      onRename={(name) => handleRenameColumn(col.id, name)}
                      onChangeType={(type) =>
                        handleChangeColumnType(col.id, type)
                      }
                      onUpdateOptions={(opts) =>
                        handleUpdateColumnOptions(col.id, opts)
                      }
                      onMoveLeft={() => handleMoveColumn(col.id, "left")}
                      onMoveRight={() => handleMoveColumn(col.id, "right")}
                      onDelete={() => handleRemoveColumn(col.id)}
                      isFirst={colIdx === 0}
                      isLast={colIdx === tableau.columns.length - 1}
                    />
                  </TableHead>
                ))}
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
