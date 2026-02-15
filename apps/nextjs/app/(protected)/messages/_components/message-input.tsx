"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Loader2, Paperclip, SendHorizontal, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import {
  useSendMessageMutation,
  useUploadMediaMutation,
} from "@/app/(protected)/_hooks/use-chat";

interface MessageInputProps {
  conversationId: string;
  userId: string;
}

interface SelectedFile {
  file: File;
  previewUrl: string;
}

export function MessageInput({ conversationId, userId }: MessageInputProps) {
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendMessage = useSendMessageMutation(conversationId, userId);
  const uploadMedia = useUploadMediaMutation();

  const canSend =
    (text.trim().length > 0 || selectedFiles.length > 0) &&
    !sendMessage.isPending &&
    !isUploading;

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const newFiles: SelectedFile[] = [];
      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/")) {
          newFiles.push({
            file,
            previewUrl: URL.createObjectURL(file),
          });
        }
      }
      setSelectedFiles((prev) => [...prev, ...newFiles].slice(0, 10));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [],
  );

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => {
      const removed = prev[index];
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleSend = useCallback(async () => {
    const content = text.trim();
    if (!content && selectedFiles.length === 0) return;

    if (selectedFiles.length > 0) {
      setIsUploading(true);
      try {
        const attachments = await uploadMedia.mutateAsync(
          selectedFiles.map((f) => f.file),
        );

        sendMessage.mutate({
          content: content || undefined,
          attachments,
        });

        for (const f of selectedFiles) {
          URL.revokeObjectURL(f.previewUrl);
        }
        setSelectedFiles([]);
        setText("");
      } catch {
        // Upload failed — files stay for retry
      } finally {
        setIsUploading(false);
      }
    } else {
      sendMessage.mutate({ content });
      setText("");
    }

    inputRef.current?.focus();
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  }, [text, selectedFiles, uploadMedia, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  return (
    <div className="border-t border-border px-4 py-3">
      {selectedFiles.length > 0 && (
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {selectedFiles.map((f, i) => (
            <div key={f.previewUrl} className="relative shrink-0">
              <Image
                src={f.previewUrl}
                alt={f.file.name}
                width={64}
                height={64}
                unoptimized
                className="h-16 w-16 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveFile(i)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow-sm"
              >
                <X className="h-3 w-3" />
              </button>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 rounded-2xl bg-muted/50 px-3 py-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="mb-0.5 shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          ref={inputRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Aa"
          rows={1}
          className="max-h-[120px] min-h-[24px] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />

        <Button
          size="icon"
          onClick={handleSend}
          disabled={!canSend}
          className={`mb-0.5 h-8 w-8 shrink-0 rounded-full transition-all ${
            canSend
              ? "bg-homecafe-pink text-white hover:bg-homecafe-pink-dark"
              : "bg-transparent text-muted-foreground"
          }`}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
