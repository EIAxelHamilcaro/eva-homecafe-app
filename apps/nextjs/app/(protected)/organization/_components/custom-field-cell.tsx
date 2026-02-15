"use client";

import { Badge } from "@packages/ui/components/ui/badge";
import { Checkbox } from "@packages/ui/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/ui/select";
import type { ITableauColumnDto } from "@/application/dto/tableau/common-tableau.dto";
import { DatePickerCell } from "./date-picker-cell";
import { EditableText } from "./editable-text";
import { FilesDialog } from "./files-dialog";

interface CustomFieldCellProps {
  column: ITableauColumnDto;
  value: unknown;
  onSave: (value: unknown) => void;
}

function OptionBadge({
  optionId,
  options,
}: {
  optionId: string;
  options: { id: string; label: string; color?: string }[];
}) {
  const opt = options.find((o) => o.id === optionId);
  if (!opt) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge
      variant="secondary"
      className="text-xs"
      style={
        opt.color ? { backgroundColor: opt.color, color: "#374151" } : undefined
      }
    >
      {opt.label}
    </Badge>
  );
}

function PriorityBarsSmall({
  optionId,
  options,
}: {
  optionId: string;
  options: { id: string; label: string; color?: string }[];
}) {
  const idx = options.findIndex((o) => o.id === optionId);
  const level = idx + 1;
  const total = options.length;
  const colors = ["#22c55e", "#eab308", "#f97316", "#ef4444"];
  const colorIndex = Math.min(
    Math.floor((level / total) * colors.length),
    colors.length - 1,
  );
  const opt = options[idx];
  return (
    <span
      className="inline-flex items-end gap-0.5"
      title={opt?.label ?? optionId}
    >
      {Array.from({ length: total }, (_, i) => {
        const barKey = `${optionId}-${i}`;
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

function OptionsSelect({
  value,
  options,
  onSave,
  renderValue,
}: {
  value: string;
  options: { id: string; label: string; color?: string }[];
  onSave: (value: unknown) => void;
  renderValue: (val: string) => React.ReactNode;
}) {
  return (
    <Select value={value} onValueChange={onSave}>
      <SelectTrigger className="h-7 w-[130px] border-0 bg-transparent p-0 text-sm shadow-none">
        <SelectValue placeholder="—">{renderValue(value)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.id} value={opt.id}>
            <span className="flex items-center gap-2">
              {opt.color && (
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: opt.color }}
                />
              )}
              {opt.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CustomFieldCell({
  column,
  value,
  onSave,
}: CustomFieldCellProps) {
  const options = column.options ?? [];

  switch (column.type) {
    case "text":
      return (
        <EditableText
          value={typeof value === "string" ? value : ""}
          onSave={onSave}
          placeholder="—"
          className="text-sm text-muted-foreground"
        />
      );

    case "number":
      return (
        <EditableText
          value={value != null ? String(value) : ""}
          onSave={(v) => {
            const num = Number.parseFloat(v);
            onSave(Number.isNaN(num) ? null : num);
          }}
          placeholder="—"
          className="text-sm text-muted-foreground"
          inputClassName="[appearance:textfield]"
        />
      );

    case "checkbox":
      return (
        <Checkbox
          checked={value === true}
          onCheckedChange={(checked) => onSave(checked === true)}
        />
      );

    case "date":
      return (
        <DatePickerCell
          value={typeof value === "string" ? value : null}
          onSave={(d) => onSave(d ?? null)}
        />
      );

    case "select": {
      const strVal = typeof value === "string" ? value : "";
      return (
        <OptionsSelect
          value={strVal}
          options={options}
          onSave={onSave}
          renderValue={(val) => (
            <OptionBadge optionId={val} options={options} />
          )}
        />
      );
    }

    case "status": {
      const strVal = typeof value === "string" ? value : "";
      return (
        <OptionsSelect
          value={strVal}
          options={options}
          onSave={onSave}
          renderValue={(val) => (
            <OptionBadge optionId={val} options={options} />
          )}
        />
      );
    }

    case "priority": {
      const strVal = typeof value === "string" ? value : "";
      return (
        <OptionsSelect
          value={strVal}
          options={options}
          onSave={onSave}
          renderValue={(val) => (
            <PriorityBarsSmall optionId={val} options={options} />
          )}
        />
      );
    }

    case "file": {
      const files = Array.isArray(value) ? (value as string[]) : [];
      return <FilesDialog files={files} onUpdate={(f) => onSave(f)} />;
    }

    default:
      return <span className="text-sm text-muted-foreground">—</span>;
  }
}
