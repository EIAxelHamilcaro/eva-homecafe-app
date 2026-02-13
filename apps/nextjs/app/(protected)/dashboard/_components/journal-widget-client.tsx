"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import { Globe, Lock, Pen, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { createPostAction } from "@/adapters/actions/post.actions";
import { RichTextEditor } from "@/app/_components/rich-text-editor";

interface JournalWidgetClientProps {
  selectedDate: string;
  dateLabel: string;
  userName: string;
  userImage: string | null;
  existingContent: string | null;
}

export function JournalWidgetClient({
  selectedDate,
  dateLabel,
  userName,
  userImage,
  existingContent,
}: JournalWidgetClientProps) {
  const [open, setOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);

  async function handleSubmit(data: { html: string; images: string[] }) {
    const result = await createPostAction({
      content: data.html,
      isPrivate,
      images: data.images,
      createdAt: selectedDate,
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 w-full text-left"
      >
        {existingContent ? (
          <div className="rounded-xl bg-muted/50 p-3">
            <div
              className="prose prose-sm max-w-none text-sm line-clamp-3"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized HTML from rich text editor
              dangerouslySetInnerHTML={{ __html: existingContent }}
            />
            <p className="mt-2 text-xs font-medium text-homecafe-pink">
              Modifier
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-homecafe-pink/10">
              <Pen className="h-4 w-4 text-homecafe-pink" />
            </div>
            <p className="text-sm text-muted-foreground">
              Commence a ecrire ici...
            </p>
          </div>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogTitle className="sr-only">Ecrire dans le journal</DialogTitle>
          <div className="flex items-center gap-3">
            {userImage ? (
              <Image
                src={userImage}
                alt={userName}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-homecafe-pink-light">
                <User size={22} className="text-homecafe-pink" />
              </div>
            )}
            <div>
              <p className="font-semibold">{userName}</p>
              <p className="text-sm capitalize text-muted-foreground">
                {dateLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate((v) => !v)}
              title={
                isPrivate
                  ? "Privé — cliquer pour rendre public"
                  : "Public — cliquer pour rendre privé"
              }
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                isPrivate
                  ? "bg-homecafe-blue text-white"
                  : "bg-emerald-500 text-white"
              }`}
            >
              {isPrivate ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
            </button>
          </div>
          <RichTextEditor
            initialContent={existingContent ?? ""}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
