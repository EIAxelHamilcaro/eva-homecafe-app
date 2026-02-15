"use client";

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

interface CustomFieldCellProps {
  column: ITableauColumnDto;
  value: unknown;
  onSave: (value: unknown) => void;
}

export function CustomFieldCell({
  column,
  value,
  onSave,
}: CustomFieldCellProps) {
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
      const options = column.options ?? [];
      const strVal = typeof value === "string" ? value : "";
      return (
        <Select value={strVal} onValueChange={onSave}>
          <SelectTrigger className="h-7 w-[120px] border-0 bg-transparent p-0 text-sm shadow-none">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    default:
      return <span className="text-sm text-muted-foreground">—</span>;
  }
}
