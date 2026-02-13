"use client";

import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { createPostAction } from "@/adapters/actions/post.actions";

export function CreatePostForm() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm min-h-[150px] w-full max-w-none rounded-b-md border border-t-0 border-gray-300 p-3 focus:outline-none",
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
    setSuccess(false);

    const content = editor?.getHTML() ?? "";
    const textContent = editor?.getText().trim() ?? "";

    if (!textContent) {
      setError("Post content is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPostAction({
        content,
        isPrivate,
        images,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      editor?.commands.clearContent();
      setImages([]);
      setIsPrivate(false);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {success && (
        <p className="text-sm text-green-600">Post created successfully!</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isUploading}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
}
