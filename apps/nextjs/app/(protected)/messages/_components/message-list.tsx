"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMessagesQuery } from "@/app/(protected)/_hooks/use-chat";
import type { Attachment, Message } from "../_constants/chat";
import { DateSeparator } from "./date-separator";
import { ImageViewerModal } from "./image-viewer-modal";
import { MessageBubble } from "./message-bubble";

interface MessageListProps {
  conversationId: string;
  userId: string;
  userName: string;
  userImage: string | null;
  otherUserName: string;
  otherUserImage: string | null;
}

function shouldShowDateSeparator(
  current: Message,
  previous: Message | undefined,
): boolean {
  if (!previous) return true;
  const currentDate = new Date(current.createdAt).toDateString();
  const previousDate = new Date(previous.createdAt).toDateString();
  return currentDate !== previousDate;
}

export function MessageList({
  conversationId,
  userId,
  userName,
  userImage,
  otherUserName,
  otherUserImage,
}: MessageListProps) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useMessagesQuery(conversationId);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  const newestMessageIdRef = useRef<string | null>(null);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<Attachment[]>([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  const sortedMessages = useMemo(() => {
    const pages = data?.pages ?? [];
    const seen = new Set<string>();
    const messages: Message[] = [];
    for (const page of pages) {
      for (const msg of page.messages) {
        if (!seen.has(msg.id)) {
          seen.add(msg.id);
          messages.push(msg);
        }
      }
    }
    return messages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [data?.pages]);

  useEffect(() => {
    if (sortedMessages.length === 0) return;
    const newestId = sortedMessages[sortedMessages.length - 1]?.id ?? null;

    if (isInitialLoadRef.current) {
      requestAnimationFrame(() => {
        const container = scrollContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
      isInitialLoadRef.current = false;
    } else if (
      newestId !== newestMessageIdRef.current &&
      newestMessageIdRef.current !== null
    ) {
      requestAnimationFrame(() => {
        const container = scrollContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }

    newestMessageIdRef.current = newestId;
  }, [sortedMessages]);

  useEffect(() => {
    if (conversationId) {
      isInitialLoadRef.current = true;
      newestMessageIdRef.current = null;
    }
  }, [conversationId]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (container.scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
      const scrollHeightBefore = container.scrollHeight;
      fetchNextPage().then(() => {
        requestAnimationFrame(() => {
          const scrollHeightAfter = container.scrollHeight;
          container.scrollTop = scrollHeightAfter - scrollHeightBefore;
        });
      });
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleImagePress = useCallback(
    (messageId: string, imageIndex: number) => {
      const message = sortedMessages.find((m) => m.id === messageId);
      if (message && message.attachments.length > 0) {
        setViewerImages(message.attachments);
        setViewerInitialIndex(imageIndex);
        setViewerOpen(true);
      }
    },
    [sortedMessages],
  );

  const handleCloseViewer = useCallback(() => {
    setViewerOpen(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex flex-1 flex-col overflow-y-auto"
      >
        {isFetchingNextPage && (
          <div className="flex justify-center py-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        <div className="flex flex-1 flex-col justify-end gap-1 py-4">
          {sortedMessages.map((message, index) => {
            const prevMessage =
              index > 0 ? sortedMessages[index - 1] : undefined;
            const showDate = shouldShowDateSeparator(message, prevMessage);

            return (
              <div key={message.id}>
                {showDate && <DateSeparator date={message.createdAt} />}
                <MessageBubble
                  message={message}
                  isSent={message.senderId === userId}
                  userId={userId}
                  conversationId={conversationId}
                  senderName={
                    message.senderId === userId ? userName : otherUserName
                  }
                  senderImage={
                    message.senderId === userId ? userImage : otherUserImage
                  }
                  onImagePress={handleImagePress}
                />
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <ImageViewerModal
        images={viewerImages}
        initialIndex={viewerInitialIndex}
        open={viewerOpen}
        onClose={handleCloseViewer}
      />
    </>
  );
}
