"use client";

import { Button } from "@packages/ui/components/ui/button";
import {
  Check,
  Globe,
  Heart,
  Lock,
  MessageCircleMore,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  useAddCommentMutation,
  useDeleteCommentMutation,
  useDeletePostMutation,
  usePostCommentsQuery,
  usePostDetailQuery,
  usePostReactionsQuery,
  useToggleReactionMutation,
  useUpdateCommentMutation,
} from "@/app/(protected)/_hooks/use-posts";

function formatDateHeading(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}h${minutes}`;
}

function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `il y a ${diffD}j`;
  return new Date(isoString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

interface PostDetailProps {
  postId: string;
  currentUserId: string;
}

export function PostDetail({ postId, currentUserId }: PostDetailProps) {
  const router = useRouter();
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const { data, isLoading, error: postError } = usePostDetailQuery(postId);
  const { data: reactions } = usePostReactionsQuery(postId);
  const { data: comments } = usePostCommentsQuery(postId);

  const toggleReaction = useToggleReactionMutation(postId);
  const addComment = useAddCommentMutation(postId);
  const deleteComment = useDeleteCommentMutation(postId);
  const updateComment = useUpdateCommentMutation(postId);
  const deletePost = useDeletePostMutation();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleToggleReaction = (emoji: string) => {
    if (toggleReaction.isPending) return;
    toggleReaction.mutate({ emoji });
  };

  const handleSubmitComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed || addComment.isPending) return;
    addComment.mutate(
      { content: trimmed },
      { onSuccess: () => setCommentText("") },
    );
  };

  const handleUpdateComment = (commentId: string) => {
    const trimmed = editingCommentText.trim();
    if (!trimmed) return;
    updateComment.mutate(
      { commentId, content: trimmed },
      {
        onSuccess: () => {
          setEditingCommentId(null);
          setEditingCommentText("");
        },
      },
    );
  };

  const handleDeleteComment = (commentId: string) => {
    if (deleteComment.isPending) return;
    deleteComment.mutate({ commentId });
  };

  const handleDelete = () => {
    setDeleteError(null);
    deletePost.mutate(
      { postId },
      {
        onSuccess: () => {
          router.push(data?.isPrivate ? "/journal" : "/posts");
        },
        onError: (err) => {
          setDeleteError(
            err.message || "Impossible de supprimer la publication",
          );
          setShowDeleteConfirm(false);
        },
      },
    );
  };

  const error = postError?.message ?? deleteError;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/posts")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink text-homecafe-pink transition-colors hover:bg-homecafe-pink hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const isOwner = data.userId === currentUserId;
  const likeCount = reactions?.totalCount ?? 0;
  const userLiked = reactions
    ? reactions.reactions.some(
        (r) => r.emoji === "\u2764\uFE0F" && r.userId === currentUserId,
      )
    : false;
  const commentList = comments?.comments ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.push("/posts")}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink text-homecafe-pink transition-colors hover:bg-homecafe-pink hover:text-white"
      >
        <X className="h-5 w-5" />
      </Button>

      <div className="overflow-hidden rounded-lg border border-border bg-white dark:bg-card">
        <div className="relative p-6">
          <div>
            <h2 className="text-xl font-bold capitalize">
              {formatDateHeading(data.createdAt)}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatTime(data.createdAt)}
            </p>
          </div>

          <div
            className={`absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full text-white ${
              data.isPrivate ? "bg-homecafe-blue" : "bg-emerald-500"
            }`}
          >
            {data.isPrivate ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
          </div>
        </div>

        {/* biome-ignore-start lint/security/noDangerouslySetInnerHtml: Tiptap rich text content */}
        <div
          className="prose prose-sm dark:prose-invert max-w-none px-6 pb-4"
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
        {/* biome-ignore-end lint/security/noDangerouslySetInnerHtml: Tiptap rich text content */}

        {data.images.length > 0 && (
          <div className="grid gap-3 px-6 pb-4 sm:grid-cols-2">
            {data.images.map((img) => (
              <div key={img} className="relative aspect-video w-full">
                <Image
                  src={img}
                  alt=""
                  fill
                  className="rounded-lg object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-around rounded-b-lg bg-[#b77fff]/15 px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => handleToggleReaction("\u2764\uFE0F")}
            disabled={toggleReaction.isPending}
            className="flex items-center gap-1.5 p-2"
          >
            <Heart
              className={`h-5 w-5 ${userLiked ? "fill-red-500 text-red-500" : "text-red-500"}`}
            />
            {likeCount > 0 && (
              <span className="text-sm text-muted-foreground">{likeCount}</span>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => commentInputRef.current?.focus()}
            className="flex items-center gap-1.5 p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageCircleMore className="h-5 w-5" />
            {commentList.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {commentList.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <textarea
            ref={commentInputRef}
            id="comment-input"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
            placeholder="Ajouter un commentaire"
            rows={2}
            className="w-full resize-none rounded-md border border-border bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-homecafe-pink/40"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || addComment.isPending}
              className="rounded-full px-6"
            >
              {addComment.isPending ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </div>

        {commentList.length > 0 && (
          <div className="space-y-3">
            {commentList.map((comment) => {
              const name = comment.displayName ?? comment.userName;
              return (
                <div
                  key={comment.id}
                  className="flex gap-3 rounded-lg border border-border bg-white p-4 dark:bg-card"
                >
                  {comment.avatarUrl ? (
                    <Image
                      src={comment.avatarUrl}
                      alt={name}
                      width={32}
                      height={32}
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-homecafe-pink-light text-xs font-medium text-homecafe-pink">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingCommentText}
                          onChange={(e) =>
                            setEditingCommentText(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleUpdateComment(comment.id);
                            }
                            if (e.key === "Escape") {
                              setEditingCommentId(null);
                            }
                          }}
                          className="flex-1 rounded-md border border-border bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-homecafe-pink/40"
                        />
                        <Button
                          variant="ghost"
                          onClick={() => handleUpdateComment(comment.id)}
                          className="shrink-0 p-1 text-emerald-500 transition-colors hover:text-emerald-600"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setEditingCommentId(null)}
                          className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="mt-0.5 text-sm text-foreground">
                        {comment.content}
                      </p>
                    )}
                  </div>
                  {comment.userId === currentUserId &&
                    editingCommentId !== comment.id && (
                      <div className="flex shrink-0 gap-1 self-start">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditingCommentText(comment.content);
                          }}
                          title="Modifier"
                          className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deleteComment.isPending}
                          title="Supprimer"
                          className="p-1 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isOwner && (
        <div className="flex items-center gap-4">
          <Link
            href={`/posts/${postId}/edit`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
            Modifier
          </Link>
          <Button
            variant="ghost"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 text-sm text-destructive transition-colors hover:text-destructive/80"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        </div>
      )}

      {deleteError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
          {deleteError}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="rounded-lg border border-border bg-white p-6 dark:bg-card">
          <p className="mb-4 text-sm text-foreground">
            Voulez-vous vraiment supprimer cette publication ? Cette action est
            irr&eacute;versible.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handleDelete}
              disabled={deletePost.isPending}
              className="rounded-full bg-destructive px-5 text-white hover:bg-destructive/90"
            >
              {deletePost.isPending ? "Suppression..." : "Confirmer"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deletePost.isPending}
              className="rounded-full border border-border px-5 hover:bg-muted"
            >
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
