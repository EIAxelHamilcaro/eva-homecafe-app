"use client";

import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IGetPostDetailOutputDto } from "@/application/dto/post/get-post-detail.dto";

export function EditPostForm({
  postId,
  currentUserId,
}: {
  postId: string;
  currentUserId: string;
}) {
  const router = useRouter();
  const [isPrivate, setIsPrivate] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm min-h-[150px] w-full max-w-none rounded-b-md border border-t-0 border-gray-300 p-3 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/v1/posts/${postId}`);
        if (!res.ok) {
          let errMsg = "Failed to load post";
          try {
            const err = await res.json();
            errMsg = err.error ?? errMsg;
          } catch {}
          setError(errMsg);
          return;
        }
        const post = (await res.json()) as IGetPostDetailOutputDto;
        if (post.userId !== currentUserId) {
          setError("You do not have permission to edit this post");
          return;
        }
        editor?.commands.setContent(post.content);
        setIsPrivate(post.isPrivate);
        setImages(post.images);
      } catch {
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    if (editor) {
      fetchPost();
    }
  }, [postId, editor, currentUserId]);

  const handleImageUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const presignResponse = await fetch("/api/v1/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          context: "post",
        }),
      });

      if (!presignResponse.ok) {
        const data = await presignResponse.json();
        throw new Error(data.error ?? "Failed to get upload URL");
      }

      const { uploadUrl, fileUrl } = await presignResponse.json();

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      setImages((prev) => [...prev, fileUrl]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const content = editor?.getHTML() ?? "";
    const textContent = editor?.getText().trim() ?? "";

    if (!textContent && images.length === 0) {
      setError("Post must have content or images");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/v1/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          isPrivate,
          images,
        }),
      });

      if (!response.ok) {
        let errMsg = "Failed to update post";
        try {
          const data = await response.json();
          errMsg = data.error ?? errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      router.push(`/posts/${postId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex gap-1 rounded-t-md border border-gray-300 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`rounded px-2 py-1 text-sm font-bold ${
              editor?.isActive("bold") ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`rounded px-2 py-1 text-sm italic ${
              editor?.isActive("italic") ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`rounded px-2 py-1 text-sm underline ${
              editor?.isActive("underline")
                ? "bg-gray-200"
                : "hover:bg-gray-100"
            }`}
          >
            U
          </button>
        </div>
        <EditorContent editor={editor} />
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, index) => (
            <div key={url} className="relative">
              <Image
                src={url}
                alt={`Attachment ${index + 1}`}
                width={80}
                height={80}
                className="h-20 w-20 rounded-md object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Add Image"}
        </button>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="rounded"
          />
          Private (journal entry)
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
        <Link
          href={`/posts/${postId}`}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
