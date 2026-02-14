"use client";

import { Button } from "@packages/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import { Globe, Lock, Maximize2, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { startTransition, useOptimistic, useState } from "react";
import { RichTextEditor } from "@/app/_components/rich-text-editor";
import {
  useEditJournalEntryMutation,
  useJournalEntriesQuery,
} from "@/app/(protected)/_hooks/use-journal";
import { useTogglePrivacyMutation } from "@/app/(protected)/_hooks/use-posts";
import type { IPostDto } from "@/application/dto/post/get-user-posts.dto";
import { stripHtml, truncate } from "@/common/utils/text";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function formatDateHeading(dateStr: string): string {
  if (!DATE_REGEX.test(dateStr)) return dateStr;
  const date = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}h${minutes}`;
}

interface JournalEntriesProps {
  title?: string;
  subtitle?: string;
}

export function JournalEntries({
  title = "Derniers posts",
  subtitle = "Tes posts sont classés de manière chronologique",
}: JournalEntriesProps) {
  const { data, isLoading, error } = useJournalEntriesQuery(1);
  const togglePrivacy = useTogglePrivacyMutation();
  const editEntry = useEditJournalEntryMutation();

  const [optimisticToggles, setOptimisticToggle] = useOptimistic(
    {} as Record<string, boolean>,
    (state, postId: string) => {
      const allPosts = data?.groups.flatMap((g) => g.posts) ?? [];
      const post = allPosts.find((p) => p.id === postId);
      const current = state[postId] ?? post?.isPrivate ?? true;
      return { ...state, [postId]: !current };
    },
  );
  const [bouncingIds, setBouncingIds] = useState<Set<string>>(new Set());
  const [editingPost, setEditingPost] = useState<IPostDto | null>(null);

  function openEdit(e: React.MouseEvent, post: IPostDto) {
    e.preventDefault();
    e.stopPropagation();
    setEditingPost(post);
  }

  async function handleEditSubmit(submitData: {
    html: string;
    images: string[];
  }) {
    if (!editingPost) return;
    await editEntry.mutateAsync({
      postId: editingPost.id,
      content: submitData.html,
      images: submitData.images,
    });
    setEditingPost(null);
  }

  function handleTogglePrivacy(
    e: React.MouseEvent,
    postId: string,
    currentIsPrivate: boolean,
  ) {
    e.preventDefault();
    e.stopPropagation();

    startTransition(() => {
      setOptimisticToggle(postId);
    });
    setBouncingIds((prev) => new Set(prev).add(postId));
    setTimeout(() => {
      setBouncingIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }, 400);

    togglePrivacy.mutate({ postId, isPrivate: !currentIsPrivate });
  }

  return (
    <Card className="border-0 h-full">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Link
          href="/posts"
          title="Voir tous les posts"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Maximize2 className="h-4 w-4" />
        </Link>
      </CardHeader>

      <CardContent className="max-h-[55vh] overflow-y-auto lg:h-[calc(100vh-26rem)] lg:max-h-none">
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
            {error.message}
          </div>
        )}

        {!isLoading && !error && (!data || data.groups.length === 0) && (
          <div className="rounded-xl border-12 border-homecafe-green/20 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Aucune entrée pour le moment
            </p>
          </div>
        )}

        {!isLoading && !error && data && data.groups.length > 0 && (
          <div className="space-y-3">
            {data.groups.flatMap((group) =>
              group.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-xl border-12 border-homecafe-green/20 p-4 transition-all duration-200 hover:scale-[1.02] hover:border-homecafe-green/40 hover:shadow-lg hover:shadow-homecafe-green/15"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {formatDateHeading(group.date)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        onClick={(e) => openEdit(e, post)}
                        title="Modifier"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {(() => {
                        const isPrivate =
                          optimisticToggles[post.id] ?? post.isPrivate;
                        const isBouncing = bouncingIds.has(post.id);
                        return (
                          <Button
                            onClick={(e) =>
                              handleTogglePrivacy(e, post.id, isPrivate)
                            }
                            title={
                              isPrivate
                                ? "Privé — cliquer pour rendre public"
                                : "Public — cliquer pour rendre privé"
                            }
                            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white transition-all duration-300 hover:opacity-80 ${
                              isPrivate ? "bg-homecafe-blue" : "bg-emerald-500"
                            } ${isBouncing ? "scale-125" : "scale-100"}`}
                          >
                            <span
                              className={`transition-transform duration-300 ${isBouncing ? "rotate-[360deg]" : ""}`}
                            >
                              {isPrivate ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <Globe className="h-4 w-4" />
                              )}
                            </span>
                          </Button>
                        );
                      })()}
                    </div>
                  </div>
                  <time className="mb-2 block text-xs text-muted-foreground">
                    {formatTime(post.createdAt)}
                  </time>
                  <div className="flex gap-3">
                    <p className="flex-1 text-sm text-foreground">
                      {truncate(stripHtml(post.content), 150)}
                    </p>
                    {post.images.length > 0 && (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={post.images[0] as string}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                </Link>
              )),
            )}
          </div>
        )}
      </CardContent>

      <Dialog
        open={editingPost !== null}
        onOpenChange={(open) => {
          if (!open) setEditingPost(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogTitle className="text-lg font-semibold">
            Modifier le post
          </DialogTitle>
          {editingPost && (
            <RichTextEditor
              key={editingPost.id}
              initialContent={editingPost.content}
              initialImages={editingPost.images}
              onSubmit={handleEditSubmit}
              submitLabel="Enregistrer"
              submittingLabel="Enregistrement..."
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
