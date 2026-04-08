import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRenameFile } from "@/features/files/useRenameFile";
import type { FileId } from "@/types";
import { Check, Pencil, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface InlineRenameProps {
  fileId: FileId;
  currentName: string;
}

export default function InlineRename({
  fileId,
  currentName,
}: InlineRenameProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: rename, isPending } = useRenameFile();

  // Sync if parent changes name (after successful rename)
  useEffect(() => {
    if (!editing) setValue(currentName);
  }, [currentName, editing]);

  const startEdit = () => {
    setValue(currentName);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const cancel = () => {
    setValue(currentName);
    setEditing(false);
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === currentName) {
      cancel();
      return;
    }
    rename(
      { fileId, newName: trimmed },
      { onSettled: () => setEditing(false) },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit();
    else if (e.key === "Escape") cancel();
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 min-w-0">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          className="h-7 text-sm py-1 px-2 min-w-0 w-36"
          data-ocid="rename-input"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-primary hover:text-primary"
          onClick={submit}
          disabled={isPending}
          aria-label="Confirm rename"
          data-ocid="rename-confirm-btn"
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={cancel}
          disabled={isPending}
          aria-label="Cancel rename"
          data-ocid="rename-cancel-btn"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 min-w-0 group">
      <span className="truncate font-medium text-sm">{currentName}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={startEdit}
        aria-label={`Rename ${currentName}`}
        data-ocid="rename-trigger-btn"
      >
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
  );
}
