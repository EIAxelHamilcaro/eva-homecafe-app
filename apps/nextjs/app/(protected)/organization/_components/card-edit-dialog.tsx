"use client";

import { Badge } from "@packages/ui/components/ui/badge";
import { Button } from "@packages/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import { Input } from "@packages/ui/components/ui/input";
import { Progress } from "@packages/ui/components/ui/progress";
import { Separator } from "@packages/ui/components/ui/separator";
import { Textarea } from "@packages/ui/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { useCallback, useState } from "react";
import type {
  IBoardDto,
  ICardDto,
} from "@/application/dto/board/common-board.dto";

interface CardEditDialogProps {
  open: boolean;
  boardId: string;
  card: ICardDto;
  onOpenChange: (open: boolean) => void;
  onUpdated: (data: IBoardDto) => void;
}

const PRIORITY_OPTIONS = [
  { value: "low", label: "Basse", color: "bg-gray-200 text-gray-700" },
  {
    value: "medium",
    label: "Moyenne",
    color: "bg-yellow-100 text-yellow-700",
  },
  { value: "high", label: "Haute", color: "bg-orange-100 text-orange-700" },
  {
    value: "critical",
    label: "Critique",
    color: "bg-red-100 text-red-700",
  },
];

const PREDEFINED_TAGS = [
  { label: "Perso", color: "bg-red-400" },
  { label: "Maison", color: "bg-green-500" },
  { label: "Déco", color: "bg-blue-500" },
  { label: "Achats", color: "bg-emerald-500" },
  { label: "Vu sur Pinterest", color: "bg-orange-400" },
  { label: "Travail", color: "bg-pink-400" },
];

export function CardEditDialog({
  open,
  boardId,
  card,
  onOpenChange,
  onUpdated,
}: CardEditDialogProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [content, setContent] = useState(card.content ?? "");
  const [progress, setProgress] = useState(card.progress);
  const [priority, setPriority] = useState(card.priority ?? "low");
  const [tags, setTags] = useState<string[]>(card.tags);
  const [link, setLink] = useState(card.link ?? "");
  const [dueDate, setDueDate] = useState(
    card.dueDate ?? new Date().toISOString().split("T")[0] ?? "",
  );
  const [newTagName, setNewTagName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = useCallback((tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const handleAddTag = useCallback(() => {
    const trimmed = newTagName.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags((prev) => [...prev, trimmed]);
    setNewTagName("");
  }, [newTagName, tags]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;

      setSubmitting(true);
      setError(null);

      try {
        const body: Record<string, unknown> = {};
        if (title.trim() !== card.title) {
          body.title = title.trim();
        }
        if (description !== (card.description ?? "")) {
          body.description = description || null;
        }
        if (content !== (card.content ?? "")) {
          body.content = content || null;
        }
        if (progress !== card.progress) {
          body.progress = progress;
        }
        if (priority !== (card.priority ?? "low")) {
          body.priority = priority || null;
        }
        const tagsChanged = JSON.stringify(tags) !== JSON.stringify(card.tags);
        if (tagsChanged) {
          body.tags = tags;
        }
        if (link !== (card.link ?? "")) {
          body.link = link || null;
        }
        if (dueDate !== (card.dueDate ?? "")) {
          body.dueDate = dueDate || null;
        }

        if (Object.keys(body).length === 0) {
          onOpenChange(false);
          return;
        }

        const response = await fetch(
          `/api/v1/boards/${boardId}/cards/${card.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
        );

        if (!response.ok) {
          const errData = await response.json();
          setError(errData.error ?? "Impossible de modifier la carte");
          return;
        }

        const data = await response.json();
        onOpenChange(false);
        onUpdated(data);
      } catch {
        setError("Impossible de modifier la carte");
      } finally {
        setSubmitting(false);
      }
    },
    [
      title,
      description,
      content,
      progress,
      priority,
      tags,
      link,
      dueDate,
      card,
      boardId,
      onOpenChange,
      onUpdated,
    ],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="scrollbar-hover max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Modifier la carte</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              className="text-base font-medium"
              placeholder="Titre de la carte"
            />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Description
            </p>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Courte description..."
              rows={2}
              maxLength={5000}
            />
          </div>

          <Separator />

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                Priorité
              </p>
              <div className="flex gap-1.5">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${opt.color} ${
                      priority === opt.value
                        ? "ring-2 ring-offset-1 ring-black/20"
                        : "opacity-60 hover:opacity-80"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-32">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                Date
              </p>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Progression — {progress}%
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="flex-1"
              />
              <Progress value={progress} className="h-2 w-16" />
            </div>
          </div>

          <Separator />

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PREDEFINED_TAGS.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => toggleTag(tag.label)}
                  className={`rounded-full px-3 py-0.5 text-xs font-medium text-white transition-opacity ${tag.color} ${
                    tags.includes(tag.label)
                      ? "opacity-100 ring-2 ring-offset-1 ring-black/20"
                      : "opacity-50 hover:opacity-70"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
              {tags
                .filter((t) => !PREDEFINED_TAGS.some((pt) => pt.label === t))
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

          <Separator />

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Lien
            </p>
            <Input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              maxLength={2000}
            />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Texte
            </p>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Notes, détails, contenu libre..."
              rows={4}
              maxLength={10000}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
