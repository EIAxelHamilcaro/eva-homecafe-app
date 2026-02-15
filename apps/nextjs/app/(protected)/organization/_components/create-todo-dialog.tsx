"use client";

import { Button } from "@packages/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import { Input } from "@packages/ui/components/ui/input";
import { useCallback, useState } from "react";

interface CreateTodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateTodoDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateTodoDialogProps) {
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setTitle("");
    setItems([""]);
    setError(null);
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        resetForm();
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetForm],
  );

  const handleAddItem = useCallback(() => {
    setItems((prev) => [...prev, ""]);
  }, []);

  const handleItemChange = useCallback((index: number, value: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;

      setSubmitting(true);
      setError(null);

      try {
        const validItems = items
          .filter((item) => item.trim())
          .map((item) => ({ title: item.trim() }));

        const response = await fetch("/api/v1/boards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            type: "todo",
            items: validItems,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error ?? "Failed to create list");
          return;
        }

        resetForm();
        onOpenChange(false);
        onCreated();
      } catch {
        setError("Failed to create list");
      } finally {
        setSubmitting(false);
      }
    },
    [title, items, onOpenChange, onCreated, resetForm],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New To-do List</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="todo-title"
              className="mb-1 block text-sm font-medium"
            >
              Title
            </label>
            <Input
              id="todo-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Groceries"
              required
              maxLength={100}
            />
          </div>

          <fieldset>
            <legend className="mb-1 block text-sm font-medium">Items</legend>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={`item-row-${index.toString()}`}
                  className="flex gap-2"
                >
                  <Input
                    type="text"
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    placeholder={`Item ${index + 1}`}
                    maxLength={200}
                  />
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveItem(index)}
                      className="rounded-md px-2 text-sm text-muted-foreground hover:text-destructive"
                      aria-label="Remove item"
                    >
                      x
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleAddItem}
              className="mt-2 text-sm text-primary hover:underline"
            >
              + Add item
            </Button>
          </fieldset>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
