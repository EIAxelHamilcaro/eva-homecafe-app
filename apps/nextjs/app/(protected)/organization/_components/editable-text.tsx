"use client";

import { Input } from "@packages/ui/components/ui/input";
import { Textarea } from "@packages/ui/components/ui/textarea";
import { useEffect, useRef, useState } from "react";

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  multiline?: boolean;
}

export function EditableText({
  value,
  onSave,
  placeholder = "Cliquer pour éditer",
  className = "",
  inputClassName = "",
  multiline = false,
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleSave = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setDraft(value);
    }
  };

  if (editing) {
    const sharedProps = {
      value: draft,
      onBlur: handleSave,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSave();
        }
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      },
      className: `h-7 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-300 ${inputClassName}`,
    };

    if (multiline) {
      return (
        <Textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          {...sharedProps}
          onChange={(e) => setDraft(e.target.value)}
          className={`${sharedProps.className} min-h-[60px] resize-none`}
        />
      );
    }

    return (
      <Input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        {...sharedProps}
        onChange={(e) => setDraft(e.target.value)}
      />
    );
  }

  return (
    <button
      type="button"
      className={`cursor-pointer rounded px-1 py-0.5 text-left transition-colors hover:bg-muted/50 ${className}`}
      onClick={() => setEditing(true)}
    >
      {value || (
        <span className="italic text-muted-foreground">{placeholder}</span>
      )}
    </button>
  );
}
