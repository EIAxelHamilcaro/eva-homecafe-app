"use client";

import { Button } from "@packages/ui/components/ui/button";
import Mention from "@tiptap/extension-mention";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ImageIcon, Loader2, Plus, UserPlus, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  createMentionSuggestion,
  type MentionItem,
} from "./rich-text-mention-suggestion";

async function fetchFriends(): Promise<MentionItem[]> {
  try {
    const res = await fetch("/api/v1/friends?limit=100");
    if (!res.ok) return [];
    const data = (await res.json()) as {
      friends: {
        userId: string;
        displayName: string | null;
        name: string | null;
        avatarUrl: string | null;
      }[];
    };
    return data.friends.map((f) => ({
      id: f.userId,
      label: f.displayName || f.name || "Ami",
      avatarUrl: f.avatarUrl,
    }));
  } catch {
    return [];
  }
}

interface RichTextEditorProps {
  initialContent?: string;
  initialImages?: string[];
  minHeight?: string;
  onSubmit: (data: { html: string; images: string[] }) => Promise<void>;
  submitLabel?: string;
  submittingLabel?: string;
}

export function RichTextEditor({
  initialContent = "",
  initialImages,
  minHeight = "150px",
  onSubmit,
  submitLabel = "Publier",
  submittingLabel = "Publication...",
}: RichTextEditorProps) {
  const [images, setImages] = useState<string[]>(initialImages ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mentionSuggestion = useMemo(
    () => createMentionSuggestion(fetchFriends),
    [],
  );

  const editor = useEditor({
    immediatelyRender: false,
    content: initialContent,
    extensions: [
      StarterKit,
      Underline,
      Mention.configure({
        HTMLAttributes: {
          class: "text-homecafe-blue font-medium",
        },
        suggestion: mentionSuggestion,
      }),
    ],
    editorProps: {
      attributes: {
        class: `prose prose-sm w-full max-w-none p-3 focus:outline-none text-sm min-h-[${minHeight}]`,
      },
    },
  });

  const handleImageUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const presignResponse = await fetch("/api/v1/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          context: "post",
        }),
      });

      if (!presignResponse.ok) {
        const data = await presignResponse.json();
        throw new Error(
          (data as { error?: string }).error ?? "Erreur lors de l'upload",
        );
      }

      const { uploadUrl, fileUrl } = (await presignResponse.json()) as {
        uploadUrl: string;
        fileUrl: string;
      };

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Erreur lors de l'upload de l'image");
      }

      setImages((prev) => [...prev, fileUrl]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleImageUpload],
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  function insertMention() {
    editor?.chain().focus().insertContent("@").run();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const html = editor?.getHTML() ?? "";
    const textContent = editor?.getText().trim() ?? "";
    if (!textContent || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({ html, images });
      editor?.commands.clearContent();
      setImages([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="overflow-hidden rounded-lg border">
        <div className="flex items-center gap-1 bg-homecafe-blue/10 p-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold ${
              editor?.isActive("bold")
                ? "bg-homecafe-blue text-white"
                : "text-homecafe-blue hover:bg-homecafe-blue/20"
            }`}
          >
            B
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`flex h-7 w-7 items-center justify-center rounded text-sm italic ${
              editor?.isActive("italic")
                ? "bg-homecafe-blue text-white"
                : "text-homecafe-blue hover:bg-homecafe-blue/20"
            }`}
          >
            I
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`flex h-7 w-7 items-center justify-center rounded text-sm underline ${
              editor?.isActive("underline")
                ? "bg-homecafe-blue text-white"
                : "text-homecafe-blue hover:bg-homecafe-blue/20"
            }`}
          >
            U
          </Button>
          <div className="flex-1" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex h-7 w-7 items-center justify-center rounded text-homecafe-blue hover:bg-homecafe-blue/20 disabled:opacity-50"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={insertMention}
            className="flex h-7 w-7 items-center justify-center rounded text-homecafe-blue hover:bg-homecafe-blue/20"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
        <EditorContent editor={editor} />
      </div>

      {(images.length > 0 || isUploading) && (
        <div className="mt-3 overflow-hidden rounded-lg border bg-muted/30">
          <div
            className={`grid gap-1 ${
              images.length === 1
                ? "grid-cols-1"
                : images.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2"
            }`}
          >
            {images.map((url, index) => (
              <div
                key={url}
                className={`group relative ${
                  images.length === 1
                    ? "max-h-56"
                    : images.length === 3 && index === 0
                      ? "row-span-2"
                      : ""
                }`}
              >
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  width={400}
                  height={200}
                  className={`h-full w-full object-cover ${
                    images.length === 1 ? "max-h-56" : "aspect-[4/3]"
                  }`}
                  unoptimized
                />
                <Button
                  variant="ghost"
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {isUploading && (
              <div className="flex aspect-square items-center justify-center bg-muted/50">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || images.length >= 10}
            className="flex w-full items-center justify-center gap-2 border-t px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter des photos
          </Button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <div className="mt-3 flex justify-end">
        <Button
          type="submit"
          disabled={submitting || isUploading}
          className="rounded-full bg-homecafe-pink px-6 py-2 text-sm font-semibold text-white hover:bg-homecafe-pink/90 disabled:opacity-50"
        >
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
