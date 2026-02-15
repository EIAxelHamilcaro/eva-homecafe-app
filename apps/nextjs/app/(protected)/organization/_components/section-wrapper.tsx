"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@packages/ui/components/ui/button";
import { ChevronDown, ChevronRight, GripVertical, Pencil } from "lucide-react";
import type { ReactNode } from "react";

interface SectionWrapperProps {
  id: string;
  title: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  children: ReactNode;
  onEdit?: () => void;
  bgClassName?: string;
}

export function SectionWrapper({
  id,
  title,
  isCollapsed,
  onToggleCollapse,
  children,
  onEdit,
  bgClassName,
}: SectionWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border border-orange-100 ${bgClassName ?? "bg-white"} transition-shadow ${
        isDragging ? "z-10 shadow-lg ring-2 ring-primary/20 opacity-95" : ""
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <h2 className="flex-1 text-lg font-semibold">{title}</h2>

        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="scrollbar-hover max-h-[60vh] overflow-y-auto px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
