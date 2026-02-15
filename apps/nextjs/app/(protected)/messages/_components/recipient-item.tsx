"use client";

import Image from "next/image";
import {
  getAvatarColor,
  getInitials,
  type Recipient,
} from "../_constants/chat";

interface RecipientItemProps {
  recipient: Recipient;
  onSelect: () => void;
}

export function RecipientItem({ recipient, onSelect }: RecipientItemProps) {
  const avatarColor = getAvatarColor(recipient.id);
  const initials = getInitials(recipient.name);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-muted/50"
    >
      {recipient.image ? (
        <Image
          src={recipient.image}
          alt={recipient.name}
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
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{recipient.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {recipient.email}
        </p>
      </div>
    </button>
  );
}
