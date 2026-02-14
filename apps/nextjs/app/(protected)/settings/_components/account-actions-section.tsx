"use client";

import { Button } from "@packages/ui/components/ui/button";
import { LogOut, Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FriendsModal } from "../../_components/friends-modal";

export function AccountActionsSection() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/v1/auth/sign-out", { method: "POST" });
      router.push("/login");
    } catch {
      setLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr·e de vouloir supprimer votre compte ? Cette action est irréversible.",
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await fetch("/api/v1/auth/sign-out", { method: "POST" });
      router.push("/login");
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-3 px-2">
      <Button
        variant="ghost"
        onClick={handleLogout}
        disabled={loggingOut}
        className="flex items-center gap-3 py-2 text-sm hover:opacity-70 disabled:opacity-50"
      >
        <LogOut className="size-4" />
        <span>{loggingOut ? "Déconnexion..." : "Se déconnecter"}</span>
      </Button>

      <Button
        variant="ghost"
        onClick={handleDeleteAccount}
        disabled={deleting}
        className="flex items-center gap-3 py-2 text-sm text-destructive hover:opacity-70 disabled:opacity-50"
      >
        <Trash2 className="size-4" />
        <span>{deleting ? "Suppression..." : "Supprimer le compte"}</span>
      </Button>

      <div className="pt-4 text-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInviteModalOpen(true)}
        >
          <UserPlus className="mr-2 size-4" />
          Inviter des ami·es
        </Button>
      </div>

      <FriendsModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        defaultTab="invite"
      />
    </div>
  );
}
