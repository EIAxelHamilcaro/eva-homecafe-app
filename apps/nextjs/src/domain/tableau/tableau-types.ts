export interface IStatusOption {
  id: string;
  label: string;
  color: string;
}

export interface IPriorityOption {
  id: string;
  label: string;
  level: number;
}

export interface IColumnOption {
  id: string;
  label: string;
  color?: string;
}

export type TableauColumnType =
  | "text"
  | "number"
  | "checkbox"
  | "date"
  | "select"
  | "status"
  | "priority"
  | "file";

export interface ITableauColumn {
  id: string;
  name: string;
  type: TableauColumnType;
  position: number;
  options?: IColumnOption[];
}

export const DEFAULT_STATUS_OPTIONS: IStatusOption[] = [
  { id: "todo", label: "À faire", color: "#dbeafe" },
  { id: "in_progress", label: "En cours", color: "#ffedd5" },
  { id: "waiting", label: "En attente", color: "#fef3c7" },
  { id: "done", label: "Terminé", color: "#dcfce7" },
];

export const DEFAULT_PRIORITY_OPTIONS: IPriorityOption[] = [
  { id: "low", label: "Basse", level: 1 },
  { id: "medium", label: "Moyenne", level: 2 },
  { id: "high", label: "Haute", level: 3 },
  { id: "critical", label: "Critique", level: 4 },
];
