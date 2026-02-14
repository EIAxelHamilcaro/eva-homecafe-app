"use client";

import { Button } from "@packages/ui/components/ui/button";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { FriendsModal } from "./friends-modal";

export function Footer() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <footer>
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6">
          <Button
            variant="outline"
            className="rounded-full border-homecafe-pink/50 px-3 py-6 text-foreground hover:bg-homecafe-pink/5"
            onClick={() => setModalOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Inviter des ami&middot;es
          </Button>
        </div>
      </footer>

      <FriendsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultTab="invite"
      />
    </>
  );
}
