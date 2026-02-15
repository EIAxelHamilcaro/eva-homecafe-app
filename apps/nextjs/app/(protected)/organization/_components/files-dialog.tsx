"use client";

import { Button } from "@packages/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@packages/ui/components/ui/dialog";
import { FileText, Plus, Trash2, Upload } from "lucide-react";
import { useRef } from "react";

interface FilesDialogProps {
  files: string[];
  onUpdate: (files: string[]) => void;
  trigger?: React.ReactNode;
}

export function FilesDialog({ files, onUpdate, trigger }: FilesDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFile = (fileName: string) => {
    onUpdate([...files, fileName]);
  };

  const handleRemoveFile = (index: number) => {
    onUpdate(files.filter((_, i) => i !== index));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="text-xs">{files.length}</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Fichiers ({files.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {files.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aucun fichier
            </p>
          ) : (
            <div className="max-h-[300px] space-y-1 overflow-auto">
              {files.map((file, i) => (
                <div
                  key={`${file}-${i}`}
                  className="group flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm">{file}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                    onClick={() => handleRemoveFile(i)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-3.5 w-3.5" />
              Ajouter un fichier
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAddFile(file.name);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
