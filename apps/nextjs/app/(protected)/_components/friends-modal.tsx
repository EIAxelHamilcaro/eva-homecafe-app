"use client";

import { Badge } from "@packages/ui/components/ui/badge";
import { Button } from "@packages/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import { Input } from "@packages/ui/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@packages/ui/components/ui/tabs";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useState } from "react";

import type { IFriendDto } from "@/application/dto/friend/friend-request.dto";
import type { IPendingRequestWithSenderDto } from "@/application/dto/friend/get-pending-requests.dto";
import {
  useFriendsQuery,
  usePendingRequestsQuery,
  useRespondRequestMutation,
  useSendFriendRequestMutation,
} from "../_hooks/use-friends";

interface FriendsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "friends" | "requests" | "invite";
}

function AvatarCircle({
  src,
  name,
  size = "md",
}: {
  src: string | null;
  name: string | null;
  size?: "sm" | "md";
}) {
  const dimension = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const initial = (name ?? "?").charAt(0).toUpperCase();

  if (src) {
    return (
      <div
        className={`relative ${dimension} shrink-0 overflow-hidden rounded-full`}
      >
        <Image src={src} alt={name ?? ""} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`${dimension} flex shrink-0 items-center justify-center rounded-full bg-homecafe-pink-light`}
    >
      <span className={`${textSize} font-semibold text-homecafe-pink-dark`}>
        {initial}
      </span>
    </div>
  );
}

const SKELETON_KEYS = ["skeleton-1", "skeleton-2", "skeleton-3"] as const;

function FriendsListSkeleton() {
  return (
    <div className="space-y-3">
      {SKELETON_KEYS.map((key) => (
        <div key={key} className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="h-3 w-40 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PaginationControls({
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-3">
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPreviousPage}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} />
      </Button>
      <span className="text-sm text-muted-foreground">
        {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={!hasNextPage}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}

function FriendItem({ friend }: { friend: IFriendDto }) {
  const displayName = friend.displayName ?? friend.name;

  return (
    <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
      <AvatarCircle src={friend.avatarUrl} name={displayName} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {displayName ?? "Utilisateur"}
        </p>
        <p className="truncate text-xs text-muted-foreground">{friend.email}</p>
      </div>
    </div>
  );
}

function FriendsTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useFriendsQuery(page);

  if (isLoading) {
    return <FriendsListSkeleton />;
  }

  const friends = data?.friends ?? [];
  const pagination = data?.pagination;

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Users size={24} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Aucun ami pour le moment
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Envoyez des invitations pour ajouter des amis
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-1">
        {friends.map((friend) => (
          <FriendItem key={friend.id} friend={friend} />
        ))}
      </div>
      {pagination && (
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

function RequestItem({ request }: { request: IPendingRequestWithSenderDto }) {
  const respondMutation = useRespondRequestMutation();
  const displayName = request.senderDisplayName ?? request.senderName;

  return (
    <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
      <AvatarCircle src={request.senderAvatarUrl} name={displayName} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {displayName ?? "Utilisateur"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {request.senderEmail}
        </p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <Button
          size="sm"
          className="h-8 bg-homecafe-green text-white hover:bg-homecafe-green/90"
          disabled={respondMutation.isPending}
          onClick={() =>
            respondMutation.mutate({ requestId: request.id, accept: true })
          }
        >
          {respondMutation.isPending &&
          respondMutation.variables?.accept === true ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
          <span className="hidden sm:inline">Accepter</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          disabled={respondMutation.isPending}
          onClick={() =>
            respondMutation.mutate({ requestId: request.id, accept: false })
          }
        >
          {respondMutation.isPending &&
          respondMutation.variables?.accept === false ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <X size={14} />
          )}
          <span className="hidden sm:inline">Refuser</span>
        </Button>
      </div>
    </div>
  );
}

function RequestsTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePendingRequestsQuery(page);

  if (isLoading) {
    return <FriendsListSkeleton />;
  }

  const requests = data?.requests ?? [];
  const pagination = data?.pagination;

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Mail size={24} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Aucune demande en attente
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-1">
        {requests.map((request) => (
          <RequestItem key={request.id} request={request} />
        ))}
      </div>
      {pagination && (
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

function InviteTab() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const sendRequestMutation = useSendFriendRequestMutation();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!email.trim()) return;

    sendRequestMutation.mutate(
      { receiverEmail: email.trim() },
      {
        onSuccess: (data) => {
          setEmail("");
          const messages: Record<string, string> = {
            request_sent: "Demande d'ami envoyee !",
            invitation_sent: "Invitation envoyee par email !",
            already_friends: "Vous etes deja amis.",
          };
          setFeedback({
            type: data.status === "already_friends" ? "error" : "success",
            message: messages[data.status] ?? data.message,
          });
        },
        onError: (error) => {
          setFeedback({
            type: "error",
            message: error.message || "Une erreur est survenue",
          });
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Input
            type="email"
            placeholder="Email de votre ami"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFeedback(null);
            }}
            disabled={sendRequestMutation.isPending}
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-homecafe-pink text-white hover:bg-homecafe-pink-dark"
          disabled={sendRequestMutation.isPending || !email.trim()}
        >
          {sendRequestMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <UserPlus size={16} />
          )}
          Envoyer une demande d&apos;ami
        </Button>
      </form>

      {feedback && (
        <div
          className={`rounded-lg p-3 text-sm ${
            feedback.type === "success"
              ? "bg-homecafe-green-light text-homecafe-green"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="border-t pt-3">
        <Link
          href="/profile"
          className="text-sm text-homecafe-blue hover:underline"
        >
          Voir mon QR code sur mon profil
        </Link>
      </div>
    </div>
  );
}

export function FriendsModal({
  open,
  onOpenChange,
  defaultTab = "friends",
}: FriendsModalProps) {
  const { data: pendingData } = usePendingRequestsQuery(1);
  const pendingCount = pendingData?.pagination.total ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Amis</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full">
            <TabsTrigger value="friends" className="flex-1">
              Amis
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex-1 gap-1.5">
              Demandes
              {pendingCount > 0 && (
                <Badge className="ml-1 h-5 min-w-5 rounded-full bg-homecafe-pink px-1.5 text-[10px] text-white">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="invite" className="flex-1">
              Inviter
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="friends"
            className="mt-4 max-h-80 overflow-y-auto"
          >
            <FriendsTab />
          </TabsContent>

          <TabsContent
            value="requests"
            className="mt-4 max-h-80 overflow-y-auto"
          >
            <RequestsTab />
          </TabsContent>

          <TabsContent value="invite" className="mt-4">
            <InviteTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
