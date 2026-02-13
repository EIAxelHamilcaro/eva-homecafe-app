"use client";

import {
  Check,
  Heart,
  Lock,
  MessageCircleMore,
  Pencil,
  Trash2,
  Unlock,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IGetPostCommentsOutputDto } from "@/adapters/queries/post-comments.query";
import type { IGetPostReactionsOutputDto } from "@/adapters/queries/post-reactions.query";
import type { IGetPostDetailOutputDto } from "@/application/dto/post/get-post-detail.dto";

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

function hasUserLiked(
  reactions: IGetPostReactionsOutputDto | null,
  currentUserId: string,
): boolean {
  if (!reactions) return false;
  return reactions.reactions.some(
    (r) => r.emoji === "\u2764\uFE0F" && r.userId === currentUserId,
  );
}

interface PostDetailProps {
  postId: string;
  currentUserId: string;
}

export function PostDetail({ postId, currentUserId }: PostDetailProps) {
  const router = useRouter();
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const [data, setData] = useState<IGetPostDetailOutputDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reactions, setReactions] = useState<IGetPostReactionsOutputDto | null>(
    null,
  );
  const [togglingEmoji, setTogglingEmoji] = useState<string | null>(null);
  const [comments, setComments] = useState<IGetPostCommentsOutputDto | null>(
    null,
  );
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const fetchReactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/posts/${postId}/reactions`);
      if (res.ok) {
        const json = (await res.json()) as IGetPostReactionsOutputDto;
        setReactions(json);
      }
    } catch {}
  }, [postId]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/posts/${postId}/comments`);
      if (res.ok) {
        const json = (await res.json()) as IGetPostCommentsOutputDto;
        setComments(json);
      }
    } catch {}
  }, [postId]);

  const handleToggleReaction = async (emoji: string) => {
    if (togglingEmoji) return;
    setTogglingEmoji(emoji);
    try {
      const res = await fetch(`/api/v1/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      if (res.ok) {
        await fetchReactions();
      }
    } catch {
    } finally {
      setTogglingEmoji(null);
    }
  };

  const handleSubmitComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/v1/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (res.ok) {
        setCommentText("");
        await fetchComments();
      }
    } catch {
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    const trimmed = editingCommentText.trim();
    if (!trimmed) return;
    try {
      const res = await fetch(`/api/v1/posts/${postId}/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (res.ok) {
        setEditingCommentId(null);
        setEditingCommentText("");
        await fetchComments();
      }
    } catch {}
  };

  const handleDeleteComment = async (commentId: string) => {
    if (deletingCommentId) return;
    setDeletingCommentId(commentId);
    try {
      const res = await fetch(`/api/v1/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchComments();
      }
    } catch {
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/posts/${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        let errMsg = "Impossible de supprimer la publication";
        try {
          const err = await res.json();
          errMsg = err.error ?? errMsg;
        } catch {}
        setError(errMsg);
        setDeleting(false);
        setShowDeleteConfirm(false);
        return;
      }
      router.push(data?.isPrivate ? "/journal" : "/posts");
    } catch {
      setError("Impossible de supprimer la publication");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const fetchPost = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/posts/${postId}`);
      if (!res.ok) {
        let errMsg = "Impossible de charger la publication";
        try {
          const err = await res.json();
          errMsg = err.error ?? errMsg;
        } catch {}
        setError(errMsg);
        return;
      }
      const json = (await res.json()) as IGetPostDetailOutputDto;
      setData(json);
    } catch {
      setError("Impossible de charger la publication");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
    fetchReactions();
    fetchComments();
  }, [fetchPost, fetchReactions, fetchComments]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink text-homecafe-pink transition-colors hover:bg-homecafe-pink hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
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
  const userLiked = hasUserLiked(reactions, currentUserId);
  const commentList = comments?.comments ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink text-homecafe-pink transition-colors hover:bg-homecafe-pink hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>

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

          <div className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-homecafe-blue text-white">
            {data.isPrivate ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Unlock className="h-4 w-4" />
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
          <button
            type="button"
            onClick={() => handleToggleReaction("\u2764\uFE0F")}
            disabled={togglingEmoji !== null}
            className="flex items-center gap-1.5 p-2 transition-colors disabled:opacity-50"
          >
            <Heart
              className={`h-5 w-5 ${userLiked ? "fill-red-500 text-red-500" : "text-red-500"}`}
            />
            {likeCount > 0 && (
              <span className="text-sm text-muted-foreground">{likeCount}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => commentInputRef.current?.focus()}
            className="flex items-center gap-1.5 p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageCircleMore className="h-5 w-5" />
            {commentList.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {commentList.length}
              </span>
            )}
          </button>
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
            <button
              type="button"
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || submittingComment}
              className="rounded-full bg-homecafe-pink px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-homecafe-pink-dark disabled:opacity-50"
            >
              {submittingComment ? "Envoi..." : "Envoyer"}
            </button>
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
                        <button
                          type="button"
                          onClick={() => handleUpdateComment(comment.id)}
                          className="shrink-0 p-1 text-emerald-500 transition-colors hover:text-emerald-600"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCommentId(null)}
                          className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
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
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditingCommentText(comment.content);
                          }}
                          title="Modifier"
                          className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingCommentId === comment.id}
                          title="Supprimer"
                          className="p-1 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 text-sm text-destructive transition-colors hover:text-destructive/80"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="rounded-lg border border-border bg-white p-6 dark:bg-card">
          <p className="mb-4 text-sm text-foreground">
            Voulez-vous vraiment supprimer cette publication ? Cette action est
            irr&eacute;versible.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-full bg-destructive px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-destructive/90 disabled:opacity-50"
            >
              {deleting ? "Suppression..." : "Confirmer"}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
              className="rounded-full border border-border px-5 py-2 text-sm transition-colors hover:bg-muted disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
