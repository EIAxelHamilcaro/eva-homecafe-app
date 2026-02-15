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
} from "@/app/(protected)/_hooks/use-tableaux";
import type {
  ITableauDto,
  ITableauRowDto,
} from "@/application/dto/tableau/common-tableau.dto";

interface TableauBoardProps {
  tableau: ITableauDto;
  onDeleteTableau: () => void;
}

const STATUS_OPTIONS = [
  { value: "todo", label: "À faire", className: "bg-blue-100 text-blue-700" },
  {
    value: "in_progress",
    label: "En cours",
    className: "bg-orange-100 text-orange-700",
  },
  {
    value: "waiting",
    label: "En attente",
    className: "bg-yellow-100 text-yellow-700",
  },
  {
    value: "done",
    label: "Terminé",
    className: "bg-green-100 text-green-700",
  },
] as const;

const PRIORITY_OPTIONS = [
  { value: "low", label: "Basse", bars: 1 },
  { value: "medium", label: "Moyenne", bars: 2 },
  { value: "high", label: "Haute", bars: 3 },
  { value: "critical", label: "Critique", bars: 4 },
] as const;

function StatusBadge({ status }: { status: string }) {
  const opt = STATUS_OPTIONS.find((s) => s.value === status);
  return (
    <Badge variant="secondary" className={opt?.className ?? ""}>
      {opt?.label ?? status}
    </Badge>
  );
}

function PriorityBars({ priority }: { priority: string }) {
  const opt = PRIORITY_OPTIONS.find((p) => p.value === priority);
  const bars = opt?.bars ?? 1;
  const colors = [
    "bg-green-500",
    "bg-yellow-500",
    "bg-orange-500",
    "bg-red-500",
  ];
  return (
    <span className="inline-flex items-end gap-0.5" title={opt?.label}>
      {[1, 2, 3, 4].map((level) => (
        <span
          key={level}
          className={`w-1 rounded-sm ${level <= bars ? colors[bars - 1] : "bg-muted"}`}
          style={{ height: `${8 + level * 3}px` }}
        />
      ))}
    </span>
  );
}

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR");
}

function RowItem({
  row,
  tableauId,
}: {
  row: ITableauRowDto;
  tableauId: string;
}) {
  const updateRow = useUpdateRowMutation(tableauId);
  const removeRow = useRemoveRowMutation(tableauId);

  return (
    <TableRow className="border-blue-50 last:border-b-0">
      <TableCell className="text-muted-foreground">
        {formatDate(row.date)}
      </TableCell>
      <TableCell className="font-medium">{row.name}</TableCell>
      <TableCell className="max-w-[200px] truncate text-muted-foreground">
        {row.text ?? "—"}
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
              <StatusBadge status={row.status} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
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
              <PriorityBars priority={row.priority} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  <PriorityBars priority={opt.value} />
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            {row.files.length}
          </span>
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
    </TableRow>
  );
}

export function TableauBoard({ tableau, onDeleteTableau }: TableauBoardProps) {
  const [newRowName, setNewRowName] = useState("");
  const addRow = useAddRowMutation(tableau.id);

  const handleAddRow = () => {
    if (!newRowName.trim()) return;
    addRow.mutate(
      { name: newRowName.trim() },
      { onSuccess: () => setNewRowName("") },
    );
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{tableau.title}</h3>
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
        <div className="min-w-0 flex-1 overflow-auto rounded-l-lg border border-blue-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50/60 text-xs text-muted-foreground hover:bg-blue-50/60">
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
                  <span className="flex items-center gap-1.5">
                    <CheckCheck className="h-3.5 w-3.5" />
                    État
                  </span>
                </TableHead>
                <TableHead className="font-medium">
                  <span className="flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5" />
                    Priorité
                  </span>
                </TableHead>
                <TableHead className="font-medium">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Fichiers
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableau.rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Aucune ligne
                  </TableCell>
                </TableRow>
              )}
              {tableau.rows.map((row) => (
                <RowItem key={row.id} row={row} tableauId={tableau.id} />
              ))}
              <TableRow className="bg-blue-50/30 hover:bg-blue-50/50">
                <TableCell colSpan={6} className="p-0">
                  <div className="flex items-center gap-2 px-2">
                    <Plus className="h-4 w-4 shrink-0 text-blue-400" />
                    <Input
                      placeholder="Ajouter une ligne..."
                      value={newRowName}
                      onChange={(e) => setNewRowName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddRow();
                      }}
                      className="h-9 border-0 bg-transparent text-sm shadow-none placeholder:text-blue-300 focus-visible:ring-0"
                    />
                    {newRowName.trim() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAddRow}
                        disabled={addRow.isPending}
                        className="shrink-0 text-blue-600 hover:text-blue-700"
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

        <button
          type="button"
          className="flex w-9 shrink-0 items-center justify-center rounded-r-lg border border-l-0 border-blue-100 bg-blue-50/40 text-blue-300 transition-colors hover:bg-blue-50 hover:text-blue-500"
          title="Ajouter une colonne"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
