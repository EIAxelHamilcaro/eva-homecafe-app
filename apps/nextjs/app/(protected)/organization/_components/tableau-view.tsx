"use client";

import { Button } from "@packages/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import { Input } from "@packages/ui/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  useCreateTableauMutation,
  useDeleteTableauMutation,
  useTableauxQuery,
} from "@/app/(protected)/_hooks/use-tableaux";
import { TableauBoard } from "./tableau-board";

export function TableauView() {
  const { data, isLoading } = useTableauxQuery();
  const createTableau = useCreateTableauMutation();
  const deleteTableau = useDeleteTableauMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createTableau.mutate(
      { title: newTitle.trim() },
      {
        onSuccess: () => {
          setNewTitle("");
          setDialogOpen(false);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  const tableaux = data?.tableaux ?? [];

  return (
    <div className="flex flex-col gap-4">
      {tableaux.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="mb-2 text-lg font-medium">Aucun tableau.</p>
          <p className="text-sm text-muted-foreground">
            Créez un tableau pour organiser vos tâches.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {tableaux.map((tableau) => (
            <TableauBoard
              key={tableau.id}
              tableau={tableau}
              onDeleteTableau={() =>
                deleteTableau.mutate({ tableauId: tableau.id })
              }
            />
          ))}
        </div>
      )}

      <Button
        variant="outline"
        onClick={() => setDialogOpen(true)}
        className="w-full shrink-0 gap-2 border-dashed border-blue-200"
      >
        <Plus className="h-4 w-4" />
        Ajouter un Nouveau Tableau
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un tableau</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Titre du tableau"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              autoFocus
            />
            <Button
              onClick={handleCreate}
              disabled={!newTitle.trim() || createTableau.isPending}
              className="w-full"
            >
              {createTableau.isPending ? "Création..." : "Créer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
