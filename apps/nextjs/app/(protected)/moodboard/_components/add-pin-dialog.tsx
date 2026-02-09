"use client";

import { Button } from "@packages/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@packages/ui/components/ui/dialog";
import { Input } from "@packages/ui/components/ui/input";
import { Label } from "@packages/ui/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@packages/ui/components/ui/tabs";
import { useCallback, useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;
const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

interface AddPinDialogProps {
  moodboardId: string;
  onPinAdded: () => void;
}

export function AddPinDialog({ moodboardId, onPinAdded }: AddPinDialogProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("image");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [color, setColor] = useState("#FF5733");
  const [hexInput, setHexInput] = useState("#FF5733");

  const inputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setError(null);
    setLoading(false);
    setColor("#FF5733");
    setHexInput("#FF5733");
    setTab("image");
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        resetState();
      }
    },
    [resetState],
  );

  const addImagePin = useCallback(
    async (file: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Only JPEG, PNG, GIF, and WebP images are accepted.");
        return;
      }

      if (file.size > MAX_SIZE) {
        setError("File must be 10MB or smaller.");
        return;
      }

      setLoading(true);

      try {
        const presignedRes = await fetch("/api/v1/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: "moodboard",
            filename: file.name,
            mimeType: file.type,
            size: file.size,
          }),
        });

        if (!presignedRes.ok) {
          const data = await presignedRes.json();
          throw new Error(data.error || "Failed to get upload URL");
        }

        const { uploadUrl, fileUrl } = await presignedRes.json();

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload file to storage");
        }

        const pinRes = await fetch(`/api/v1/moodboards/${moodboardId}/pins`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "image", imageUrl: fileUrl }),
        });

        if (!pinRes.ok) {
          const data = await pinRes.json();
          throw new Error(data.error || "Failed to add pin");
        }

        setOpen(false);
        resetState();
        onPinAdded();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setLoading(false);
      }
    },
    [moodboardId, onPinAdded, resetState],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        addImagePin(file);
      }
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [addImagePin],
  );

  const handleColorSubmit = useCallback(async () => {
    if (!HEX_REGEX.test(color)) {
      setError("Please enter a valid hex color (e.g. #FF5733)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/moodboards/${moodboardId}/pins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "color", color }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add color pin");
      }

      setOpen(false);
      resetState();
      onPinAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add pin");
    } finally {
      setLoading(false);
    }
  }, [color, moodboardId, onPinAdded, resetState]);

  const handleHexInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setHexInput(val);
      if (HEX_REGEX.test(val)) {
        setColor(val);
      }
    },
    [],
  );

  const handleColorPickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setColor(val);
      setHexInput(val);
    },
    [],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">Add Pin</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Pin</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="image" className="flex-1" disabled={loading}>
              Image
            </TabsTrigger>
            <TabsTrigger value="color" className="flex-1" disabled={loading}>
              Color
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="space-y-4 pt-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              disabled={loading}
              className="hidden"
              id="pin-image-upload"
            />
            <label
              htmlFor="pin-image-upload"
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
                loading
                  ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              <span className="text-3xl">🖼️</span>
              <span className="font-medium text-sm">
                {loading ? "Uploading..." : "Click to upload an image"}
              </span>
              <span className="text-muted-foreground text-xs">
                JPEG, PNG, GIF, WebP — max 10MB
              </span>
            </label>
          </TabsContent>

          <TabsContent value="color" className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div
                className="h-16 w-16 shrink-0 rounded-lg border"
                style={{ backgroundColor: color }}
              />
              <div className="flex flex-1 flex-col gap-2">
                <div className="space-y-1">
                  <Label htmlFor="pin-color-picker">Color Picker</Label>
                  <input
                    id="pin-color-picker"
                    type="color"
                    value={color}
                    onChange={handleColorPickerChange}
                    disabled={loading}
                    className="h-10 w-full cursor-pointer rounded border"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pin-hex-input">Hex Code</Label>
                  <Input
                    id="pin-hex-input"
                    placeholder="#FF5733"
                    value={hexInput}
                    onChange={handleHexInputChange}
                    maxLength={7}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleColorSubmit}
                disabled={loading || !HEX_REGEX.test(color)}
              >
                {loading ? "Adding..." : "Add Color"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>

        {error && <p className="text-destructive text-sm">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
