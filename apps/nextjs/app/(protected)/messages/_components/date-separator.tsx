"use client";

import { formatDateSeparator } from "../_constants/chat";

interface DateSeparatorProps {
  date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex items-center justify-center py-3">
      <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
        {formatDateSeparator(date)}
      </span>
    </div>
  );
}
