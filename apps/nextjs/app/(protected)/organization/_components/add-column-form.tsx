"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Input } from "@packages/ui/components/ui/input";
import { useCallback, useState } from "react";

interface AddColumnFormProps {
  onSubmit: (title: string) => void;
  onCancel: () => void;
}

export function AddColumnForm({ onSubmit, onCancel }: AddColumnFormProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;
      onSubmit(title.trim());
    },
    [title, onSubmit],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-dashed p-3"
    >
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre de la colonne"
        maxLength={100}
        autoFocus
      />
      <div className="mt-2 flex gap-2">
        <Button type="submit" size="sm" disabled={!title.trim()}>
          Ajouter
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
