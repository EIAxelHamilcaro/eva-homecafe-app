"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@packages/ui/components/ui/alert-dialog";
import { Button } from "@packages/ui/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import Image from "next/image";
import { getAvatarColor, getInitials } from "../_constants/chat";

interface ChatHeaderProps {
  name: string;
  image: string | null;
  userId: string;
  onBack?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function ChatHeader({
  name,
  image,
  userId,
  onBack,
  onDelete,
  isDeleting,
}: ChatHeaderProps) {
  const avatarColor = getAvatarColor(userId);
  const initials = getInitials(name);

  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onBack}
            className="mr-1 h-8 w-8 md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        {image ? (
          <Image
            src={image}
            alt={name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: avatarColor }}
          >
            <span className="text-sm font-semibold text-white">{initials}</span>
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold">{name}</h3>
        </div>
      </div>

      {onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer la conversation</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Tous les messages et pièces
                jointes seront définitivement supprimés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
