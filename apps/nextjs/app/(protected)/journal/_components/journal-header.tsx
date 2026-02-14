"use client";

import { Button } from "@packages/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import { Globe, Lock, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RichTextEditor } from "@/app/_components/rich-text-editor";
import { DateSticker } from "@/app/(protected)/_components/date-sticker";

interface JournalHeaderProps {
  userName: string;
  userImage: string | null;
  today: string;
}

function formatDateLabel(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function JournalHeader({
  userName,
  userImage,
  today,
}: JournalHeaderProps) {
  const [open, setOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);
  const router = useRouter();

  async function handleSubmit(data: { html: string; images: string[] }) {
    const res = await fetch("/api/v1/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: data.html,
        isPrivate,
        images: data.images,
        createdAt: today,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(
        (body as { error?: string } | null)?.error ??
          "Erreur lors de la sauvegarde",
      );
    }

    setOpen(false);
    router.refresh();
    window.dispatchEvent(new CustomEvent("journal:post-created"));
  }

  return (
    <>
      <div className="flex items-stretch gap-3 sm:gap-4">
        <DateSticker date={today} />

        <div className="flex flex-1 items-center justify-center gap-3 rounded bg-homecafe-blue/10 p-2 sm:gap-6">
          {userImage ? (
            <Image
              src={userImage}
              alt={userName}
              width={64}
              height={64}
              className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-16 sm:w-16"
              unoptimized
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-homecafe-pink-light sm:h-16 sm:w-16">
              <User size={26} className="text-homecafe-pink" />
            </div>
          )}
          <Button
            type="button"
            onClick={() => setOpen(true)}
            className="min-w-0 flex-1 justify-start rounded-full border border-homecafe-pink bg-transparent px-4 py-3 text-sm text-foreground transition-colors hover:border-homecafe-pink/50 hover:bg-homecafe-pink hover:text-foreground sm:flex-initial sm:w-[50%] sm:px-8"
          >
            Ajouter un post
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogTitle className="sr-only">
            {"\u00C9"}crire dans le journal
          </DialogTitle>
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
                {formatDateLabel(today)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate((v) => !v)}
              title={
                isPrivate
                  ? "Priv\u00E9 \u2014 cliquer pour rendre public"
                  : "Public \u2014 cliquer pour rendre priv\u00E9"
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
          <RichTextEditor initialContent="" onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </>
  );
}
