"use client";

import { Badge } from "@packages/ui/components/ui/badge";
import { Button } from "@packages/ui/components/ui/button";
import { Checkbox } from "@packages/ui/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import { Input } from "@packages/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/ui/select";
import { Textarea } from "@packages/ui/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { useCallback, useState } from "react";

interface CreateKanbanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const PREDEFINED_COLUMNS = [
  { title: "À faire", emoji: "📋" },
  { title: "En cours", emoji: "⏳" },
  { title: "En attente", emoji: "📨" },
  { title: "Terminé", emoji: "✅" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Basse" },
  { value: "medium", label: "Moyenne" },
  { value: "high", label: "Haute" },
  { value: "critical", label: "Critique" },
];

const PREDEFINED_TAGS = [
  { label: "Perso", color: "bg-red-400" },
  { label: "Maison", color: "bg-green-500" },
  { label: "Déco", color: "bg-blue-500" },
  { label: "Achats", color: "bg-emerald-500" },
  { label: "Vu sur Pinterest", color: "bg-orange-400" },
  { label: "Travail", color: "bg-pink-400" },
];

export function CreateKanbanDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateKanbanDialogProps) {
  const [title, setTitle] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "À faire",
    "En cours",
    "Terminé",
  ]);
  const [customColumnName, setCustomColumnName] = useState("");
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [priority, setPriority] = useState<string>("low");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split("T")[0] ?? "",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setTitle("");
    setSelectedColumns(["À faire", "En cours", "Terminé"]);
    setCustomColumnName("");
    setCustomColumns([]);
    setPriority("low");
    setDescription("");
    setLink("");
    setDueDate(new Date().toISOString().split("T")[0] ?? "");
    setSelectedTags([]);
    setNewTagName("");
    setError(null);
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetForm();
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetForm],
  );

  const toggleColumn = useCallback((colTitle: string) => {
    setSelectedColumns((prev) =>
      prev.includes(colTitle)
        ? prev.filter((c) => c !== colTitle)
        : [...prev, colTitle],
    );
  }, []);

  const handleAddCustomColumn = useCallback(() => {
    const trimmed = customColumnName.trim();
    if (!trimmed) return;
    if (
      customColumns.includes(trimmed) ||
      PREDEFINED_COLUMNS.some((c) => c.title === trimmed)
    )
      return;
    setCustomColumns((prev) => [...prev, trimmed]);
    setSelectedColumns((prev) => [...prev, trimmed]);
    setCustomColumnName("");
  }, [customColumnName, customColumns]);

  const removeCustomColumn = useCallback((colTitle: string) => {
    setCustomColumns((prev) => prev.filter((c) => c !== colTitle));
    setSelectedColumns((prev) => prev.filter((c) => c !== colTitle));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const handleAddTag = useCallback(() => {
    const trimmed = newTagName.trim();
    if (!trimmed || selectedTags.includes(trimmed)) return;
    setSelectedTags((prev) => [...prev, trimmed]);
    setNewTagName("");
  }, [newTagName, selectedTags]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;

      setSubmitting(true);
      setError(null);

      const allColumns = selectedColumns.map((colTitle) => ({
        title: colTitle,
      }));

      try {
        const response = await fetch("/api/v1/boards/kanban", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            columns: allColumns.length > 0 ? allColumns : undefined,
            priority,
            description: description.trim() || undefined,
            link: link.trim() || undefined,
            dueDate: dueDate || undefined,
            tags: selectedTags.length > 0 ? selectedTags : undefined,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error ?? "Impossible de créer le board");
          return;
        }

        resetForm();
        onOpenChange(false);
        onCreated();
      } catch {
        setError("Impossible de créer le board");
      } finally {
        setSubmitting(false);
      }
    },
    [
      title,
      selectedColumns,
      priority,
      description,
      link,
      dueDate,
      selectedTags,
      onOpenChange,
      onCreated,
      resetForm,
    ],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouveau Kanban</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Left column */}
            <div className="space-y-5">
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nom du kanban"
                required
                maxLength={100}
              />

              <div>
                <p className="mb-2 text-sm font-semibold">Colonnes</p>
                <div className="space-y-2">
                  {PREDEFINED_COLUMNS.map((col) => (
                    <button
                      key={col.title}
                      type="button"
                      onClick={() => toggleColumn(col.title)}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Checkbox
                        checked={selectedColumns.includes(col.title)}
                        tabIndex={-1}
                      />
                      <span className="text-sm">
                        {col.emoji} {col.title}
                      </span>
                    </button>
                  ))}
                  {customColumns.map((col) => (
                    <div key={col} className="flex items-center gap-2">
                      <Checkbox checked disabled />
                      <span className="flex-1 text-sm">{col}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomColumn(col)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    customColumnName.trim()
                      ? handleAddCustomColumn()
                      : document.getElementById("custom-col-input")?.focus()
                  }
                  className="mt-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  + Ajouter
                </button>
                <Input
                  id="custom-col-input"
                  type="text"
                  value={customColumnName}
                  onChange={(e) => setCustomColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomColumn();
                    }
                  }}
                  placeholder="Nom de la colonne"
                  maxLength={100}
                  className="mt-2"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold">Tag</p>
                <div className="flex flex-wrap gap-1.5">
                  {PREDEFINED_TAGS.map((tag) => (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => toggleTag(tag.label)}
                      className={`rounded-full px-3 py-0.5 text-xs font-medium text-white transition-opacity ${tag.color} ${
                        selectedTags.includes(tag.label)
                          ? "opacity-100 ring-2 ring-offset-1 ring-black/20"
                          : "opacity-60 hover:opacity-80"
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                  {selectedTags
                    .filter(
                      (t) => !PREDEFINED_TAGS.some((pt) => pt.label === t),
                    )
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 text-xs"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <Input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Nouveau tag"
                    maxLength={50}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleAddTag}
                    disabled={!newTagName.trim()}
                    className="h-9 w-9 shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <div>
                <p className="mb-1 text-sm font-semibold">Priorité</p>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold">Texte</p>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Type your message here."
                  rows={3}
                  maxLength={5000}
                />
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold">Lien</p>
                <Input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  maxLength={2000}
                />
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold">Date</p>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              disabled={submitting || !title.trim()}
              className="bg-pink-400 hover:bg-pink-500"
            >
              {submitting ? "Création..." : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
